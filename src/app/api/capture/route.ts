import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  privacyAuditLogs,
  studentTopicStates,
  users,
  wrongQuestions,
} from "@/db/schema";
import type {
  GeneratedQuestionInstance,
  RegionCode,
  SubjectId,
} from "@/types/taxonomy";
import { sanitizeForExternalAi } from "@/lib/engines/privacy-shield";
import { analyzeCapturedWrongQuestion } from "@/lib/engines/smart-capture-and-paper";
import { createInitialWrongCard } from "@/lib/engines/fsrs-engine";
import { generateQuestion } from "@/lib/engines/item-generator";

export async function POST(req: Request) {
  try {
    await ensureSeeded(false);
    const body = await req.json();
    const action = String(body.action ?? "analyze");

    if (action === "analyze") {
      const rawQuestionText = String(body.rawQuestionText ?? "");
      const studentWrongAnswer = String(body.studentWrongAnswer ?? "").trim();
      const studentId = String(body.studentId || "stu_leo");
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const preferredSubjectId = (body.preferredSubjectId as SubjectId | "all") || "all";

      if (rawQuestionText.trim().length < 3) {
        return NextResponse.json(
          { ok: false, error: "请输入或上传至少 3 个字符的错题题干描述。" },
          { status: 400 }
        );
      }

      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, studentId));

      const shield = sanitizeForExternalAi({
        rawText: rawQuestionText,
        userId: studentId,
        displayName: userRows[0]?.displayName,
        regionCode,
      });

      await db.insert(privacyAuditLogs).values({
        id: `pal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorAnonToken: shield.anonToken,
        regionCode,
        regulation: shield.regulation,
        endpoint: "/api/capture",
        redactedFieldsJson:
          shield.redactedTypes.length > 0
            ? shield.redactedTypes
            : ["NO_RAW_PII_DETECTED"],
        payloadPreview: shield.sanitizedText.slice(0, 150),
      });

      const analysis = analyzeCapturedWrongQuestion({
        sanitizedQuestionText: shield.sanitizedText,
        studentWrongAnswer: studentWrongAnswer || undefined,
        regionCode,
        preferredSubjectId,
      });

      return NextResponse.json({
        ok: true,
        analysis,
        privacyShield: shield,
      });
    }

    if (action === "save_to_wrong_book") {
      const studentId = String(body.studentId || "stu_leo");
      const regionCode = ((body.regionCode as RegionCode) || "CN") as RegionCode;
      const topicId = String(body.topicId ?? "");
      const snapshot = body.canonicalSnapshot as GeneratedQuestionInstance;
      const wrongUserAnswer = String(body.wrongUserAnswer || "待订正作答");
      const misconceptionTag = String(body.misconceptionTag || "misc_captured");
      const misconceptionLabel = String(
        body.misconceptionLabel || "智能录题识别概念易错点"
      );

      const now = new Date();
      const nowIso = now.toISOString();
      const card = createInitialWrongCard(now);
      const newId = `wq_cap_${Date.now().toString(36)}`;

      await db.insert(wrongQuestions).values({
        id: newId,
        studentId,
        topicId,
        templateId: snapshot.templateId,
        questionSnapshotJson: snapshot,
        wrongUserAnswer,
        misconceptionTag,
        misconceptionLabel,
        status: card.status,
        fsrsDifficulty: card.difficulty,
        fsrsStability: card.stability,
        reps: card.reps,
        lapses: card.lapses,
        twinClearStreak: card.twinClearStreak,
        createdAt: nowIso,
        lastReviewedAt: card.lastReviewedAt,
        nextReviewAt: card.nextReviewAt,
      });

      // Mark topic as at least 'shaky' if untested so student knowledge map highlights it
      const existingState = await db
        .select()
        .from(studentTopicStates)
        .where(
          and(
            eq(studentTopicStates.studentId, studentId),
            eq(studentTopicStates.topicId, topicId)
          )
        );

      if (!existingState[0]) {
        await db.insert(studentTopicStates).values({
          studentId,
          topicId,
          status: "weak",
          pMastery: 0.3,
          attemptsCount: 1,
          correctCount: 0,
          isRootCause: false,
          lastMisconception: misconceptionTag,
          fsrsDifficulty: card.difficulty,
          fsrsStability: card.stability,
          lastPracticedAt: nowIso,
          nextReviewAt: card.nextReviewAt,
        });
      }

      const nextTwin = generateQuestion({
        topicId,
        templateId: snapshot.templateId,
        difficulty: "standard",
        regionCode,
        seed: `cap_twin_${newId}`,
        variantIndex: 2,
      });

      return NextResponse.json({
        ok: true,
        wrongQuestionId: newId,
        nextTwin,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown capture action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Smart Capture API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
