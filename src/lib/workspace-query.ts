import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  attemptLogs,
  classMemberships,
  classrooms,
  customSchoolEdges,
  customSchoolQuestions,
  differentiatedAssignments,
  irtItemStats,
  parentChildLinks,
  privacyAuditLogs,
  studentTopicStates,
  studyPacts,
  userAuthProfiles,
  users,
  wrongQuestions,
} from "@/db/schema";
import { CANONICAL_EDGES, type EdgeSeedDefinition } from "@/data/canonical-graph";
import { computeRetrievability, getElapsedDays } from "@/lib/engines/fsrs-engine";
import {
  DEMO_SEED_USER_IDS,
  isDemoUserId,
  parseSessionFromRequest,
} from "@/lib/auth/session";
import type { EdgeRelationType } from "@/types/taxonomy";

export async function loadMergedGraphEdges(): Promise<{
  customEdgesRows: Array<typeof customSchoolEdges.$inferSelect>;
  extraEdges: EdgeSeedDefinition[];
  mergedEdges: EdgeSeedDefinition[];
}> {
  const customEdgesRows = await db.select().from(customSchoolEdges);
  const mappedCustomEdges: EdgeSeedDefinition[] = customEdgesRows.map((ce) => ({
    topicId: ce.topicId,
    prerequisiteId: ce.prerequisiteId,
    relationType: (ce.relationType as EdgeRelationType) || "hard",
    reason: {
      "zh-CN": ce.reasonZh,
      en: ce.reasonEn,
    },
  }));

  const existingEdgeKey = new Set(
    CANONICAL_EDGES.map((e) => `${e.topicId}::${e.prerequisiteId}`)
  );
  const extraEdges = mappedCustomEdges.filter(
    (ce) => !existingEdgeKey.has(`${ce.topicId}::${ce.prerequisiteId}`)
  );

  return {
    customEdgesRows,
    extraEdges,
    mergedEdges: [...CANONICAL_EDGES, ...extraEdges],
  };
}

/**
 * Builds the tenant-scoped dynamic workspace payload for the current session actor.
 * - Built-in sandbox demo personas (`DEMO_SEED_USER_IDS`) remain available for interactive switching.
 * - Real registered accounts are strictly isolated: a session only receives its own records,
 *   its linked family sub-accounts (for parents), or its enrolled classroom roster (for teachers).
 */
export async function buildScopedWorkspacePayload(req: Request) {
  await ensureSeeded(false);
  const session = parseSessionFromRequest(req);

  const allowedUserSet = new Set<string>(DEMO_SEED_USER_IDS);
  const allowedStudentSet = new Set<string>(
    DEMO_SEED_USER_IDS.filter((id) => id.startsWith("stu_"))
  );

  if (session && !isDemoUserId(session.uid)) {
    allowedUserSet.add(session.uid);
    if (session.role === "student") {
      allowedStudentSet.add(session.uid);
    } else if (session.role === "parent") {
      const childLinks = await db
        .select()
        .from(parentChildLinks)
        .where(eq(parentChildLinks.parentId, session.uid));
      for (const link of childLinks) {
        allowedUserSet.add(link.studentId);
        allowedStudentSet.add(link.studentId);
      }
    } else if (session.role === "teacher") {
      const taughtClasses = await db
        .select({ id: classrooms.id })
        .from(classrooms)
        .where(eq(classrooms.teacherId, session.uid));
      const classIds = taughtClasses.map((c) => c.id);
      if (classIds.length > 0) {
        const roster = await db
          .select()
          .from(classMemberships)
          .where(inArray(classMemberships.classId, classIds));
        for (const m of roster) {
          allowedUserSet.add(m.studentId);
          allowedStudentSet.add(m.studentId);
        }
      }
    }
  }

  const allowedUsers = [...allowedUserSet];
  const allowedStudents = [...allowedStudentSet];

  const [
    scopedUsers,
    allClassrooms,
    scopedMemberships,
    scopedParentLinks,
    scopedStates,
    scopedWrongQuestions,
    allAssignments,
    scopedAuthProfiles,
    scopedStudyPacts,
    edgeBundle,
    allCustomQuestions,
    allIrtStats,
    scopedAttemptLogs,
    recentPrivacyLogs,
  ] = await Promise.all([
    db.select().from(users).where(inArray(users.id, allowedUsers)),
    db.select().from(classrooms),
    db
      .select()
      .from(classMemberships)
      .where(inArray(classMemberships.studentId, allowedStudents)),
    db
      .select()
      .from(parentChildLinks)
      .where(inArray(parentChildLinks.studentId, allowedStudents)),
    db
      .select()
      .from(studentTopicStates)
      .where(inArray(studentTopicStates.studentId, allowedStudents)),
    db
      .select()
      .from(wrongQuestions)
      .where(inArray(wrongQuestions.studentId, allowedStudents)),
    db.select().from(differentiatedAssignments),
    db
      .select()
      .from(userAuthProfiles)
      .where(inArray(userAuthProfiles.userId, allowedUsers)),
    db
      .select()
      .from(studyPacts)
      .where(inArray(studyPacts.studentId, allowedStudents)),
    loadMergedGraphEdges(),
    db.select().from(customSchoolQuestions),
    db.select().from(irtItemStats),
    db
      .select()
      .from(attemptLogs)
      .where(inArray(attemptLogs.studentId, allowedStudents))
      .orderBy(desc(attemptLogs.createdAt))
      .limit(120),
    db
      .select()
      .from(privacyAuditLogs)
      .orderBy(desc(privacyAuditLogs.timestamp))
      .limit(40),
  ]);

  const now = new Date();
  const enrichedWrongQuestions = scopedWrongQuestions.map((wq) => {
    const elapsed = getElapsedDays(wq.lastReviewedAt, now);
    const retrievability = computeRetrievability(wq.fsrsStability, elapsed);
    const isDue =
      wq.status !== "cleared" &&
      new Date(wq.nextReviewAt).getTime() <= now.getTime() + 6 * 3600 * 1000;
    return {
      ...wq,
      retrievability,
      isDue,
    };
  });

  // Filter assignments to those touching authorized students or authored by authorized teachers
  const scopedAssignments = allAssignments.filter(
    (a) =>
      allowedUserSet.has(a.teacherId) ||
      a.assignedStudentIdsJson.some((sid) => allowedStudentSet.has(sid))
  );

  const safeAuthProfiles = scopedAuthProfiles.map((p) => ({
    userId: p.userId,
    loginHandle: p.loginHandle,
    hasKidPin: Boolean(p.kidPin),
    anonymousToken: p.anonymousToken,
    ageGroup: p.ageGroup,
    parentConsentVerified: p.parentConsentVerified,
    privacyRegime: p.privacyRegime,
  }));

  return {
    edges: edgeBundle.mergedEdges,
    users: scopedUsers,
    classrooms: allClassrooms,
    classMemberships: scopedMemberships,
    parentChildLinks: scopedParentLinks,
    studentStates: scopedStates,
    wrongQuestions: enrichedWrongQuestions,
    assignments: scopedAssignments,
    authProfiles: safeAuthProfiles,
    studyPacts: scopedStudyPacts,
    customEdges: edgeBundle.customEdgesRows,
    customQuestions: allCustomQuestions,
    irtStats: allIrtStats,
    attemptLogs: scopedAttemptLogs,
    privacyAuditLogs: recentPrivacyLogs,
    sessionActor: session
      ? {
          userId: session.uid,
          role: session.role,
          regionCode: session.reg,
          isDemo: session.demo,
        }
      : null,
  };
}
