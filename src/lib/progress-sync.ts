import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  differentiatedAssignments,
  irtItemStats,
  questionTemplates,
  studentTopicStates,
  studyPacts,
} from "@/db/schema";
import { ALL_QUESTION_TEMPLATES } from "@/data/canonical-graph";
import type { DifficultyTier, MasteryStatus } from "@/types/taxonomy";
import type { IrtItemRecord } from "@/lib/engines/irt-engine";

export interface PureAssignmentCandidate {
  id: string;
  targetTopicIds: string[];
  assignedStudentIds: string[];
  completedStudentIds: string[];
}

export interface PureStudyPactCandidate {
  id: string;
  studentId: string;
  dailyLimitMinutes: number;
  todayUsedMinutes: number;
  weeklyTargetNodes: number;
  completedNodesThisWeek: number;
  badgeUnlocked: boolean;
}

export function evaluateAssignmentAndPactSync(params: {
  studentId: string;
  masteredTopicIds: Set<string>;
  newlyMasteredCount: number;
  minutesDelta: number;
  assignments: PureAssignmentCandidate[];
  pact?: PureStudyPactCandidate;
}): {
  assignmentsToComplete: Array<{ id: string; nextCompletedStudentIds: string[] }>;
  updatedPact?: {
    id: string;
    todayUsedMinutes: number;
    completedNodesThisWeek: number;
    badgeUnlocked: boolean;
    badgeNewlyUnlocked: boolean;
  };
} {
  const assignmentsToComplete: Array<{
    id: string;
    nextCompletedStudentIds: string[];
  }> = [];

  for (const asg of params.assignments) {
    if (!asg.assignedStudentIds.includes(params.studentId)) continue;
    if (asg.completedStudentIds.includes(params.studentId)) continue;
    if (asg.targetTopicIds.length === 0) continue;

    const allTargetsMastered = asg.targetTopicIds.every((tid) =>
      params.masteredTopicIds.has(tid)
    );
    if (allTargetsMastered) {
      assignmentsToComplete.push({
        id: asg.id,
        nextCompletedStudentIds: [...asg.completedStudentIds, params.studentId],
      });
    }
  }

  let updatedPact:
    | {
        id: string;
        todayUsedMinutes: number;
        completedNodesThisWeek: number;
        badgeUnlocked: boolean;
        badgeNewlyUnlocked: boolean;
      }
    | undefined;

  if (params.pact) {
    const nextMinutes = Math.min(
      180,
      Math.max(0, params.pact.todayUsedMinutes + Math.max(0, params.minutesDelta))
    );
    const nextCompleted =
      params.pact.completedNodesThisWeek + Math.max(0, params.newlyMasteredCount);
    const nextBadgeUnlocked =
      params.pact.badgeUnlocked || nextCompleted >= params.pact.weeklyTargetNodes;
    const badgeNewlyUnlocked = !params.pact.badgeUnlocked && nextBadgeUnlocked;

    updatedPact = {
      id: params.pact.id,
      todayUsedMinutes: nextMinutes,
      completedNodesThisWeek: nextCompleted,
      badgeUnlocked: nextBadgeUnlocked,
      badgeNewlyUnlocked,
    };
  }

  return { assignmentsToComplete, updatedPact };
}

/**
 * Closed-loop side effects triggered whenever a student completes a diagnostic item
 * or clears a Twin Variant in the FSRS Wrong-Question Book:
 * 1. Auto-marks Teacher Differentiated Assignments complete once all target topics reach `mastered`/`inferred_mastered`.
 * 2. Accumulates Parent-Student Study Pact minutes & weekly mastered nodes, auto-unlocking positive reward badges.
 */
export async function syncStudentProgressSideEffects(params: {
  studentId: string;
  newlyMasteredTopicIds: string[];
  minutesDelta?: number;
}): Promise<{
  autoCompletedAssignmentIds: string[];
  badgeNewlyUnlocked: boolean;
}> {
  const [states, allAssignments, pacts] = await Promise.all([
    db
      .select()
      .from(studentTopicStates)
      .where(eq(studentTopicStates.studentId, params.studentId)),
    db.select().from(differentiatedAssignments),
    db
      .select()
      .from(studyPacts)
      .where(eq(studyPacts.studentId, params.studentId)),
  ]);

  const masteredSet = new Set<string>();
  for (const s of states) {
    const st = s.status as MasteryStatus;
    if (st === "mastered" || st === "inferred_mastered") {
      masteredSet.add(s.topicId);
    }
  }
  for (const tid of params.newlyMasteredTopicIds) {
    masteredSet.add(tid);
  }

  const evalRes = evaluateAssignmentAndPactSync({
    studentId: params.studentId,
    masteredTopicIds: masteredSet,
    newlyMasteredCount: params.newlyMasteredTopicIds.length,
    minutesDelta: params.minutesDelta ?? 2,
    assignments: allAssignments.map((a) => ({
      id: a.id,
      targetTopicIds: a.targetTopicIdsJson,
      assignedStudentIds: a.assignedStudentIdsJson,
      completedStudentIds: a.completedStudentIdsJson,
    })),
    pact: pacts[0]
      ? {
          id: pacts[0].id,
          studentId: pacts[0].studentId,
          dailyLimitMinutes: pacts[0].dailyLimitMinutes,
          todayUsedMinutes: pacts[0].todayUsedMinutes,
          weeklyTargetNodes: pacts[0].weeklyTargetNodes,
          completedNodesThisWeek: pacts[0].completedNodesThisWeek,
          badgeUnlocked: pacts[0].badgeUnlocked,
        }
      : undefined,
  });

  const nowIso = new Date().toISOString();

  for (const comp of evalRes.assignmentsToComplete) {
    await db
      .update(differentiatedAssignments)
      .set({
        completedStudentIdsJson: comp.nextCompletedStudentIds,
      })
      .where(eq(differentiatedAssignments.id, comp.id));
  }

  if (evalRes.updatedPact) {
    await db
      .update(studyPacts)
      .set({
        todayUsedMinutes: evalRes.updatedPact.todayUsedMinutes,
        completedNodesThisWeek: evalRes.updatedPact.completedNodesThisWeek,
        badgeUnlocked: evalRes.updatedPact.badgeUnlocked,
        updatedAt: nowIso,
      })
      .where(eq(studyPacts.id, evalRes.updatedPact.id));
  }

  return {
    autoCompletedAssignmentIds: evalRes.assignmentsToComplete.map((c) => c.id),
    badgeNewlyUnlocked: evalRes.updatedPact?.badgeNewlyUnlocked ?? false,
  };
}

/**
 * Loads calibrated Elo-IRT 2PL item statistics indexed by `topicId -> difficultyTier`
 * for Maximum Fisher Information (MFI) adaptive question selection.
 */
export async function loadIrtStatsByTopic(): Promise<
  Record<string, Partial<Record<DifficultyTier, IrtItemRecord>>>
> {
  const [statsRows, dbTemplates] = await Promise.all([
    db.select().from(irtItemStats),
    db.select().from(questionTemplates),
  ]);

  const tierByTemplate = new Map<string, DifficultyTier>();
  for (const qt of ALL_QUESTION_TEMPLATES) {
    tierByTemplate.set(qt.id, qt.difficulty);
  }
  for (const qt of dbTemplates) {
    tierByTemplate.set(qt.id, qt.difficulty as DifficultyTier);
  }

  const grouped: Record<string, Partial<Record<DifficultyTier, IrtItemRecord>>> =
    {};
  for (const row of statsRows) {
    const tier = tierByTemplate.get(row.templateId);
    if (!tier) continue;
    if (!grouped[row.topicId]) {
      grouped[row.topicId] = {};
    }
    grouped[row.topicId][tier] = {
      templateId: row.templateId,
      topicId: row.topicId,
      priorBeta: row.priorBeta,
      calibratedBeta: row.calibratedBeta,
      discriminationAlpha: row.discriminationAlpha,
      attempts: row.attempts,
      correct: row.correct,
    };
  }
  return grouped;
}
