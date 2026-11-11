import { count, eq, inArray } from "drizzle-orm";
import { db, ensureSchema, libsqlClient } from "./index";
import {
  attemptLogs,
  canonicalTopics,
  classMemberships,
  classrooms,
  customSchoolEdges,
  customSchoolQuestions,
  diagnosticSessions,
  differentiatedAssignments,
  irtItemStats,
  parentChildLinks,
  privacyAuditLogs,
  questionTemplates,
  regionalAlignments,
  regions,
  studentTopicStates,
  studyPacts,
  subjects,
  topicEdges,
  userAuthProfiles,
  users,
  wrongQuestions,
} from "./schema";
import { REGIONS_DATA, SUBJECTS_DATA } from "@/data/regions-and-subjects";
import {
  ALL_CANONICAL_TOPICS,
  ALL_QUESTION_TEMPLATES,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
} from "@/data/canonical-graph";
import { generateQuestion } from "@/lib/engines/item-generator";
import { computeAnonToken, PRIVACY_REGIMES } from "@/lib/engines/privacy-shield";
import { priorBetaForDifficulty } from "@/lib/engines/irt-engine";
import {
  DEMO_SEED_USER_IDS,
  hashKidPin,
  hashSecret,
  isHashedKidPin,
  isHashedSecret,
} from "@/lib/auth/session";
import type { MasteryStatus } from "@/types/taxonomy";

let seedPromise: Promise<void> | null = null;
let credentialsUpgraded = false;

async function upgradeLegacyPlaintextCredentials(): Promise<void> {
  if (credentialsUpgraded) return;
  const rows = await db.select().from(userAuthProfiles);
  for (const row of rows) {
    const needsSecretHash = !isHashedSecret(row.secretCode);
    const needsPinHash = Boolean(row.kidPin && !isHashedKidPin(row.kidPin));
    if (needsSecretHash || needsPinHash) {
      await db
        .update(userAuthProfiles)
        .set({
          secretCode: needsSecretHash ? hashSecret(row.secretCode) : row.secretCode,
          kidPin:
            row.kidPin && needsPinHash ? hashKidPin(row.kidPin) : row.kidPin,
        })
        .where(eq(userAuthProfiles.userId, row.userId));
    }
  }
  credentialsUpgraded = true;
}

export async function ensureSeeded(forceReset = false): Promise<void> {
  await ensureSchema();

  let shouldReset = forceReset;
  if (!forceReset) {
    if (seedPromise) {
      await seedPromise;
      return;
    }
    const existing = await db.select({ value: count() }).from(canonicalTopics);
    const existingCount = existing[0]?.value ?? 0;
    if (existingCount >= ALL_CANONICAL_TOPICS.length) {
      await upgradeLegacyPlaintextCredentials();
      return;
    }
    if (existingCount > 0) {
      shouldReset = true;
    }
  }

  seedPromise = runFullSeed(shouldReset);
  try {
    await seedPromise;
    credentialsUpgraded = true;
  } finally {
    seedPromise = null;
  }
}

/**
 * Sandbox-safe Demo Reset:
 * Resets ONLY the 9 built-in demo personas (`DEMO_SEED_USER_IDS`) and demo seed artifacts,
 * strictly preserving all real registered accounts, child subaccounts, and teacher custom items.
 */
export async function resetDemoSandboxOnly(): Promise<void> {
  await ensureSchema();
  const demoUsers = [...DEMO_SEED_USER_IDS];
  const demoAssignmentIds = [
    "asg_foundational_bridge",
    "asg_standard_parabola",
    "asg_challenge_calc",
  ];

  await db.delete(attemptLogs).where(inArray(attemptLogs.studentId, demoUsers));
  await db.delete(studyPacts).where(inArray(studyPacts.studentId, demoUsers));
  await db
    .delete(userAuthProfiles)
    .where(inArray(userAuthProfiles.userId, demoUsers));
  await db
    .delete(diagnosticSessions)
    .where(inArray(diagnosticSessions.studentId, demoUsers));
  await db
    .delete(wrongQuestions)
    .where(inArray(wrongQuestions.studentId, demoUsers));
  await db
    .delete(studentTopicStates)
    .where(inArray(studentTopicStates.studentId, demoUsers));
  await db
    .delete(differentiatedAssignments)
    .where(inArray(differentiatedAssignments.id, demoAssignmentIds));
  await db
    .delete(customSchoolEdges)
    .where(eq(customSchoolEdges.id, "cse_chem_molar_rational"));
  await db
    .delete(customSchoolQuestions)
    .where(eq(customSchoolQuestions.id, "csq_ohm_bridge_1"));
  await db
    .delete(privacyAuditLogs)
    .where(inArray(privacyAuditLogs.id, ["pal_seed_1", "pal_seed_2"]));

  await runFullSeed(false);
}

async function runFullSeed(forceReset: boolean): Promise<void> {
  if (forceReset) {
    const tablesInReverseFkOrder = [
      "attempt_logs",
      "irt_item_stats",
      "custom_school_questions",
      "custom_school_edges",
      "privacy_audit_logs",
      "study_pacts",
      "user_auth_profiles",
      "differentiated_assignments",
      "diagnostic_sessions",
      "wrong_questions",
      "student_topic_states",
      "parent_child_links",
      "class_memberships",
      "classrooms",
      "users",
      "question_templates",
      "regional_alignments",
      "topic_edges",
      "canonical_topics",
      "subjects",
      "regions",
    ];
    for (const tbl of tablesInReverseFkOrder) {
      await libsqlClient.execute(`DELETE FROM ${tbl};`);
    }
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const yesterdayIso = new Date(now.getTime() - 28 * 3600 * 1000).toISOString();
  const threeDaysAgoIso = new Date(now.getTime() - 72 * 3600 * 1000).toISOString();
  const dueNowIso = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const dueTomorrowIso = new Date(now.getTime() + 26 * 3600 * 1000).toISOString();
  const nextWeekDate = new Date(now.getTime() + 5 * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

  // 1. Seed 9 Regions
  await db
    .insert(regions)
    .values(
      REGIONS_DATA.map((r) => ({
        code: r.code,
        flag: r.flag,
        nameZh: r.nameZh,
        nameLocal: r.nameLocal,
        nameEn: r.nameEn,
        primaryLocale: r.primaryLocale,
        secondaryLocale: r.secondaryLocale ?? null,
        schoolSystem: r.schoolSystem,
        curriculumName: r.curriculumName,
        flagshipExamsJson: r.flagshipExams,
        privacyRegulation: r.privacyRegulation,
        gradeLabelsJson: r.gradeLabels,
        notationJson: r.notation,
      }))
    )
    .onConflictDoNothing();

  // 2. Seed 8 Subjects
  await db
    .insert(subjects)
    .values(
      SUBJECTS_DATA.map((s) => ({
        id: s.id,
        icon: s.icon,
        themeColor: s.themeColor,
        nameJson: s.name,
        descriptionJson: s.description,
        sortOrder: s.sortOrder,
      }))
    )
    .onConflictDoNothing();

  // 3. Seed 30 Canonical Micro-Topics
  await db
    .insert(canonicalTopics)
    .values(
      ALL_CANONICAL_TOPICS.map((t) => ({
        id: t.id,
        subjectId: t.subjectId,
        domain: t.domain,
        domainJson: t.domainI18n,
        cognitiveType: t.cognitiveType,
        baselineGrade: t.baselineGrade,
        centrality: t.centrality,
        titleJson: t.title,
        descriptionJson: t.description,
        masteryCriteriaJson: t.masteryCriteria,
        homeCheckPromptJson: t.homeCheckPrompt,
        microLessonJson: t.microLesson,
        rootReason: t.rootReason ?? null,
      }))
    )
    .onConflictDoNothing();

  // 4. Seed 45 DAG Prerequisite & Cross-Subject Edges
  await db
    .insert(topicEdges)
    .values(
      CANONICAL_EDGES.map((e) => ({
        topicId: e.topicId,
        prerequisiteId: e.prerequisiteId,
        relationType: e.relationType,
        reasonJson: e.reason,
      }))
    )
    .onConflictDoNothing();

  // 5. Seed 270 Scoped 9-Region Alignments (insert in batches of 90)
  for (let i = 0; i < ALL_REGIONAL_ALIGNMENTS.length; i += 90) {
    const batch = ALL_REGIONAL_ALIGNMENTS.slice(i, i + 90);
    await db
      .insert(regionalAlignments)
      .values(
        batch.map((a) => ({
          topicId: a.topicId,
          regionCode: a.regionCode,
          localGrade: a.localGrade,
          localStageLabel: a.localStageLabel,
          standardCode: a.standardCode,
          textbookEdition: a.textbookEdition,
          localChapterTitle: a.localChapterTitle,
          examWeight: a.examWeight,
          regionalNote: a.regionalNote ?? null,
        }))
      )
      .onConflictDoNothing();
  }

  // 6. Seed 90 Parameterized Question Templates
  await db
    .insert(questionTemplates)
    .values(
      ALL_QUESTION_TEMPLATES.map((qt) => ({
        id: qt.id,
        topicId: qt.topicId,
        difficulty: qt.difficulty,
        itemType: qt.itemType,
        generatorKey: qt.generatorKey,
        titleNote: qt.titleNote,
      }))
    )
    .onConflictDoNothing();

  // 7. Seed 3-Role Users (7 Students across regions + Teacher + Parent)
  await db
    .insert(users)
    .values([
      {
        id: "stu_leo",
        role: "student",
        displayName: "林小宇 Leo Lin",
        avatarEmoji: "🧑‍🚀",
        regionCode: "CN",
        currentGrade: 9,
        schoolTrack: "人教版初三（拟衔接香港 HKDSE 双语班）",
        targetTransitionRegion: "HK",
        createdAt: nowIso,
      },
      {
        id: "stu_mia",
        role: "student",
        displayName: "林小朵 Mia Lin",
        avatarEmoji: "🦄",
        regionCode: "SG",
        currentGrade: 5,
        schoolTrack: "Singapore MOE P5 (CPA Bar Modeling)",
        targetTransitionRegion: "UK",
        createdAt: nowIso,
      },
      {
        id: "stu_chloe",
        role: "student",
        displayName: "陳思涵 Chloe Chan",
        avatarEmoji: "🎨",
        regionCode: "HK",
        currentGrade: 9,
        schoolTrack: "香港中三 S3 (EMI 英文中學雙語)",
        targetTransitionRegion: "UK",
        createdAt: nowIso,
      },
      {
        id: "stu_mei",
        role: "student",
        displayName: "陈美玲 Mei Tan",
        avatarEmoji: "🌟",
        regionCode: "SG",
        currentGrade: 9,
        schoolTrack: "Singapore Sec 3 G3 (E-Math + A-Math)",
        targetTransitionRegion: "US",
        createdAt: nowIso,
      },
      {
        id: "stu_kenta",
        role: "student",
        displayName: "佐藤健太 Kenta Sato",
        avatarEmoji: "⚾",
        regionCode: "JP",
        currentGrade: 9,
        schoolTrack: "日本 中学3年生（高校入試対策）",
        targetTransitionRegion: "US",
        createdAt: nowIso,
      },
      {
        id: "stu_minjun",
        role: "student",
        displayName: "김민준 Minjun Kim",
        avatarEmoji: "🎹",
        regionCode: "KR",
        currentGrade: 9,
        schoolTrack: "대한민국 중학교 3학년 (2022 개정 교육과정)",
        targetTransitionRegion: "SG",
        createdAt: nowIso,
      },
      {
        id: "stu_aryan",
        role: "student",
        displayName: "Aryan Lim",
        avatarEmoji: "🚀",
        regionCode: "MY",
        currentGrade: 9,
        schoolTrack: "Malaysia Tingkatan 3 (KSSM DLP Bilingual)",
        targetTransitionRegion: "SG",
        createdAt: nowIso,
      },
      {
        id: "tch_wang",
        role: "teacher",
        displayName: "王知行老师 Ms. Evelyn Wang",
        avatarEmoji: "👩‍🏫",
        regionCode: "CN",
        currentGrade: 9,
        schoolTrack: "九年级数理融合教研组长（跨区域双语班）",
        targetTransitionRegion: null,
        createdAt: nowIso,
      },
      {
        id: "par_lin",
        role: "parent",
        displayName: "林远航（小宇 & 小朵爸爸）",
        avatarEmoji: "👨‍👧‍👦",
        regionCode: "CN",
        currentGrade: null,
        schoolTrack: "关注双孩数理思维与大湾区/海外升学衔接",
        targetTransitionRegion: "HK",
        createdAt: nowIso,
      },
    ])
    .onConflictDoNothing();

  // 8. Seed Classroom & Parent-Child Links
  await db
    .insert(classrooms)
    .values([
      {
        id: "cls_global_g9",
        name: "G9 亚太双语数理融合实验班 (9A)",
        teacherId: "tch_wang",
        regionCode: "CN",
        grade: 9,
        subjectId: "math",
        inviteCode: "OMNI-9A",
      },
    ])
    .onConflictDoNothing();

  const classStudentIds = [
    "stu_leo",
    "stu_chloe",
    "stu_mei",
    "stu_kenta",
    "stu_minjun",
    "stu_aryan",
  ];

  await db
    .insert(classMemberships)
    .values(
      classStudentIds.map((studentId) => ({
        classId: "cls_global_g9",
        studentId,
      }))
    )
    .onConflictDoNothing();

  await db
    .insert(parentChildLinks)
    .values([
      {
        parentId: "par_lin",
        studentId: "stu_leo",
        relationshipLabel: "长子 · 初三 G9（拟衔接 HKDSE）",
      },
      {
        parentId: "par_lin",
        studentId: "stu_mia",
        relationshipLabel: "幼女 · 小五 P5（新加坡条形建模在读）",
      },
    ])
    .onConflictDoNothing();

  // 9. Seed Rich Student Knowledge States
  type SeedStateSpec = {
    studentId: string;
    topicId: string;
    status: MasteryStatus;
    pMastery: number;
    isRootCause?: boolean;
    misconception?: string;
  };

  const stateSpecs: SeedStateSpec[] = [
    // --- Leo Lin (G9): Strong primary/early algebra, root-cause weak on factoring & rational_eq -> blocks quad & physics Ohm's law! ---
    { studentId: "stu_leo", topicId: "mt_math_place_value_ops", status: "mastered", pMastery: 0.96 },
    { studentId: "stu_leo", topicId: "mt_math_frac_concept_equiv", status: "mastered", pMastery: 0.95 },
    { studentId: "stu_leo", topicId: "mt_math_frac_add_sub", status: "mastered", pMastery: 0.93 },
    { studentId: "stu_leo", topicId: "mt_math_frac_mul_div", status: "mastered", pMastery: 0.92 },
    { studentId: "stu_leo", topicId: "mt_math_ratio_percent", status: "mastered", pMastery: 0.9 },
    { studentId: "stu_leo", topicId: "mt_math_geometry_area_perim", status: "mastered", pMastery: 0.91 },
    { studentId: "stu_leo", topicId: "mt_math_signed_numbers", status: "mastered", pMastery: 0.89 },
    { studentId: "stu_leo", topicId: "mt_math_alg_expressions", status: "mastered", pMastery: 0.88 },
    { studentId: "stu_leo", topicId: "mt_math_linear_eq_one", status: "mastered", pMastery: 0.9 },
    { studentId: "stu_leo", topicId: "mt_math_linear_systems", status: "mastered", pMastery: 0.86 },
    { studentId: "stu_leo", topicId: "mt_math_coord_linear_func", status: "mastered", pMastery: 0.85 },
    { studentId: "stu_leo", topicId: "mt_math_special_products_factor", status: "weak", pMastery: 0.28, isRootCause: true, misconception: "misc_freshman_dream" },
    { studentId: "stu_leo", topicId: "mt_math_rational_eq", status: "weak", pMastery: 0.24, isRootCause: false, misconception: "misc_rational_invert_sum" },
    { studentId: "stu_leo", topicId: "mt_math_radicals_pythagoras", status: "shaky", pMastery: 0.58, misconception: "misc_pythag_always_add" },
    { studentId: "stu_leo", topicId: "mt_math_quad_complete_sq", status: "weak", pMastery: 0.22, misconception: "misc_quad_drop_neg_root" },
    { studentId: "stu_leo", topicId: "mt_math_quad_function_parabola", status: "weak", pMastery: 0.2, misconception: "misc_vertex_h_sign" },
    { studentId: "stu_leo", topicId: "mt_phy_measurement_density", status: "mastered", pMastery: 0.89 },
    { studentId: "stu_leo", topicId: "mt_phy_speed_motion_graphs", status: "mastered", pMastery: 0.84 },
    { studentId: "stu_leo", topicId: "mt_phy_forces_newton", status: "shaky", pMastery: 0.56, misconception: "misc_newton_ignore_friction" },
    { studentId: "stu_leo", topicId: "mt_phy_circuits_series_parallel", status: "mastered", pMastery: 0.85 },
    { studentId: "stu_leo", topicId: "mt_phy_ohm_law", status: "weak", pMastery: 0.25, misconception: "misc_ohm_parallel_add" },
    { studentId: "stu_leo", topicId: "mt_chem_atomic_periodic", status: "mastered", pMastery: 0.88 },
    { studentId: "stu_leo", topicId: "mt_chem_bonding_formula", status: "mastered", pMastery: 0.85 },
    { studentId: "stu_leo", topicId: "mt_chem_stoichiometry_conservation", status: "mastered", pMastery: 0.83 },
    { studentId: "stu_leo", topicId: "mt_chem_molar_concentration", status: "shaky", pMastery: 0.52, misconception: "misc_chem_vol_ml_not_l" },
    { studentId: "stu_leo", topicId: "mt_bio_cell_transport", status: "mastered", pMastery: 0.86 },
    { studentId: "stu_leo", topicId: "mt_bio_photosynthesis_resp", status: "shaky", pMastery: 0.57, misconception: "misc_bio_gross_net_swap" },
    { studentId: "stu_leo", topicId: "mt_cs_binary_logic", status: "mastered", pMastery: 0.91 },
    { studentId: "stu_leo", topicId: "mt_cs_loops_trace", status: "mastered", pMastery: 0.89 },
    { studentId: "stu_leo", topicId: "mt_cs_arrays_binary_search", status: "shaky", pMastery: 0.6 },
    { studentId: "stu_leo", topicId: "mt_eng_sentence_sva_tense", status: "mastered", pMastery: 0.87 },
    { studentId: "stu_leo", topicId: "mt_eng_relative_clauses", status: "shaky", pMastery: 0.54, misconception: "misc_eng_place_always_where" },
    { studentId: "stu_leo", topicId: "mt_geo_map_scale_timezones", status: "mastered", pMastery: 0.88 },
    { studentId: "stu_leo", topicId: "mt_geo_contour_elevation", status: "shaky", pMastery: 0.55 },
    { studentId: "stu_leo", topicId: "mt_his_chronology_evidence", status: "mastered", pMastery: 0.9 },
    { studentId: "stu_leo", topicId: "mt_lit_main_idea_structure", status: "mastered", pMastery: 0.91 },
    { studentId: "stu_leo", topicId: "mt_lit_logical_fallacy", status: "shaky", pMastery: 0.58, misconception: "misc_lit_corr_causation" },

    // --- Mia Lin (G5 Primary): Strong basic fractions, weak on Singapore Bar Model ratio & polygon 1/2 area ---
    { studentId: "stu_mia", topicId: "mt_math_place_value_ops", status: "mastered", pMastery: 0.94 },
    { studentId: "stu_mia", topicId: "mt_math_frac_concept_equiv", status: "mastered", pMastery: 0.9 },
    { studentId: "stu_mia", topicId: "mt_math_frac_add_sub", status: "mastered", pMastery: 0.86 },
    { studentId: "stu_mia", topicId: "mt_math_frac_mul_div", status: "shaky", pMastery: 0.59, misconception: "misc_flip_dividend" },
    { studentId: "stu_mia", topicId: "mt_math_ratio_percent", status: "weak", pMastery: 0.31, isRootCause: true, misconception: "misc_percent_wrong_base" },
    { studentId: "stu_mia", topicId: "mt_math_geometry_area_perim", status: "weak", pMastery: 0.34, isRootCause: true, misconception: "misc_triangle_forget_half" },

    // --- Chloe Chan (HK S3): Also hitting the shared rational_eq -> phy_ohm_law cross-subject bottleneck! ---
    { studentId: "stu_chloe", topicId: "mt_math_alg_expressions", status: "mastered", pMastery: 0.92 },
    { studentId: "stu_chloe", topicId: "mt_math_linear_eq_one", status: "mastered", pMastery: 0.91 },
    { studentId: "stu_chloe", topicId: "mt_math_special_products_factor", status: "mastered", pMastery: 0.85 },
    { studentId: "stu_chloe", topicId: "mt_math_rational_eq", status: "weak", pMastery: 0.29, isRootCause: true, misconception: "misc_rational_invert_sum" },
    { studentId: "stu_chloe", topicId: "mt_math_radicals_pythagoras", status: "mastered", pMastery: 0.88 },
    { studentId: "stu_chloe", topicId: "mt_math_quad_complete_sq", status: "shaky", pMastery: 0.62 },
    { studentId: "stu_chloe", topicId: "mt_math_quad_function_parabola", status: "shaky", pMastery: 0.57 },
    { studentId: "stu_chloe", topicId: "mt_phy_circuits_series_parallel", status: "mastered", pMastery: 0.86 },
    { studentId: "stu_chloe", topicId: "mt_phy_ohm_law", status: "weak", pMastery: 0.27, misconception: "misc_ohm_parallel_add" },

    // --- Mei Tan (SG Sec 3): Advanced / Challenge tier student ---
    { studentId: "stu_mei", topicId: "mt_math_alg_expressions", status: "mastered", pMastery: 0.98 },
    { studentId: "stu_mei", topicId: "mt_math_linear_eq_one", status: "mastered", pMastery: 0.97 },
    { studentId: "stu_mei", topicId: "mt_math_special_products_factor", status: "mastered", pMastery: 0.95 },
    { studentId: "stu_mei", topicId: "mt_math_rational_eq", status: "mastered", pMastery: 0.94 },
    { studentId: "stu_mei", topicId: "mt_math_radicals_pythagoras", status: "mastered", pMastery: 0.95 },
    { studentId: "stu_mei", topicId: "mt_math_quad_complete_sq", status: "mastered", pMastery: 0.93 },
    { studentId: "stu_mei", topicId: "mt_math_quad_function_parabola", status: "mastered", pMastery: 0.91 },
    { studentId: "stu_mei", topicId: "mt_math_trig_right_triangle", status: "mastered", pMastery: 0.89 },
    { studentId: "stu_mei", topicId: "mt_phy_circuits_series_parallel", status: "mastered", pMastery: 0.94 },
    { studentId: "stu_mei", topicId: "mt_phy_ohm_law", status: "mastered", pMastery: 0.93 },
    { studentId: "stu_mei", topicId: "mt_phy_work_kinetic_energy", status: "mastered", pMastery: 0.9 },

    // --- Kenta Sato (JP Chugaku 3): Weak on factoring -> rational_eq -> Ohm's law ---
    { studentId: "stu_kenta", topicId: "mt_math_alg_expressions", status: "mastered", pMastery: 0.86 },
    { studentId: "stu_kenta", topicId: "mt_math_linear_eq_one", status: "mastered", pMastery: 0.84 },
    { studentId: "stu_kenta", topicId: "mt_math_special_products_factor", status: "weak", pMastery: 0.3, isRootCause: true, misconception: "misc_freshman_dream" },
    { studentId: "stu_kenta", topicId: "mt_math_rational_eq", status: "weak", pMastery: 0.26, misconception: "misc_rational_invert_sum" },
    { studentId: "stu_kenta", topicId: "mt_math_radicals_pythagoras", status: "mastered", pMastery: 0.82 },
    { studentId: "stu_kenta", topicId: "mt_math_quad_complete_sq", status: "weak", pMastery: 0.29 },
    { studentId: "stu_kenta", topicId: "mt_phy_circuits_series_parallel", status: "shaky", pMastery: 0.55 },
    { studentId: "stu_kenta", topicId: "mt_phy_ohm_law", status: "weak", pMastery: 0.24, misconception: "misc_ohm_parallel_add" },

    // --- Minjun Kim (KR Jung 3): Solid foundation, shaky on parabola vertex & kinetic energy ---
    { studentId: "stu_minjun", topicId: "mt_math_alg_expressions", status: "mastered", pMastery: 0.93 },
    { studentId: "stu_minjun", topicId: "mt_math_linear_eq_one", status: "mastered", pMastery: 0.92 },
    { studentId: "stu_minjun", topicId: "mt_math_special_products_factor", status: "mastered", pMastery: 0.89 },
    { studentId: "stu_minjun", topicId: "mt_math_rational_eq", status: "mastered", pMastery: 0.86 },
    { studentId: "stu_minjun", topicId: "mt_math_radicals_pythagoras", status: "mastered", pMastery: 0.9 },
    { studentId: "stu_minjun", topicId: "mt_math_quad_complete_sq", status: "mastered", pMastery: 0.85 },
    { studentId: "stu_minjun", topicId: "mt_math_quad_function_parabola", status: "shaky", pMastery: 0.58, misconception: "misc_vertex_h_sign" },
    { studentId: "stu_minjun", topicId: "mt_phy_circuits_series_parallel", status: "mastered", pMastery: 0.88 },
    { studentId: "stu_minjun", topicId: "mt_phy_ohm_law", status: "mastered", pMastery: 0.84 },
    { studentId: "stu_minjun", topicId: "mt_phy_work_kinetic_energy", status: "shaky", pMastery: 0.6, misconception: "misc_ke_linear_v" },

    // --- Aryan Lim (MY Form 3 DLP): Weak on rational_eq & Ohm's law ---
    { studentId: "stu_aryan", topicId: "mt_math_alg_expressions", status: "mastered", pMastery: 0.85 },
    { studentId: "stu_aryan", topicId: "mt_math_linear_eq_one", status: "mastered", pMastery: 0.83 },
    { studentId: "stu_aryan", topicId: "mt_math_special_products_factor", status: "shaky", pMastery: 0.56 },
    { studentId: "stu_aryan", topicId: "mt_math_rational_eq", status: "weak", pMastery: 0.27, isRootCause: true, misconception: "misc_rational_invert_sum" },
    { studentId: "stu_aryan", topicId: "mt_math_radicals_pythagoras", status: "mastered", pMastery: 0.81 },
    { studentId: "stu_aryan", topicId: "mt_math_trig_right_triangle", status: "shaky", pMastery: 0.54, misconception: "misc_trig_swap_sin_cos" },
    { studentId: "stu_aryan", topicId: "mt_phy_circuits_series_parallel", status: "mastered", pMastery: 0.8 },
    { studentId: "stu_aryan", topicId: "mt_phy_ohm_law", status: "weak", pMastery: 0.23, misconception: "misc_ohm_parallel_add" },
  ];

  await db
    .insert(studentTopicStates)
    .values(
      stateSpecs.map((s) => ({
        studentId: s.studentId,
        topicId: s.topicId,
        status: s.status,
        pMastery: s.pMastery,
        attemptsCount: s.status === "mastered" ? 4 : 3,
        correctCount: s.status === "mastered" ? 4 : s.status === "shaky" ? 2 : 0,
        isRootCause: Boolean(s.isRootCause),
        lastMisconception: s.misconception ?? null,
        fsrsDifficulty: s.status === "weak" ? 7.2 : s.status === "shaky" ? 5.6 : 3.8,
        fsrsStability: s.status === "weak" ? 0.6 : s.status === "shaky" ? 2.4 : 14.0,
        lastPracticedAt: yesterdayIso,
        nextReviewAt: s.status === "mastered" ? dueTomorrowIso : dueNowIso,
      }))
    )
    .onConflictDoNothing();

  // 10. Seed Authentic Parameterized FSRS Wrong Questions for Leo & Mia
  const wqLeo1 = generateQuestion({
    topicId: "mt_math_special_products_factor",
    difficulty: "standard",
    seed: "seed_wq_leo_1",
    regionCode: "CN",
  });
  const wqLeo2 = generateQuestion({
    topicId: "mt_math_rational_eq",
    difficulty: "standard",
    seed: "seed_wq_leo_2",
    regionCode: "CN",
  });
  const wqLeo3 = generateQuestion({
    topicId: "mt_phy_ohm_law",
    difficulty: "standard",
    seed: "seed_wq_leo_3",
    regionCode: "CN",
  });
  const wqLeo4 = generateQuestion({
    topicId: "mt_math_quad_complete_sq",
    difficulty: "standard",
    seed: "seed_wq_leo_4",
    regionCode: "HK",
  });

  const wqMia1 = generateQuestion({
    topicId: "mt_math_ratio_percent",
    difficulty: "standard",
    seed: "seed_wq_mia_1",
    regionCode: "SG",
  });
  const wqMia2 = generateQuestion({
    topicId: "mt_math_geometry_area_perim",
    difficulty: "standard",
    seed: "seed_wq_mia_2",
    regionCode: "SG",
  });

  await db
    .insert(wrongQuestions)
    .values([
      {
        id: "wq_leo_factor",
        studentId: "stu_leo",
        topicId: "mt_math_special_products_factor",
        templateId: wqLeo1.templateId,
        questionSnapshotJson: wqLeo1,
        wrongUserAnswer: Object.keys(wqLeo1.misconceptionsByValue ?? {})[0] ?? "25",
        misconceptionTag: "misc_freshman_dream",
        misconceptionLabel: "完全平方漏掉中间交叉项 2ab（误算 (a+b)² = a² + b²）",
        status: "active",
        fsrsDifficulty: 7.4,
        fsrsStability: 0.8,
        reps: 1,
        lapses: 2,
        twinClearStreak: 0,
        createdAt: threeDaysAgoIso,
        lastReviewedAt: yesterdayIso,
        nextReviewAt: dueNowIso,
      },
      {
        id: "wq_leo_rational",
        studentId: "stu_leo",
        topicId: "mt_math_rational_eq",
        templateId: wqLeo2.templateId,
        questionSnapshotJson: wqLeo2,
        wrongUserAnswer: Object.keys(wqLeo2.misconceptionsByValue ?? {})[0] ?? "9",
        misconceptionTag: "misc_rational_invert_sum",
        misconceptionLabel: "倒数和未通分取倒数，直接把分母相加（1/x = 1/a + 1/b 误作 x = a + b）",
        status: "active",
        fsrsDifficulty: 7.1,
        fsrsStability: 1.1,
        reps: 1,
        lapses: 1,
        twinClearStreak: 1,
        createdAt: threeDaysAgoIso,
        lastReviewedAt: yesterdayIso,
        nextReviewAt: dueNowIso,
      },
      {
        id: "wq_leo_ohm",
        studentId: "stu_leo",
        topicId: "mt_phy_ohm_law",
        templateId: wqLeo3.templateId,
        questionSnapshotJson: wqLeo3,
        wrongUserAnswer: Object.keys(wqLeo3.misconceptionsByValue ?? {})[0] ?? "18",
        misconceptionTag: "misc_ohm_parallel_add",
        misconceptionLabel: "将并联等效电阻按串联直接相加（跨科受阻于分式方程倒数运算）",
        status: "active",
        fsrsDifficulty: 7.6,
        fsrsStability: 0.6,
        reps: 0,
        lapses: 2,
        twinClearStreak: 0,
        createdAt: yesterdayIso,
        lastReviewedAt: yesterdayIso,
        nextReviewAt: dueNowIso,
      },
      {
        id: "wq_leo_quad",
        studentId: "stu_leo",
        topicId: "mt_math_quad_complete_sq",
        templateId: wqLeo4.templateId,
        questionSnapshotJson: wqLeo4,
        wrongUserAnswer: Object.keys(wqLeo4.misconceptionsByValue ?? {})[0] ?? "5",
        misconceptionTag: "misc_quad_drop_neg_root",
        misconceptionLabel: "配方法两边开平方时漏掉负平方根（只写正根，丢掉另一实根）",
        status: "reviewing",
        fsrsDifficulty: 5.8,
        fsrsStability: 3.5,
        reps: 2,
        lapses: 1,
        twinClearStreak: 2, // 1 more Good/Easy twin variant clears this wrong question!
        createdAt: threeDaysAgoIso,
        lastReviewedAt: yesterdayIso,
        nextReviewAt: dueNowIso,
      },
      {
        id: "wq_mia_bar",
        studentId: "stu_mia",
        topicId: "mt_math_ratio_percent",
        templateId: wqMia1.templateId,
        questionSnapshotJson: wqMia1,
        wrongUserAnswer: Object.keys(wqMia1.misconceptionsByValue ?? {})[0] ?? "48",
        misconceptionTag: "misc_percent_wrong_base",
        misconceptionLabel: "条形图量率对应混淆“所占份数”与“剩余份数”基准量",
        status: "active",
        fsrsDifficulty: 6.5,
        fsrsStability: 0.9,
        reps: 1,
        lapses: 1,
        twinClearStreak: 0,
        createdAt: yesterdayIso,
        lastReviewedAt: yesterdayIso,
        nextReviewAt: dueNowIso,
      },
      {
        id: "wq_mia_area",
        studentId: "stu_mia",
        topicId: "mt_math_geometry_area_perim",
        templateId: wqMia2.templateId,
        questionSnapshotJson: wqMia2,
        wrongUserAnswer: Object.keys(wqMia2.misconceptionsByValue ?? {})[0] ?? "60",
        misconceptionTag: "misc_triangle_forget_half",
        misconceptionLabel: "计算三角形面积漏乘 1/2（算成等底等高平行四边形面积）",
        status: "reviewing",
        fsrsDifficulty: 5.4,
        fsrsStability: 2.8,
        reps: 2,
        lapses: 1,
        twinClearStreak: 2,
        createdAt: threeDaysAgoIso,
        lastReviewedAt: yesterdayIso,
        nextReviewAt: dueNowIso,
      },
    ])
    .onConflictDoNothing();

  // 11. Seed 3-Tier Differentiated Assignments from Teacher Ms. Wang
  await db
    .insert(differentiatedAssignments)
    .values([
      {
        id: "asg_foundational_bridge",
        classId: "cls_global_g9",
        teacherId: "tch_wang",
        title: "【靶向补基包】攻克分式方程倒数变形 → 打通物理并联欧姆定律",
        tier: "foundational",
        targetTopicIdsJson: [
          "mt_math_special_products_factor",
          "mt_math_rational_eq",
          "mt_phy_ohm_law",
        ],
        assignedStudentIdsJson: ["stu_leo", "stu_chloe", "stu_kenta", "stu_aryan"],
        completedStudentIdsJson: [],
        dueDate: nextWeekDate,
        createdAt: nowIso,
      },
      {
        id: "asg_standard_parabola",
        classId: "cls_global_g9",
        teacherId: "tch_wang",
        title: "【稳固进阶包】二次函数顶点式对称轴与动能定理综合演练",
        tier: "standard",
        targetTopicIdsJson: [
          "mt_math_quad_function_parabola",
          "mt_phy_work_kinetic_energy",
        ],
        assignedStudentIdsJson: ["stu_minjun", "stu_chloe"],
        completedStudentIdsJson: ["stu_minjun"],
        dueDate: nextWeekDate,
        createdAt: nowIso,
      },
      {
        id: "asg_challenge_calc",
        classId: "cls_global_g9",
        teacherId: "tch_wang",
        title: "【竞赛/A-Math 拔高包】多项式导数切线斜率与极值先修探究",
        tier: "challenge",
        targetTopicIdsJson: [
          "mt_math_trig_right_triangle",
          "mt_math_calc_derivative_tangent",
        ],
        assignedStudentIdsJson: ["stu_mei"],
        completedStudentIdsJson: ["stu_mei"],
        dueDate: nextWeekDate,
        createdAt: nowIso,
      },
    ])
    .onConflictDoNothing();

  // 12. Seed Phase 2 Real Auth Profiles, Kid PINs & Privacy Regimes
  const authSeedRows = [
    { userId: "stu_leo", loginHandle: "leo.lin@student.omnigraph.org", secretCode: "leo2026", kidPin: "880901", region: "CN" as const, ageGroup: "u14" },
    { userId: "stu_mia", loginHandle: "mia.lin@student.omnigraph.org", secretCode: "mia2026", kidPin: "550502", region: "SG" as const, ageGroup: "u13" },
    { userId: "stu_chloe", loginHandle: "chloe.chan@student.omnigraph.org", secretCode: "chloe2026", kidPin: "852309", region: "HK" as const, ageGroup: "u16" },
    { userId: "stu_mei", loginHandle: "mei.tan@student.omnigraph.org", secretCode: "mei2026", kidPin: "650901", region: "SG" as const, ageGroup: "u16" },
    { userId: "stu_kenta", loginHandle: "kenta.sato@student.omnigraph.org", secretCode: "kenta2026", kidPin: "810315", region: "JP" as const, ageGroup: "u16" },
    { userId: "stu_minjun", loginHandle: "minjun.kim@student.omnigraph.org", secretCode: "minjun2026", kidPin: "820412", region: "KR" as const, ageGroup: "u14" },
    { userId: "stu_aryan", loginHandle: "aryan.lim@student.omnigraph.org", secretCode: "aryan2026", kidPin: "600718", region: "MY" as const, ageGroup: "u16" },
    { userId: "tch_wang", loginHandle: "wang@omnigraph.edu", secretCode: "teach123", kidPin: null, region: "CN" as const, ageGroup: "adult" },
    { userId: "par_lin", loginHandle: "lin@family.org", secretCode: "parent123", kidPin: null, region: "CN" as const, ageGroup: "adult" },
  ];

  await db
    .insert(userAuthProfiles)
    .values(
      authSeedRows.map((row) => ({
        userId: row.userId,
        loginHandle: row.loginHandle,
        secretCode: hashSecret(row.secretCode),
        kidPin: row.kidPin ? hashKidPin(row.kidPin) : null,
        anonymousToken: computeAnonToken(row.userId, row.region),
        ageGroup: row.ageGroup,
        parentConsentVerified: true,
        privacyRegime: PRIVACY_REGIMES[row.region].regulationName,
      }))
    )
    .onConflictDoNothing();

  // 13. Seed Parent-Student Anti-Addiction Screen-Time & Positive Incentive Pacts
  await db
    .insert(studyPacts)
    .values([
      {
        id: "pact_leo",
        studentId: "stu_leo",
        parentId: "par_lin",
        dailyLimitMinutes: 50,
        todayUsedMinutes: 32,
        weeklyTargetNodes: 4,
        completedNodesThisWeek: 3,
        rewardTitle: "周末香港科学馆电学特展门票 + 自由球场运动 2 小时",
        badgeUnlocked: false,
        updatedAt: nowIso,
      },
      {
        id: "pact_mia",
        studentId: "stu_mia",
        parentId: "par_lin",
        dailyLimitMinutes: 30,
        todayUsedMinutes: 18,
        weeklyTargetNodes: 3,
        completedNodesThisWeek: 3,
        rewardTitle: "解锁「新加坡条形建模小达人」勋章 + 周末亲子烘焙时光",
        badgeUnlocked: true,
        updatedAt: nowIso,
      },
    ])
    .onConflictDoNothing();

  // 14. Seed Online Elo-IRT 2PL Empirical Calibration Stats across all 150 Templates
  const topicGradeMap = new Map(ALL_CANONICAL_TOPICS.map((t) => [t.id, t.baselineGrade]));
  const empiricalBumpByTopic: Record<string, number> = {
    mt_math_special_products_factor: 0.42,
    mt_math_rational_eq: 0.58,
    mt_phy_ohm_law: 0.64,
    mt_math_quad_complete_sq: 0.36,
    mt_chem_molar_concentration: 0.48,
    mt_cs_algo_complexity: 0.51,
    mt_lit_logical_fallacy: 0.29,
    mt_math_place_value_ops: -0.22,
    mt_math_frac_concept_equiv: -0.18,
  };

  const irtRows = ALL_QUESTION_TEMPLATES.map((qt, idx) => {
    const grade = topicGradeMap.get(qt.topicId) ?? 8;
    const priorBeta = priorBetaForDifficulty(qt.difficulty, grade);
    const bump = empiricalBumpByTopic[qt.topicId] ?? (((idx % 7) - 3) * 0.06);
    const calibratedBeta = Math.round(Math.max(-2.8, Math.min(2.8, priorBeta + bump)) * 100) / 100;
    const attempts = 24 + (idx % 9) * 7;
    const passRate = Math.max(0.18, Math.min(0.94, 1 / (1 + Math.exp(1.15 * calibratedBeta))));
    const correct = Math.round(attempts * passRate);
    return {
      templateId: qt.id,
      topicId: qt.topicId,
      priorBeta,
      calibratedBeta,
      discriminationAlpha: Math.round((1.05 + (idx % 5) * 0.14) * 100) / 100,
      attempts,
      correct,
      updatedAt: nowIso,
    };
  });

  for (let i = 0; i < irtRows.length; i += 75) {
    await db
      .insert(irtItemStats)
      .values(irtRows.slice(i, i + 75))
      .onConflictDoNothing();
  }

  // 15. Seed Longitudinal Student Attempt Logs for Leo (for BKT/IRT Growth Chart)
  const leoAnon = computeAnonToken("stu_leo", "CN");
  const longitudinalHistory = [
    { dayOffset: -7, topicId: "mt_math_linear_eq_one", templateId: "tpl_mt_math_linear_eq_one_standard", isCorrect: true, pAfter: 0.84, theta: 0.62 },
    { dayOffset: -6, topicId: "mt_math_special_products_factor", templateId: "tpl_mt_math_special_products_factor_standard", isCorrect: false, pAfter: 0.28, theta: -0.35 },
    { dayOffset: -5, topicId: "mt_math_rational_eq", templateId: "tpl_mt_math_rational_eq_standard", isCorrect: false, pAfter: 0.24, theta: -0.48 },
    { dayOffset: -4, topicId: "mt_phy_ohm_law", templateId: "tpl_mt_phy_ohm_law_standard", isCorrect: false, pAfter: 0.25, theta: -0.42 },
    { dayOffset: -3, topicId: "mt_chem_stoichiometry_conservation", templateId: "tpl_mt_chem_stoichiometry_conservation_standard", isCorrect: true, pAfter: 0.83, theta: 0.22 },
    { dayOffset: -2, topicId: "mt_cs_loops_trace", templateId: "tpl_mt_cs_loops_trace_standard", isCorrect: true, pAfter: 0.89, theta: 0.54 },
    { dayOffset: -1, topicId: "mt_math_quad_complete_sq", templateId: "tpl_mt_math_quad_complete_sq_basic", isCorrect: true, pAfter: 0.51, theta: 0.68 },
    { dayOffset: 0, topicId: "mt_lit_main_idea_structure", templateId: "tpl_mt_lit_main_idea_structure_standard", isCorrect: true, pAfter: 0.91, theta: 0.88 },
  ];

  await db
    .insert(attemptLogs)
    .values(
      longitudinalHistory.map((item, idx) => ({
        id: `att_seed_leo_${idx + 1}`,
        studentAnonToken: leoAnon,
        studentId: "stu_leo",
        topicId: item.topicId,
        templateId: item.templateId,
        isCorrect: item.isCorrect,
        pMasteryAfter: item.pAfter,
        thetaEstimate: item.theta,
        createdAt: new Date(now.getTime() + item.dayOffset * 24 * 3600 * 1000).toISOString(),
      }))
    )
    .onConflictDoNothing();

  // 16. Seed Sample School-Based Custom Edge, Custom KaTeX Question & Privacy Audit Logs
  await db
    .insert(customSchoolEdges)
    .values([
      {
        id: "cse_chem_molar_rational",
        topicId: "mt_chem_molar_concentration",
        prerequisiteId: "mt_math_rational_eq",
        relationType: "cross_subject",
        reasonZh: "校本教研补充：溶液混合与稀释反求体积比例需熟练解分式方程",
        reasonEn: "School Studio: Mixing/dilution volume ratios rely on rational equations",
        createdBy: "王知行老师 Ms. Evelyn Wang",
        createdAt: nowIso,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(customSchoolQuestions)
    .values([
      {
        id: "csq_ohm_bridge_1",
        topicId: "mt_phy_ohm_law",
        difficulty: "standard",
        promptZh: "【校本自建联考题】在双语物理实验课中，已知定值电阻 $R_1 = 6\\,\\Omega$ 与 $R_2 = 12\\,\\Omega$ 并联接在 $12\\,\\text{V}$ 电源两端，电路干路总电流 $I$ 为多少？",
        promptEn: "[School Benchmark] Given $R_1 = 6\\,\\Omega$ in parallel with $R_2 = 12\\,\\Omega$ across a $12\\,\\text{V}$ source, find total current $I$:",
        latexFormula: "I = \\frac{U}{R_{\\text{eq}}}, \\quad \\frac{1}{R_{\\text{eq}}} = \\frac{1}{6} + \\frac{1}{12}",
        choicesJson: ["3 A", "1.5 A", "0.67 A", "4 A"],
        answer: "A",
        explanationZh: "先算并联等效电阻 $\\frac{1}{R_{\\text{eq}}} = \\frac{1}{6} + \\frac{1}{12} = \\frac{1}{4} \\Rightarrow R_{\\text{eq}} = 4\\,\\Omega$，再由 $I = \\frac{12}{4} = 3\\,\\text{A}$ 得选项 A。",
        createdBy: "王知行老师 Ms. Evelyn Wang",
        createdAt: nowIso,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(privacyAuditLogs)
    .values([
      {
        id: "pal_seed_1",
        timestamp: yesterdayIso,
        actorAnonToken: leoAnon,
        regionCode: "CN",
        regulation: PRIVACY_REGIMES.CN.regulationName,
        endpoint: "/api/tutor",
        redactedFieldsJson: ["STUDENT_NAME", "SCHOOL_NAME"],
        payloadPreview: "我是[REDACTED_SCHOOL]的[REDACTED_NAME]，请问 1/R = 1/6 + 1/12 怎么通分？",
      },
      {
        id: "pal_seed_2",
        timestamp: nowIso,
        actorAnonToken: computeAnonToken("stu_mia", "SG"),
        regionCode: "SG",
        regulation: PRIVACY_REGIMES.SG.regulationName,
        endpoint: "/api/capture",
        redactedFieldsJson: ["STUDENT_NAME", "PHONE"],
        payloadPreview: "[REDACTED_NAME] (+65 [REDACTED_PHONE]) Capture note: Bar model total S$120, find 3/5...",
      },
    ])
    .onConflictDoNothing();
}

// Allow direct CLI execution via `pnpm db:seed`
const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].endsWith("seed.ts");

if (isDirectRun) {
  ensureSeeded(true)
    .then(() => {
      console.log("✅ OmniGraph K12 SQLite Database Seeded Successfully (data/omnigraph.db)!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
