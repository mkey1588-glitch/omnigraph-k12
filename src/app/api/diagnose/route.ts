import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  diagnosticSessions,
  studentTopicStates,
  wrongQuestions,
} from "@/db/schema";
import type {
  DiagnosticSessionState,
  DifficultyTier,
  GeneratedQuestionInstance,
  RegionCode,
  SubjectId,
} from "@/types/taxonomy";
import {
  applyDiagnosticAnswer,
  createDiagnosticSession,
  getNextDiagnosticQuestion,
  getTopicById,
  summarizeDiagnosis,
  updateBktMastery,
} from "@/lib/engines/dag-engine";
import { generateQuestion } from "@/lib/engines/item-generator";
import { createInitialWrongCard } from "@/lib/engines/fsrs-engine";
import { recordStudentAttemptAndCalibrateIrt } from "@/lib/record-irt-attempt";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = body.action as string;

    // 1. Generate a standalone parameterized question preview / twin practice
    if (action === "preview_question") {
      const instance = generateQuestion({
        topicId: body.topicId as string,
        difficulty: (body.difficulty as DifficultyTier) ?? "standard",
        regionCode: (body.regionCode as RegionCode) ?? "CN",
        seed: (body.seed as string) ?? `prev_${Date.now()}`,
        variantIndex: Number(body.variantIndex ?? 0),
      });
      return NextResponse.json({ ok: true, instance });
    }

    // 2. Start a new Adaptive Prerequisite Diagnostic Session
    if (action === "start") {
      const studentId = (body.studentId as string) || "stu_leo";
      const subjectId = (body.subjectId as SubjectId) || "math";
      const regionCode = (body.regionCode as RegionCode) || "CN";
      const mode = (body.mode as "target" | "chapter" | "grade_screen") || "target";
      const targetTopicIds = (body.targetTopicIds as string[]) || [
        "mt_math_quad_complete_sq",
      ];
      const confirmRequired = Number(body.confirmRequired ?? 2);
      const maxQuestions = Number(body.maxQuestions ?? 12);

      const session = createDiagnosticSession({
        studentId,
        subjectId,
        regionCode,
        mode,
        targetTopicIds,
        confirmRequired,
        maxQuestions,
      });

      const nextPrompt = getNextDiagnosticQuestion(session);
      const nowIso = new Date().toISOString();

      await db.insert(diagnosticSessions).values({
        id: session.sessionId,
        studentId,
        subjectId,
        regionCode,
        label:
          body.label ||
          `靶向诊断 (${targetTopicIds.length} 节点 · ${regionCode})`,
        stateJson: session,
        weakRootsJson: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      return NextResponse.json({
        ok: true,
        session,
        nextPrompt,
      });
    }

    // 3. Submit an answer in an active Adaptive Diagnostic Session
    if (action === "answer") {
      const sessionId = body.sessionId as string;
      const instance = body.instance as GeneratedQuestionInstance;
      const userAnswer = String(body.userAnswer ?? "");
      const whyAskedZh = String(body.whyAskedZh ?? "");
      const whyAskedEn = String(body.whyAskedEn ?? "");

      const existingRows = await db
        .select()
        .from(diagnosticSessions)
        .where(eq(diagnosticSessions.id, sessionId));

      const session: DiagnosticSessionState =
        existingRows[0]?.stateJson ?? (body.session as DiagnosticSessionState);

      if (!session) {
        return NextResponse.json(
          { ok: false, error: "Diagnostic session not found" },
          { status: 404 }
        );
      }

      const outcome = applyDiagnosticAnswer(
        session,
        instance,
        userAnswer,
        whyAskedZh,
        whyAskedEn
      );

      const now = new Date();
      const nowIso = now.toISOString();

      // Update Student Topic State in SQLite via BKT + DAG status
      const prevStateRows = await db
        .select()
        .from(studentTopicStates)
        .where(
          and(
            eq(studentTopicStates.studentId, session.studentId),
            eq(studentTopicStates.topicId, instance.topicId)
          )
        );

      const prevState = prevStateRows[0];
      const nextPMastery = updateBktMastery(
        prevState?.pMastery ?? 0.35,
        outcome.isCorrect,
        instance.difficulty
      );
      const resolvedStatus =
        outcome.updatedTopicStatus !== "untested"
          ? outcome.updatedTopicStatus
          : prevState?.status ?? "untested";

      if (prevState) {
        await db
          .update(studentTopicStates)
          .set({
            status: resolvedStatus,
            pMastery:
              resolvedStatus === "mastered"
                ? Math.max(0.88, nextPMastery)
                : resolvedStatus === "weak"
                  ? Math.min(0.32, nextPMastery)
                  : nextPMastery,
            attemptsCount: prevState.attemptsCount + 1,
            correctCount: prevState.correctCount + (outcome.isCorrect ? 1 : 0),
            lastMisconception:
              outcome.detectedMisconception ?? prevState.lastMisconception,
            lastPracticedAt: nowIso,
          })
          .where(
            and(
              eq(studentTopicStates.studentId, session.studentId),
              eq(studentTopicStates.topicId, instance.topicId)
            )
          );
      } else {
        await db.insert(studentTopicStates).values({
          studentId: session.studentId,
          topicId: instance.topicId,
          status: resolvedStatus,
          pMastery: nextPMastery,
          attemptsCount: 1,
          correctCount: outcome.isCorrect ? 1 : 0,
          isRootCause: false,
          lastMisconception: outcome.detectedMisconception ?? null,
          fsrsDifficulty: outcome.isCorrect ? 4.5 : 6.8,
          fsrsStability: outcome.isCorrect ? 6.0 : 0.5,
          lastPracticedAt: nowIso,
          nextReviewAt: nowIso,
        });
      }

      // Spin Online Elo-IRT 2PL Data Flywheel + Anonymized Attempt Log
      await recordStudentAttemptAndCalibrateIrt({
        studentId: session.studentId,
        regionCode: session.regionCode,
        topicId: instance.topicId,
        templateId: instance.templateId,
        difficulty: instance.difficulty,
        isCorrect: outcome.isCorrect,
        pMasteryAfter: nextPMastery,
      });

      // Persist Ancestor Mastery Closure Pruning (`inferred_mastered`)!
      for (const ancId of outcome.prunedAncestors) {
        const ancRows = await db
          .select()
          .from(studentTopicStates)
          .where(
            and(
              eq(studentTopicStates.studentId, session.studentId),
              eq(studentTopicStates.topicId, ancId)
            )
          );
        if (!ancRows[0]) {
          await db.insert(studentTopicStates).values({
            studentId: session.studentId,
            topicId: ancId,
            status: "inferred_mastered",
            pMastery: 0.85,
            attemptsCount: 0,
            correctCount: 0,
            isRootCause: false,
            lastPracticedAt: nowIso,
            nextReviewAt: nowIso,
          });
        } else if (ancRows[0].status === "untested") {
          await db
            .update(studentTopicStates)
            .set({ status: "inferred_mastered", pMastery: 0.85 })
            .where(
              and(
                eq(studentTopicStates.studentId, session.studentId),
                eq(studentTopicStates.topicId, ancId)
              )
            );
        }
      }

      // Auto-capture wrong answers into the FSRS Wrong-Question Book!
      if (!outcome.isCorrect) {
        const topic = getTopicById(instance.topicId);
        const matchedMisc = topic?.microLesson.misconceptions.find(
          (m) => m.tag === outcome.detectedMisconception
        );
        const card = createInitialWrongCard(now);
        const wqId = `wq_${session.studentId}_${instance.topicId}`;

        const existingWq = await db
          .select()
          .from(wrongQuestions)
          .where(eq(wrongQuestions.id, wqId));

        if (existingWq[0]) {
          await db
            .update(wrongQuestions)
            .set({
              questionSnapshotJson: instance,
              wrongUserAnswer: userAnswer,
              misconceptionTag:
                outcome.detectedMisconception ?? existingWq[0].misconceptionTag,
              misconceptionLabel:
                matchedMisc?.label["zh-CN"] ?? existingWq[0].misconceptionLabel,
              status: "active",
              lapses: existingWq[0].lapses + 1,
              twinClearStreak: 0,
              lastReviewedAt: nowIso,
              nextReviewAt: card.nextReviewAt,
            })
            .where(eq(wrongQuestions.id, wqId));
        } else {
          await db.insert(wrongQuestions).values({
            id: wqId,
            studentId: session.studentId,
            topicId: instance.topicId,
            templateId: instance.templateId,
            questionSnapshotJson: instance,
            wrongUserAnswer: userAnswer,
            misconceptionTag: outcome.detectedMisconception ?? null,
            misconceptionLabel:
              matchedMisc?.label["zh-CN"] ??
              topic?.microLesson.misconceptions[0]?.label["zh-CN"] ??
              "概念细节待强化",
            status: "active",
            fsrsDifficulty: card.difficulty,
            fsrsStability: card.stability,
            reps: 0,
            lapses: 1,
            twinClearStreak: 0,
            createdAt: nowIso,
            lastReviewedAt: nowIso,
            nextReviewAt: card.nextReviewAt,
          });
        }
      }

      const nextPrompt = session.finished
        ? null
        : getNextDiagnosticQuestion(session);
      const summary = session.finished ? summarizeDiagnosis(session) : null;

      if (summary) {
        for (const rootId of summary.weakRootIds) {
          await db
            .update(studentTopicStates)
            .set({ isRootCause: true })
            .where(
              and(
                eq(studentTopicStates.studentId, session.studentId),
                eq(studentTopicStates.topicId, rootId)
              )
            );
        }
      }

      if (existingRows[0]) {
        await db
          .update(diagnosticSessions)
          .set({
            stateJson: session,
            weakRootsJson: summary?.weakRootIds ?? [],
            updatedAt: nowIso,
          })
          .where(eq(diagnosticSessions.id, sessionId));
      }

      return NextResponse.json({
        ok: true,
        session,
        outcome,
        nextPrompt,
        summary,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Diagnose API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
