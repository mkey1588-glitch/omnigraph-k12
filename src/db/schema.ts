import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import type {
  LocalizedText,
  MicroLessonPayload,
  NotationProfile,
  DiagnosticSessionState,
  GeneratedQuestionInstance,
} from "@/types/taxonomy";

/**
 * 1. Global 9 Regions Configuration (CN, HK, TW, SG, MY, JP, KR, UK, US)
 */
export const regions = sqliteTable("regions", {
  code: text("code").primaryKey(), // 'CN' | 'HK' | 'TW' | 'SG' | 'MY' | 'JP' | 'KR' | 'UK' | 'US'
  flag: text("flag").notNull(),
  nameZh: text("name_zh").notNull(),
  nameLocal: text("name_local").notNull(),
  nameEn: text("name_en").notNull(),
  primaryLocale: text("primary_locale").notNull(),
  secondaryLocale: text("secondary_locale"),
  schoolSystem: text("school_system").notNull(),
  curriculumName: text("curriculum_name").notNull(),
  flagshipExamsJson: text("flagship_exams_json", { mode: "json" }).$type<string[]>().notNull(),
  privacyRegulation: text("privacy_regulation").notNull(),
  gradeLabelsJson: text("grade_labels_json", { mode: "json" }).$type<Record<number, string>>().notNull(),
  notationJson: text("notation_json", { mode: "json" }).$type<NotationProfile>().notNull(),
});

/**
 * 2. All-Subject Catalog
 */
export const subjects = sqliteTable("subjects", {
  id: text("id").primaryKey(), // 'math' | 'physics' | 'chemistry' | 'biology' | 'english' | 'computing' | 'geography' | 'history'
  icon: text("icon").notNull(),
  themeColor: text("theme_color").notNull(),
  nameJson: text("name_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  descriptionJson: text("description_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * 3. Canonical Micro-Topics (Language & Country Neutral Cognitive Core)
 */
export const canonicalTopics = sqliteTable("canonical_topics", {
  id: text("id").primaryKey(), // e.g. 'mt_math_quad_complete_sq'
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  domain: text("domain").notNull(),
  domainJson: text("domain_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  cognitiveType: text("cognitive_type").notNull(), // 'conceptual' | 'procedural' | 'reasoning' | 'application' | 'modeling'
  baselineGrade: integer("baseline_grade").notNull(), // Global reference grade 1..12 for topological tie-breaking
  centrality: real("centrality").notNull().default(0.5), // 0..1 graph hub importance
  titleJson: text("title_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  descriptionJson: text("description_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  masteryCriteriaJson: text("mastery_criteria_json", { mode: "json" }).$type<LocalizedText[]>().notNull(),
  homeCheckPromptJson: text("home_check_prompt_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  microLessonJson: text("micro_lesson_json", { mode: "json" }).$type<MicroLessonPayload>().notNull(),
  rootReason: text("root_reason"), // Required if node has zero within-subject prerequisites
});

/**
 * 4. Directed Acyclic Graph (DAG) Prerequisite & Cross-Subject Bridge Edges
 *    Meaning: `topicId` depends on `prerequisiteId`
 */
export const topicEdges = sqliteTable(
  "topic_edges",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => canonicalTopics.id),
    prerequisiteId: text("prerequisite_id")
      .notNull()
      .references(() => canonicalTopics.id),
    relationType: text("relation_type").notNull(), // 'hard' | 'soft' | 'cross_subject'
    reasonJson: text("reason_json", { mode: "json" }).$type<LocalizedText>().notNull(),
  },
  (t) => [primaryKey({ columns: [t.topicId, t.prerequisiteId] })]
);

/**
 * 5. Scoped 9-Region Curriculum & Textbook Alignments (Codes-Only Policy)
 */
export const regionalAlignments = sqliteTable(
  "regional_alignments",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => canonicalTopics.id),
    regionCode: text("region_code")
      .notNull()
      .references(() => regions.code),
    localGrade: integer("local_grade").notNull(),
    localStageLabel: text("local_stage_label").notNull(),
    standardCode: text("standard_code").notNull(),
    textbookEdition: text("textbook_edition").notNull(),
    localChapterTitle: text("local_chapter_title").notNull(),
    examWeight: text("exam_weight").notNull().default("core"), // 'core' | 'extension' | 'enrichment'
    regionalNote: text("regional_note"),
  },
  (t) => [primaryKey({ columns: [t.topicId, t.regionCode] })]
);

/**
 * 6. Parameterized Question Templates (Anti-Memorization Generator Registry)
 */
export const questionTemplates = sqliteTable("question_templates", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => canonicalTopics.id),
  difficulty: text("difficulty").notNull(), // 'basic' | 'standard' | 'challenge'
  itemType: text("item_type").notNull(), // 'choice' | 'numeric' | 'expression'
  generatorKey: text("generator_key").notNull(), // Links to deterministic generator function in item-generator.ts
  titleNote: text("title_note").notNull(),
});

/**
 * 7. Multi-Role Users (Student / Teacher / Parent) & Relationships
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  role: text("role").notNull(), // 'student' | 'teacher' | 'parent'
  displayName: text("display_name").notNull(),
  avatarEmoji: text("avatar_emoji").notNull(),
  regionCode: text("region_code")
    .notNull()
    .references(() => regions.code),
  currentGrade: integer("current_grade"), // For students (1..12)
  schoolTrack: text("school_track"), // e.g. '人教版六三制', 'HKDSE EMI Bilingual', 'Singapore Express / G3'
  targetTransitionRegion: text("target_transition_region"), // For cross-border benchmarking in Parent Portal
  createdAt: text("created_at").notNull(),
});

export const classrooms = sqliteTable("classrooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  regionCode: text("region_code")
    .notNull()
    .references(() => regions.code),
  grade: integer("grade").notNull(),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  inviteCode: text("invite_code").notNull(),
});

export const classMemberships = sqliteTable(
  "class_memberships",
  {
    classId: text("class_id")
      .notNull()
      .references(() => classrooms.id),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.classId, t.studentId] })]
);

export const parentChildLinks = sqliteTable(
  "parent_child_links",
  {
    parentId: text("parent_id")
      .notNull()
      .references(() => users.id),
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    relationshipLabel: text("relationship_label").notNull(),
  },
  (t) => [primaryKey({ columns: [t.parentId, t.studentId] })]
);

/**
 * 8. Student Fine-Grained Knowledge State Vector (DAG Mastery + BKT + FSRS)
 */
export const studentTopicStates = sqliteTable(
  "student_topic_states",
  {
    studentId: text("student_id")
      .notNull()
      .references(() => users.id),
    topicId: text("topic_id")
      .notNull()
      .references(() => canonicalTopics.id),
    status: text("status").notNull().default("untested"), // 'untested' | 'mastered' | 'inferred_mastered' | 'shaky' | 'weak'
    pMastery: real("p_mastery").notNull().default(0.25), // 0..1 Bayesian probability
    attemptsCount: integer("attempts_count").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    isRootCause: integer("is_root_cause", { mode: "boolean" }).notNull().default(false),
    lastMisconception: text("last_misconception"),
    fsrsDifficulty: real("fsrs_difficulty").notNull().default(5.0),
    fsrsStability: real("fsrs_stability").notNull().default(0.0), // Days
    lastPracticedAt: text("last_practiced_at"),
    nextReviewAt: text("next_review_at"),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.topicId] })]
);

/**
 * 9. FSRS Wrong-Question Book (错题本 + 迷思标签 + 孪生变式清零记录)
 */
export const wrongQuestions = sqliteTable("wrong_questions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  topicId: text("topic_id")
    .notNull()
    .references(() => canonicalTopics.id),
  templateId: text("template_id").notNull(),
  questionSnapshotJson: text("question_snapshot_json", { mode: "json" })
    .$type<GeneratedQuestionInstance>()
    .notNull(),
  wrongUserAnswer: text("wrong_user_answer").notNull(),
  misconceptionTag: text("misconception_tag"),
  misconceptionLabel: text("misconception_label"),
  status: text("status").notNull().default("active"), // 'active' | 'reviewing' | 'cleared'
  fsrsDifficulty: real("fsrs_difficulty").notNull().default(6.2),
  fsrsStability: real("fsrs_stability").notNull().default(0.5), // Days
  reps: integer("reps").notNull().default(0),
  lapses: integer("lapses").notNull().default(1),
  twinClearStreak: integer("twin_clear_streak").notNull().default(0), // Needs >= 3 Good/Easy twin variants to mark 'cleared'
  createdAt: text("created_at").notNull(),
  lastReviewedAt: text("last_reviewed_at").notNull(),
  nextReviewAt: text("next_review_at").notNull(),
});

/**
 * 10. Diagnostic Sessions Persistence
 */
export const diagnosticSessions = sqliteTable("diagnostic_sessions", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  subjectId: text("subject_id").notNull(),
  regionCode: text("region_code").notNull(),
  label: text("label").notNull(),
  stateJson: text("state_json", { mode: "json" }).$type<DiagnosticSessionState>().notNull(),
  weakRootsJson: text("weak_roots_json", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/**
 * 11. Teacher Differentiated Assignments (三档分层任务包：补基 / 巩固 / 拔高)
 */
export const differentiatedAssignments = sqliteTable("differentiated_assignments", {
  id: text("id").primaryKey(),
  classId: text("class_id")
    .notNull()
    .references(() => classrooms.id),
  teacherId: text("teacher_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  tier: text("tier").notNull(), // 'foundational' | 'standard' | 'challenge'
  targetTopicIdsJson: text("target_topic_ids_json", { mode: "json" }).$type<string[]>().notNull(),
  assignedStudentIdsJson: text("assigned_student_ids_json", { mode: "json" }).$type<string[]>().notNull(),
  completedStudentIdsJson: text("completed_student_ids_json", { mode: "json" }).$type<string[]>().notNull(),
  dueDate: text("due_date").notNull(),
  createdAt: text("created_at").notNull(),
});

/**
 * 12. Real Auth Credentials, Family Kid-PIN & 9-Region Privacy Consent Profiles
 */
export const userAuthProfiles = sqliteTable("user_auth_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id),
  loginHandle: text("login_handle").notNull(),
  secretCode: text("secret_code").notNull(),
  kidPin: text("kid_pin"),
  anonymousToken: text("anonymous_token").notNull(),
  ageGroup: text("age_group").notNull().default("u14"), // 'u13' | 'u16' | 'adult'
  parentConsentVerified: integer("parent_consent_verified", { mode: "boolean" })
    .notNull()
    .default(true),
  privacyRegime: text("privacy_regime").notNull(),
});

/**
 * 13. Parent-Student Screen-Time & Positive Incentive Pact (P4 防沉迷与激励约定)
 */
export const studyPacts = sqliteTable("study_pacts", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  parentId: text("parent_id")
    .notNull()
    .references(() => users.id),
  dailyLimitMinutes: integer("daily_limit_minutes").notNull().default(45),
  todayUsedMinutes: integer("today_used_minutes").notNull().default(25),
  weeklyTargetNodes: integer("weekly_target_nodes").notNull().default(4),
  completedNodesThisWeek: integer("completed_nodes_this_week").notNull().default(2),
  rewardTitle: text("reward_title").notNull(),
  badgeUnlocked: integer("badge_unlocked", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

/**
 * 14. 9-Region Minor PII De-Identification Audit Log
 */
export const privacyAuditLogs = sqliteTable("privacy_audit_logs", {
  id: text("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  actorAnonToken: text("actor_anon_token").notNull(),
  regionCode: text("region_code").notNull(),
  regulation: text("regulation").notNull(),
  endpoint: text("endpoint").notNull(),
  redactedFieldsJson: text("redacted_fields_json", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  payloadPreview: text("payload_preview").notNull(),
});

/**
 * 15. School Graph Studio: Custom Prerequisite Edges (with DAG Cycle Guard)
 */
export const customSchoolEdges = sqliteTable("custom_school_edges", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => canonicalTopics.id),
  prerequisiteId: text("prerequisite_id")
    .notNull()
    .references(() => canonicalTopics.id),
  relationType: text("relation_type").notNull().default("hard"),
  reasonZh: text("reason_zh").notNull(),
  reasonEn: text("reason_en").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

/**
 * 16. School Graph Studio: Custom KaTeX School-Based Questions
 */
export const customSchoolQuestions = sqliteTable("custom_school_questions", {
  id: text("id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => canonicalTopics.id),
  difficulty: text("difficulty").notNull().default("standard"),
  promptZh: text("prompt_zh").notNull(),
  promptEn: text("prompt_en").notNull(),
  latexFormula: text("latex_formula"),
  choicesJson: text("choices_json", { mode: "json" }).$type<string[]>().notNull(),
  answer: text("answer").notNull(),
  explanationZh: text("explanation_zh").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
});

/**
 * 17. Online Elo-IRT 2PL Item Calibration Stats (Data Flywheel)
 */
export const irtItemStats = sqliteTable("irt_item_stats", {
  templateId: text("template_id").primaryKey(),
  topicId: text("topic_id")
    .notNull()
    .references(() => canonicalTopics.id),
  priorBeta: real("prior_beta").notNull().default(0.0),
  calibratedBeta: real("calibrated_beta").notNull().default(0.0),
  discriminationAlpha: real("discrimination_alpha").notNull().default(1.1),
  attempts: integer("attempts").notNull().default(0),
  correct: integer("correct").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

/**
 * 18. Longitudinal Student Attempt Logs (Anonymized Token + Mastery Growth Curve)
 */
export const attemptLogs = sqliteTable("attempt_logs", {
  id: text("id").primaryKey(),
  studentAnonToken: text("student_anon_token").notNull(),
  studentId: text("student_id")
    .notNull()
    .references(() => users.id),
  topicId: text("topic_id")
    .notNull()
    .references(() => canonicalTopics.id),
  templateId: text("template_id").notNull(),
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  pMasteryAfter: real("p_mastery_after").notNull(),
  thetaEstimate: real("theta_estimate").notNull(),
  createdAt: text("created_at").notNull(),
});
