import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  customSchoolEdges,
  diagnosticSessions,
  studentTopicStates,
  wrongQuestions,
} from "@/db/schema";
import type {
  DiagnosticSessionState,
  DifficultyTier,
  EdgeRelationType,
  GeneratedQuestionInstance,
  LocaleCode,
  MasteryStatus,
  RegionCode,
  SubjectId,
} from "@/types/taxonomy";
import { c, localizeText, uiPick } from "@/lib/i18n";
import {
  applyDiagnosticAnswer,
  createDiagnosticSession,
  getAncestors,
  getNextDiagnosticQuestion,
  getTopicById,
  summarizeDiagnosis,
  topologicalSort,
  updateBktMastery,
  type CustomEdgeRef,
} from "@/lib/engines/dag-engine";
import { generateQuestion } from "@/lib/engines/item-generator";
import {
  computeRetrievability,
  createInitialWrongCard,
  getElapsedDays,
} from "@/lib/engines/fsrs-engine";
import { masteryToTheta } from "@/lib/engines/irt-engine";
import { recordStudentAttemptAndCalibrateIrt } from "@/lib/record-irt-attempt";
import { authorizeStudentAccess } from "@/lib/auth/session";
import {
  loadIrtStatsByTopic,
  syncStudentProgressSideEffects,
} from "@/lib/progress-sync";

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
      const access = await authorizeStudentAccess(req, studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
        );
      }

      const subjectId = (body.subjectId as SubjectId) || "math";
      const regionCode = (body.regionCode as RegionCode) || "CN";
      const locale: LocaleCode = (body.locale as LocaleCode) || "zh-CN";
      const mode = (body.mode as "target" | "chapter" | "grade_screen") || "target";
      const targetTopicIds = (body.targetTopicIds as string[]) || [
        "mt_math_quad_complete_sq",
      ];
      const confirmRequired = Number(body.confirmRequired ?? 2);
      const maxQuestions = Number(body.maxQuestions ?? 12);
      const coldStart = Boolean(body.coldStart);

      const [schoolEdgeRows, studentStates, irtStatsByTopic] = await Promise.all([
        db.select().from(customSchoolEdges),
        db
          .select()
          .from(studentTopicStates)
          .where(eq(studentTopicStates.studentId, studentId)),
        loadIrtStatsByTopic(),
      ]);

      const extraEdges: CustomEdgeRef[] = schoolEdgeRows.map((e) => ({
        topicId: e.topicId,
        prerequisiteId: e.prerequisiteId,
        relationType: (e.relationType as EdgeRelationType) || "hard",
        reasonZh: e.reasonZh,
        reasonEn: e.reasonEn,
      }));

      const now = new Date();
      const nowIso = now.toISOString();

      const studentTheta =
        studentStates.length > 0
          ? masteryToTheta(
              studentStates.reduce((acc, s) => acc + s.pMastery, 0) /
                studentStates.length
            )
          : 0;

      // Warm-Start CAT: pre-verify high-retrievability (R >= 0.85) upstream prerequisites
      // from FSRS memory state so students never re-take trivial mastered prerequisites.
      const initialKnownMastery: Record<string, MasteryStatus> = {};
      let warmStartSkippedCount = 0;

      if (!coldStart && studentStates.length > 0) {
        const ancestors = getAncestors(targetTopicIds, true, extraEdges);
        const scopeIds = topologicalSort(
          [...new Set([...targetTopicIds, ...ancestors])],
          regionCode,
          extraEdges
        );
        const targetSet = new Set(targetTopicIds);
        const stateByTopic = new Map(studentStates.map((s) => [s.topicId, s]));

        for (const tid of scopeIds) {
          // Single-target diagnostic always verifies the explicitly requested target node
          if (targetTopicIds.length === 1 && targetSet.has(tid)) {
            continue;
          }
          const st = stateByTopic.get(tid);
          if (!st) continue;
          if (st.status !== "mastered" && st.status !== "inferred_mastered") {
            continue;
          }
          const elapsedDays = st.lastPracticedAt
            ? getElapsedDays(st.lastPracticedAt, now)
            : 0;
          const retrievability = computeRetrievability(
            Math.max(st.fsrsStability, 3),
            elapsedDays
          );
          if (retrievability >= 0.85) {
            initialKnownMastery[tid] = "inferred_mastered";
            warmStartSkippedCount += 1;
          }
        }

        // If a multi-topic pack had EVERY target already mastered, keep the highest target untested
        // so starting a diagnostic session never terminates with 0 questions.
        if (targetTopicIds.length > 1) {
          const orderedTargets = topologicalSort(
            targetTopicIds,
            regionCode,
            extraEdges
          );
          const allTargetsSkipped = orderedTargets.every(
            (tid) => initialKnownMastery[tid] === "inferred_mastered"
          );
          if (allTargetsSkipped && orderedTargets.length > 0) {
            const topTarget = orderedTargets[orderedTargets.length - 1];
            delete initialKnownMastery[topTarget];
            warmStartSkippedCount = Math.max(0, warmStartSkippedCount - 1);
          }
        }
      }

      const session = createDiagnosticSession({
        studentId,
        subjectId,
        regionCode,
        mode,
        targetTopicIds,
        confirmRequired,
        maxQuestions,
        extraEdges,
        initialKnownMastery,
        studentTheta,
        warmStartSkippedCount,
      });

      const nextPrompt = getNextDiagnosticQuestion(session, { irtStatsByTopic });

      await db.insert(diagnosticSessions).values({
        id: session.sessionId,
        studentId,
        subjectId,
        regionCode,
        label:
          body.label ||
          uiPick(
            locale,
            c(
              `靶向诊断 (${targetTopicIds.length} 节点 · ${regionCode})`,
              `Targeted Diagnostic (${targetTopicIds.length} nodes · ${regionCode})`,
              `ターゲット診断 (${targetTopicIds.length} 単元 · ${regionCode})`,
              `타깃 진단 (${targetTopicIds.length} 노드 · ${regionCode})`,
              `Diagnostik Sasaran (${targetTopicIds.length} topik · ${regionCode})`
            )
          ),
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
      const locale: LocaleCode = (body.locale as LocaleCode) || "zh-CN";
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

      const access = await authorizeStudentAccess(req, session.studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
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

      const newlyMasteredTopicIds: string[] = [];
      if (
        resolvedStatus === "mastered" &&
        prevState?.status !== "mastered" &&
        prevState?.status !== "inferred_mastered"
      ) {
        newlyMasteredTopicIds.push(instance.topicId);
      }

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
            fsrsStability: 6.0,
            lastPracticedAt: nowIso,
            nextReviewAt: nowIso,
          });
          newlyMasteredTopicIds.push(ancId);
        } else if (ancRows[0].status === "untested") {
          await db
            .update(studentTopicStates)
            .set({
              status: "inferred_mastered",
              pMastery: 0.85,
              fsrsStability: Math.max(ancRows[0].fsrsStability, 6.0),
              lastPracticedAt: nowIso,
            })
            .where(
              and(
                eq(studentTopicStates.studentId, session.studentId),
                eq(studentTopicStates.topicId, ancId)
              )
            );
          newlyMasteredTopicIds.push(ancId);
        }
      }

      // Update live latent trait ability theta for closed-loop MFI item selection
      session.studentTheta = masteryToTheta(nextPMastery);

      // Auto-capture wrong answers into the FSRS Wrong-Question Book!
      if (!outcome.isCorrect) {
        const topic = getTopicById(instance.topicId);
        const matchedMisc = topic?.microLesson.misconceptions.find(
          (m) => m.tag === outcome.detectedMisconception
        );
        const fallbackMisc = matchedMisc ?? topic?.microLesson.misconceptions[0];
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
                outcome.detectedMisconception ??
                existingWq[0].misconceptionTag ??
                fallbackMisc?.tag ??
                null,
              misconceptionLabel: matchedMisc
                ? localizeText(matchedMisc.label, locale, false)
                : existingWq[0].misconceptionLabel,
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
            misconceptionTag:
              outcome.detectedMisconception ?? fallbackMisc?.tag ?? null,
            misconceptionLabel: fallbackMisc
              ? localizeText(fallbackMisc.label, locale, false)
              : uiPick(
                  locale,
                  c(
                    "概念细节待强化",
                    "Conceptual detail needs reinforcement",
                    "概念の細部を強化",
                    "개념 세부 사항 보강 필요",
                    "Perincian konsep perlu diperkukuh"
                  )
                ),
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

      const [irtStatsByTopic, syncResult] = await Promise.all([
        session.finished ? Promise.resolve(undefined) : loadIrtStatsByTopic(),
        syncStudentProgressSideEffects({
          studentId: session.studentId,
          newlyMasteredTopicIds,
          minutesDelta: 2,
        }),
      ]);

      const nextPrompt = session.finished
        ? null
        : getNextDiagnosticQuestion(session, { irtStatsByTopic });
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
        syncResult,
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
