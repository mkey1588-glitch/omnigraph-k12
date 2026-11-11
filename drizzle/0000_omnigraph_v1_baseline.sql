CREATE TABLE `attempt_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`student_anon_token` text NOT NULL,
	`student_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`template_id` text NOT NULL,
	`is_correct` integer NOT NULL,
	`p_mastery_after` real NOT NULL,
	`theta_estimate` real NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_attempts_student_created` ON `attempt_logs` (`student_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `canonical_topics` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`domain` text NOT NULL,
	`domain_json` text NOT NULL,
	`cognitive_type` text NOT NULL,
	`baseline_grade` integer NOT NULL,
	`centrality` real DEFAULT 0.5 NOT NULL,
	`title_json` text NOT NULL,
	`description_json` text NOT NULL,
	`mastery_criteria_json` text NOT NULL,
	`home_check_prompt_json` text NOT NULL,
	`micro_lesson_json` text NOT NULL,
	`root_reason` text,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_memberships` (
	`class_id` text NOT NULL,
	`student_id` text NOT NULL,
	PRIMARY KEY(`class_id`, `student_id`),
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`teacher_id` text NOT NULL,
	`region_code` text NOT NULL,
	`grade` integer NOT NULL,
	`subject_id` text NOT NULL,
	`invite_code` text NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `custom_school_edges` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`prerequisite_id` text NOT NULL,
	`relation_type` text DEFAULT 'hard' NOT NULL,
	`reason_zh` text NOT NULL,
	`reason_en` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prerequisite_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `custom_school_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`difficulty` text DEFAULT 'standard' NOT NULL,
	`prompt_zh` text NOT NULL,
	`prompt_en` text NOT NULL,
	`latex_formula` text,
	`choices_json` text NOT NULL,
	`answer` text NOT NULL,
	`explanation_zh` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `diagnostic_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`region_code` text NOT NULL,
	`label` text NOT NULL,
	`state_json` text NOT NULL,
	`weak_roots_json` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `differentiated_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`class_id` text NOT NULL,
	`teacher_id` text NOT NULL,
	`title` text NOT NULL,
	`tier` text NOT NULL,
	`target_topic_ids_json` text NOT NULL,
	`assigned_student_ids_json` text NOT NULL,
	`completed_student_ids_json` text NOT NULL,
	`due_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `irt_item_stats` (
	`template_id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`prior_beta` real DEFAULT 0 NOT NULL,
	`calibrated_beta` real DEFAULT 0 NOT NULL,
	`discrimination_alpha` real DEFAULT 1.1 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parent_child_links` (
	`parent_id` text NOT NULL,
	`student_id` text NOT NULL,
	`relationship_label` text NOT NULL,
	PRIMARY KEY(`parent_id`, `student_id`),
	FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `privacy_audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`actor_anon_token` text NOT NULL,
	`region_code` text NOT NULL,
	`regulation` text NOT NULL,
	`endpoint` text NOT NULL,
	`redacted_fields_json` text NOT NULL,
	`payload_preview` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `question_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`topic_id` text NOT NULL,
	`difficulty` text NOT NULL,
	`item_type` text NOT NULL,
	`generator_key` text NOT NULL,
	`title_note` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `regional_alignments` (
	`topic_id` text NOT NULL,
	`region_code` text NOT NULL,
	`local_grade` integer NOT NULL,
	`local_stage_label` text NOT NULL,
	`standard_code` text NOT NULL,
	`textbook_edition` text NOT NULL,
	`local_chapter_title` text NOT NULL,
	`exam_weight` text DEFAULT 'core' NOT NULL,
	`regional_note` text,
	PRIMARY KEY(`topic_id`, `region_code`),
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`code` text PRIMARY KEY NOT NULL,
	`flag` text NOT NULL,
	`name_zh` text NOT NULL,
	`name_local` text NOT NULL,
	`name_en` text NOT NULL,
	`primary_locale` text NOT NULL,
	`secondary_locale` text,
	`school_system` text NOT NULL,
	`curriculum_name` text NOT NULL,
	`flagship_exams_json` text NOT NULL,
	`privacy_regulation` text NOT NULL,
	`grade_labels_json` text NOT NULL,
	`notation_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `student_topic_states` (
	`student_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`status` text DEFAULT 'untested' NOT NULL,
	`p_mastery` real DEFAULT 0.25 NOT NULL,
	`attempts_count` integer DEFAULT 0 NOT NULL,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`is_root_cause` integer DEFAULT false NOT NULL,
	`last_misconception` text,
	`fsrs_difficulty` real DEFAULT 5 NOT NULL,
	`fsrs_stability` real DEFAULT 0 NOT NULL,
	`last_practiced_at` text,
	`next_review_at` text,
	PRIMARY KEY(`student_id`, `topic_id`),
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sts_student` ON `student_topic_states` (`student_id`);--> statement-breakpoint
CREATE TABLE `study_pacts` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`parent_id` text NOT NULL,
	`daily_limit_minutes` integer DEFAULT 45 NOT NULL,
	`today_used_minutes` integer DEFAULT 25 NOT NULL,
	`weekly_target_nodes` integer DEFAULT 4 NOT NULL,
	`completed_nodes_this_week` integer DEFAULT 2 NOT NULL,
	`reward_title` text NOT NULL,
	`badge_unlocked` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`icon` text NOT NULL,
	`theme_color` text NOT NULL,
	`name_json` text NOT NULL,
	`description_json` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `topic_edges` (
	`topic_id` text NOT NULL,
	`prerequisite_id` text NOT NULL,
	`relation_type` text NOT NULL,
	`reason_json` text NOT NULL,
	PRIMARY KEY(`topic_id`, `prerequisite_id`),
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`prerequisite_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_auth_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`login_handle` text NOT NULL,
	`secret_code` text NOT NULL,
	`kid_pin` text,
	`anonymous_token` text NOT NULL,
	`age_group` text DEFAULT 'u14' NOT NULL,
	`parent_consent_verified` integer DEFAULT true NOT NULL,
	`privacy_regime` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_auth_login_handle` ON `user_auth_profiles` (`login_handle`);--> statement-breakpoint
CREATE INDEX `idx_auth_kid_pin` ON `user_auth_profiles` (`kid_pin`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_emoji` text NOT NULL,
	`region_code` text NOT NULL,
	`current_grade` integer,
	`school_track` text,
	`target_transition_region` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`region_code`) REFERENCES `regions`(`code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wrong_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`topic_id` text NOT NULL,
	`template_id` text NOT NULL,
	`question_snapshot_json` text NOT NULL,
	`wrong_user_answer` text NOT NULL,
	`misconception_tag` text,
	`misconception_label` text,
	`status` text DEFAULT 'active' NOT NULL,
	`fsrs_difficulty` real DEFAULT 6.2 NOT NULL,
	`fsrs_stability` real DEFAULT 0.5 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 1 NOT NULL,
	`twin_clear_streak` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`last_reviewed_at` text NOT NULL,
	`next_review_at` text NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`topic_id`) REFERENCES `canonical_topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_wq_student_status` ON `wrong_questions` (`student_id`,`status`);