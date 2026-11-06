import fs from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

function resolveDatabaseUrl(): string {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) {
    return configured;
  }
  // On Vercel Serverless (/var/task is read-only), default zero-config demo DB to writable /tmp
  if (process.env.VERCEL) {
    return "file:/tmp/omnigraph.db";
  }
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return `file:${path.join(dataDir, "omnigraph.db")}`;
}

const dbUrl = resolveDatabaseUrl();
// If a relative file:./data/... URL is explicitly set locally, ensure parent dir exists when writable
if (dbUrl.startsWith("file:") && !process.env.VERCEL) {
  const filePath = dbUrl.slice("file:".length);
  const parentDir = path.dirname(path.resolve(process.cwd(), filePath));
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
}

const globalForDb = globalThis as unknown as {
  libsqlClient?: Client;
  drizzleDb?: LibSQLDatabase<typeof schema>;
  schemaInitialized?: boolean;
};

export const libsqlClient =
  globalForDb.libsqlClient ??
  createClient({
    url: dbUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });

export const db = globalForDb.drizzleDb ?? drizzle(libsqlClient, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsqlClient = libsqlClient;
  globalForDb.drizzleDb = db;
}

const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS regions (
    code TEXT PRIMARY KEY NOT NULL,
    flag TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    name_local TEXT NOT NULL,
    name_en TEXT NOT NULL,
    primary_locale TEXT NOT NULL,
    secondary_locale TEXT,
    school_system TEXT NOT NULL,
    curriculum_name TEXT NOT NULL,
    flagship_exams_json TEXT NOT NULL,
    privacy_regulation TEXT NOT NULL,
    grade_labels_json TEXT NOT NULL,
    notation_json TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY NOT NULL,
    icon TEXT NOT NULL,
    theme_color TEXT NOT NULL,
    name_json TEXT NOT NULL,
    description_json TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );`,
  `CREATE TABLE IF NOT EXISTS canonical_topics (
    id TEXT PRIMARY KEY NOT NULL,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    domain TEXT NOT NULL,
    domain_json TEXT NOT NULL,
    cognitive_type TEXT NOT NULL,
    baseline_grade INTEGER NOT NULL,
    centrality REAL NOT NULL DEFAULT 0.5,
    title_json TEXT NOT NULL,
    description_json TEXT NOT NULL,
    mastery_criteria_json TEXT NOT NULL,
    home_check_prompt_json TEXT NOT NULL,
    micro_lesson_json TEXT NOT NULL,
    root_reason TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS topic_edges (
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    prerequisite_id TEXT NOT NULL REFERENCES canonical_topics(id),
    relation_type TEXT NOT NULL,
    reason_json TEXT NOT NULL,
    PRIMARY KEY (topic_id, prerequisite_id)
  );`,
  `CREATE TABLE IF NOT EXISTS regional_alignments (
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    region_code TEXT NOT NULL REFERENCES regions(code),
    local_grade INTEGER NOT NULL,
    local_stage_label TEXT NOT NULL,
    standard_code TEXT NOT NULL,
    textbook_edition TEXT NOT NULL,
    local_chapter_title TEXT NOT NULL,
    exam_weight TEXT NOT NULL DEFAULT 'core',
    regional_note TEXT,
    PRIMARY KEY (topic_id, region_code)
  );`,
  `CREATE TABLE IF NOT EXISTS question_templates (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    difficulty TEXT NOT NULL,
    item_type TEXT NOT NULL,
    generator_key TEXT NOT NULL,
    title_note TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    role TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_emoji TEXT NOT NULL,
    region_code TEXT NOT NULL REFERENCES regions(code),
    current_grade INTEGER,
    school_track TEXT,
    target_transition_region TEXT,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS classrooms (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    teacher_id TEXT NOT NULL REFERENCES users(id),
    region_code TEXT NOT NULL REFERENCES regions(code),
    grade INTEGER NOT NULL,
    subject_id TEXT NOT NULL REFERENCES subjects(id),
    invite_code TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS class_memberships (
    class_id TEXT NOT NULL REFERENCES classrooms(id),
    student_id TEXT NOT NULL REFERENCES users(id),
    PRIMARY KEY (class_id, student_id)
  );`,
  `CREATE TABLE IF NOT EXISTS parent_child_links (
    parent_id TEXT NOT NULL REFERENCES users(id),
    student_id TEXT NOT NULL REFERENCES users(id),
    relationship_label TEXT NOT NULL,
    PRIMARY KEY (parent_id, student_id)
  );`,
  `CREATE TABLE IF NOT EXISTS student_topic_states (
    student_id TEXT NOT NULL REFERENCES users(id),
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    status TEXT NOT NULL DEFAULT 'untested',
    p_mastery REAL NOT NULL DEFAULT 0.25,
    attempts_count INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    is_root_cause INTEGER NOT NULL DEFAULT 0,
    last_misconception TEXT,
    fsrs_difficulty REAL NOT NULL DEFAULT 5.0,
    fsrs_stability REAL NOT NULL DEFAULT 0.0,
    last_practiced_at TEXT,
    next_review_at TEXT,
    PRIMARY KEY (student_id, topic_id)
  );`,
  `CREATE TABLE IF NOT EXISTS wrong_questions (
    id TEXT PRIMARY KEY NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id),
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    template_id TEXT NOT NULL,
    question_snapshot_json TEXT NOT NULL,
    wrong_user_answer TEXT NOT NULL,
    misconception_tag TEXT,
    misconception_label TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    fsrs_difficulty REAL NOT NULL DEFAULT 6.2,
    fsrs_stability REAL NOT NULL DEFAULT 0.5,
    reps INTEGER NOT NULL DEFAULT 0,
    lapses INTEGER NOT NULL DEFAULT 1,
    twin_clear_streak INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_reviewed_at TEXT NOT NULL,
    next_review_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS diagnostic_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id),
    subject_id TEXT NOT NULL,
    region_code TEXT NOT NULL,
    label TEXT NOT NULL,
    state_json TEXT NOT NULL,
    weak_roots_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS differentiated_assignments (
    id TEXT PRIMARY KEY NOT NULL,
    class_id TEXT NOT NULL REFERENCES classrooms(id),
    teacher_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    tier TEXT NOT NULL,
    target_topic_ids_json TEXT NOT NULL,
    assigned_student_ids_json TEXT NOT NULL,
    completed_student_ids_json TEXT NOT NULL,
    due_date TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS user_auth_profiles (
    user_id TEXT PRIMARY KEY NOT NULL REFERENCES users(id),
    login_handle TEXT NOT NULL,
    secret_code TEXT NOT NULL,
    kid_pin TEXT,
    anonymous_token TEXT NOT NULL,
    age_group TEXT NOT NULL DEFAULT 'u14',
    parent_consent_verified INTEGER NOT NULL DEFAULT 1,
    privacy_regime TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS study_pacts (
    id TEXT PRIMARY KEY NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id),
    parent_id TEXT NOT NULL REFERENCES users(id),
    daily_limit_minutes INTEGER NOT NULL DEFAULT 45,
    today_used_minutes INTEGER NOT NULL DEFAULT 25,
    weekly_target_nodes INTEGER NOT NULL DEFAULT 4,
    completed_nodes_this_week INTEGER NOT NULL DEFAULT 2,
    reward_title TEXT NOT NULL,
    badge_unlocked INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS privacy_audit_logs (
    id TEXT PRIMARY KEY NOT NULL,
    timestamp TEXT NOT NULL,
    actor_anon_token TEXT NOT NULL,
    region_code TEXT NOT NULL,
    regulation TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    redacted_fields_json TEXT NOT NULL,
    payload_preview TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS custom_school_edges (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    prerequisite_id TEXT NOT NULL REFERENCES canonical_topics(id),
    relation_type TEXT NOT NULL DEFAULT 'hard',
    reason_zh TEXT NOT NULL,
    reason_en TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS custom_school_questions (
    id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    difficulty TEXT NOT NULL DEFAULT 'standard',
    prompt_zh TEXT NOT NULL,
    prompt_en TEXT NOT NULL,
    latex_formula TEXT,
    choices_json TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation_zh TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS irt_item_stats (
    template_id TEXT PRIMARY KEY NOT NULL,
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    prior_beta REAL NOT NULL DEFAULT 0.0,
    calibrated_beta REAL NOT NULL DEFAULT 0.0,
    discrimination_alpha REAL NOT NULL DEFAULT 1.1,
    attempts INTEGER NOT NULL DEFAULT 0,
    correct INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS attempt_logs (
    id TEXT PRIMARY KEY NOT NULL,
    student_anon_token TEXT NOT NULL,
    student_id TEXT NOT NULL REFERENCES users(id),
    topic_id TEXT NOT NULL REFERENCES canonical_topics(id),
    template_id TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    p_mastery_after REAL NOT NULL,
    theta_estimate REAL NOT NULL,
    created_at TEXT NOT NULL
  );`,
];

export async function ensureSchema(): Promise<void> {
  if (globalForDb.schemaInitialized) return;
  for (const sql of DDL_STATEMENTS) {
    await libsqlClient.execute(sql);
  }
  globalForDb.schemaInitialized = true;
}
