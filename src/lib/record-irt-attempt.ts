import { eq } from "drizzle-orm";
import { db } from "@/db";
import { attemptLogs, irtItemStats } from "@/db/schema";
import type { DifficultyTier, RegionCode } from "@/types/taxonomy";
import { computeAnonToken } from "./engines/privacy-shield";
import {
  calibrateIrtAfterAttempt,
  masteryToTheta,
  priorBetaForDifficulty,
} from "./engines/irt-engine";
import { ALL_CANONICAL_TOPICS } from "@/data/canonical-graph";

export async function recordStudentAttemptAndCalibrateIrt(params: {
  studentId: string;
  regionCode: RegionCode;
  topicId: string;
  templateId: string;
  difficulty: DifficultyTier;
  isCorrect: boolean;
  pMasteryAfter: number;
}): Promise<void> {
  const nowIso = new Date().toISOString();
  const anonToken = computeAnonToken(params.studentId, params.regionCode);
  const studentTheta = masteryToTheta(params.pMasteryAfter);

  await db.insert(attemptLogs).values({
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    studentAnonToken: anonToken,
    studentId: params.studentId,
    topicId: params.topicId,
    templateId: params.templateId,
    isCorrect: params.isCorrect,
    pMasteryAfter: Math.round(params.pMasteryAfter * 1000) / 1000,
    thetaEstimate: studentTheta,
    createdAt: nowIso,
  });

  const existing = await db
    .select()
    .from(irtItemStats)
    .where(eq(irtItemStats.templateId, params.templateId));

  const topic = ALL_CANONICAL_TOPICS.find((t) => t.id === params.topicId);
  const prior = priorBetaForDifficulty(params.difficulty, topic?.baselineGrade ?? 8);

  const baseRecord = existing[0] ?? {
    templateId: params.templateId,
    topicId: params.topicId,
    priorBeta: prior,
    calibratedBeta: prior,
    discriminationAlpha: 1.1,
    attempts: 0,
    correct: 0,
  };

  const calibrated = calibrateIrtAfterAttempt(
    baseRecord,
    studentTheta,
    params.isCorrect
  );

  if (existing[0]) {
    await db
      .update(irtItemStats)
      .set({
        calibratedBeta: calibrated.calibratedBeta,
        discriminationAlpha: calibrated.discriminationAlpha,
        attempts: calibrated.attempts,
        correct: calibrated.correct,
        updatedAt: nowIso,
      })
      .where(eq(irtItemStats.templateId, params.templateId));
  } else {
    await db.insert(irtItemStats).values({
      templateId: params.templateId,
      topicId: params.topicId,
      priorBeta: prior,
      calibratedBeta: calibrated.calibratedBeta,
      discriminationAlpha: calibrated.discriminationAlpha,
      attempts: calibrated.attempts,
      correct: calibrated.correct,
      updatedAt: nowIso,
    });
  }
}
