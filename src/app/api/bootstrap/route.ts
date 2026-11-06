import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
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
import { REGIONS_DATA, SUBJECTS_DATA } from "@/data/regions-and-subjects";
import {
  ALL_CANONICAL_TOPICS,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
  type EdgeSeedDefinition,
} from "@/data/canonical-graph";
import { computeRetrievability, getElapsedDays } from "@/lib/engines/fsrs-engine";
import type { EdgeRelationType } from "@/types/taxonomy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSeeded(false);

    const [
      allUsers,
      allClassrooms,
      allMemberships,
      allParentLinks,
      allStates,
      allWrongQuestions,
      allAssignments,
      allAuthProfiles,
      allStudyPacts,
      allCustomEdges,
      allCustomQuestions,
      allIrtStats,
      allAttemptLogs,
      recentPrivacyLogs,
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(classrooms),
      db.select().from(classMemberships),
      db.select().from(parentChildLinks),
      db.select().from(studentTopicStates),
      db.select().from(wrongQuestions),
      db.select().from(differentiatedAssignments),
      db.select().from(userAuthProfiles),
      db.select().from(studyPacts),
      db.select().from(customSchoolEdges),
      db.select().from(customSchoolQuestions),
      db.select().from(irtItemStats),
      db.select().from(attemptLogs).orderBy(desc(attemptLogs.createdAt)).limit(120),
      db
        .select()
        .from(privacyAuditLogs)
        .orderBy(desc(privacyAuditLogs.timestamp))
        .limit(40),
    ]);

    const now = new Date();
    const enrichedWrongQuestions = allWrongQuestions.map((wq) => {
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

    // Merge teacher-created school edges into live graph edges seamlessly
    const mappedCustomEdges: EdgeSeedDefinition[] = allCustomEdges.map((ce) => ({
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
    const mergedEdges: EdgeSeedDefinition[] = [
      ...CANONICAL_EDGES,
      ...mappedCustomEdges.filter(
        (ce) => !existingEdgeKey.has(`${ce.topicId}::${ce.prerequisiteId}`)
      ),
    ];

    const safeAuthProfiles = allAuthProfiles.map((p) => ({
      userId: p.userId,
      loginHandle: p.loginHandle,
      hasKidPin: Boolean(p.kidPin),
      anonymousToken: p.anonymousToken,
      ageGroup: p.ageGroup,
      parentConsentVerified: p.parentConsentVerified,
      privacyRegime: p.privacyRegime,
    }));

    return NextResponse.json({
      ok: true,
      regions: REGIONS_DATA,
      subjects: SUBJECTS_DATA,
      topics: ALL_CANONICAL_TOPICS,
      edges: mergedEdges,
      alignments: ALL_REGIONAL_ALIGNMENTS,
      users: allUsers,
      classrooms: allClassrooms,
      classMemberships: allMemberships,
      parentChildLinks: allParentLinks,
      studentStates: allStates,
      wrongQuestions: enrichedWrongQuestions,
      assignments: allAssignments,
      authProfiles: safeAuthProfiles,
      studyPacts: allStudyPacts,
      customEdges: allCustomEdges,
      customQuestions: allCustomQuestions,
      irtStats: allIrtStats,
      attemptLogs: allAttemptLogs,
      privacyAuditLogs: recentPrivacyLogs,
    });
  } catch (error) {
    console.error("Bootstrap API error:", error);
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { action?: string };
    if (body.action === "reset_demo") {
      await ensureSeeded(true);
      return NextResponse.json({ ok: true, message: "Demo database reset complete" });
    }
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
