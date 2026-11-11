import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { studentTopicStates, wrongQuestions } from "@/db/schema";
import type { GeneratedQuestionInstance, RegionCode } from "@/types/taxonomy";
import { generateQuestion } from "@/lib/engines/item-generator";
import { gradeQuestionResponse } from "@/lib/engines/grader";
import {
  scheduleFsrsReview,
  type FsrsRating,
  type WrongQuestionStatus,
} from "@/lib/engines/fsrs-engine";
import { recordStudentAttemptAndCalibrateIrt } from "@/lib/record-irt-attempt";
import { authorizeStudentAccess } from "@/lib/auth/session";
import { syncStudentProgressSideEffects } from "@/lib/progress-sync";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = body.action as string;

    // 1. Spawn a brand-new anti-memorization Twin Variant for a wrong question
    if (action === "spawn_twin") {
      const wrongQuestionId = body.wrongQuestionId as string;
      const regionCode = (body.regionCode as RegionCode) ?? "CN";
      const variantIndex = Number(body.variantIndex ?? Math.floor(Math.random() * 900) + 1);

      const rows = await db
        .select()
        .from(wrongQuestions)
        .where(eq(wrongQuestions.id, wrongQuestionId));

      if (!rows[0]) {
        return NextResponse.json(
          { ok: false, error: "Wrong question record not found" },
          { status: 404 }
        );
      }

      const wq = rows[0];
      const access = await authorizeStudentAccess(req, wq.studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
        );
      }

      const twinInstance = generateQuestion({
        templateId: wq.templateId,
        topicId: wq.topicId,
        difficulty: "standard",
        regionCode,
        seed: `twin_${wq.id}_${Date.now()}`,
        variantIndex,
      });

      return NextResponse.json({
        ok: true,
        twinInstance,
      });
    }

    // 2. Grade Twin Variant attempt & update FSRS DSR + Twin-Clearance Streak
    if (action === "submit_twin") {
      const wrongQuestionId = body.wrongQuestionId as string;
      const twinInstance = body.twinInstance as GeneratedQuestionInstance;
      const userAnswer = String(body.userAnswer ?? "");
      const requestedRating = Number(body.selfRating ?? 3) as FsrsRating;

      const rows = await db
        .select()
        .from(wrongQuestions)
        .where(eq(wrongQuestions.id, wrongQuestionId));

      if (!rows[0]) {
        return NextResponse.json(
          { ok: false, error: "Wrong question not found" },
          { status: 404 }
        );
      }

      const wq = rows[0];
      const access = await authorizeStudentAccess(req, wq.studentId);
      if (!access.allowed) {
        return NextResponse.json(
          { ok: false, error: access.reason ?? "Forbidden" },
          { status: 403 }
        );
      }

      const grade = gradeQuestionResponse(twinInstance, userAnswer);
      const effectiveRating: FsrsRating = grade.isCorrect
        ? (Math.max(2, Math.min(4, requestedRating)) as FsrsRating)
        : 1;

      const scheduled = scheduleFsrsReview(
        {
          difficulty: wq.fsrsDifficulty,
          stability: wq.fsrsStability,
          reps: wq.reps,
          lapses: wq.lapses,
          twinClearStreak: wq.twinClearStreak,
          status: wq.status as WrongQuestionStatus,
          lastReviewedAt: wq.lastReviewedAt,
          nextReviewAt: wq.nextReviewAt,
        },
        effectiveRating
      );

      await db
        .update(wrongQuestions)
        .set({
          status: scheduled.status,
          fsrsDifficulty: scheduled.difficulty,
          fsrsStability: scheduled.stability,
          reps: scheduled.reps,
          lapses: scheduled.lapses,
          twinClearStreak: scheduled.twinClearStreak,
          lastReviewedAt: scheduled.lastReviewedAt,
          nextReviewAt: scheduled.nextReviewAt,
        })
        .where(eq(wrongQuestions.id, wrongQuestionId));

      const newlyMasteredTopicIds: string[] = [];

      // Also sync upward into Student Topic State!
      if (grade.isCorrect) {
        const stRows = await db
          .select()
          .from(studentTopicStates)
          .where(
            and(
              eq(studentTopicStates.studentId, wq.studentId),
              eq(studentTopicStates.topicId, wq.topicId)
            )
          );
        if (stRows[0]) {
          const upgradedStatus =
            scheduled.status === "cleared"
              ? "mastered"
              : stRows[0].status === "weak"
                ? "shaky"
                : stRows[0].status;
          if (
            upgradedStatus === "mastered" &&
            stRows[0].status !== "mastered" &&
            stRows[0].status !== "inferred_mastered"
          ) {
            newlyMasteredTopicIds.push(wq.topicId);
          }
          const upgradedPMastery =
            scheduled.status === "cleared"
              ? Math.max(0.88, stRows[0].pMastery)
              : Math.min(0.95, stRows[0].pMastery + 0.16);
          await db
            .update(studentTopicStates)
            .set({
              status: upgradedStatus,
              pMastery: Math.round(upgradedPMastery * 100) / 100,
              isRootCause: scheduled.status === "cleared" ? false : stRows[0].isRootCause,
              fsrsDifficulty: scheduled.difficulty,
              fsrsStability: scheduled.stability,
              lastPracticedAt: scheduled.lastReviewedAt,
              nextReviewAt: scheduled.nextReviewAt,
            })
            .where(
              and(
                eq(studentTopicStates.studentId, wq.studentId),
                eq(studentTopicStates.topicId, wq.topicId)
              )
            );
        } else if (scheduled.status === "cleared") {
          await db.insert(studentTopicStates).values({
            studentId: wq.studentId,
            topicId: wq.topicId,
            status: "mastered",
            pMastery: 0.9,
            attemptsCount: 3,
            correctCount: 3,
            isRootCause: false,
            fsrsDifficulty: scheduled.difficulty,
            fsrsStability: scheduled.stability,
            lastPracticedAt: scheduled.lastReviewedAt,
            nextReviewAt: scheduled.nextReviewAt,
          });
          newlyMasteredTopicIds.push(wq.topicId);
        }
      }

      const [, syncResult] = await Promise.all([
        recordStudentAttemptAndCalibrateIrt({
          studentId: wq.studentId,
          regionCode: (body.regionCode as RegionCode) ?? "CN",
          topicId: wq.topicId,
          templateId: twinInstance.templateId,
          difficulty: twinInstance.difficulty,
          isCorrect: grade.isCorrect,
          pMasteryAfter: grade.isCorrect ? 0.78 : 0.3,
        }),
        syncStudentProgressSideEffects({
          studentId: wq.studentId,
          newlyMasteredTopicIds,
          minutesDelta: 2,
        }),
      ]);

      return NextResponse.json({
        ok: true,
        grade,
        scheduled,
        syncResult,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Wrong-book API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
