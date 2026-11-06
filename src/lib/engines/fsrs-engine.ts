/**
 * Clean-Room FSRS (Free Spaced Repetition Scheduler) DSR Engine
 * Models memory via three variables:
 *   - D (Difficulty, 1..10)
 *   - S (Stability in days: interval at which retrievability R = 90%)
 *   - R (Retrievability, 0..1: probability of recall after elapsed days t)
 * Plus OmniGraph's Twin-Variant Clearance rule (>= 3 Good/Easy streaks on fresh variants -> 'cleared').
 */

export type FsrsRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy

export type WrongQuestionStatus = "active" | "reviewing" | "cleared";

export interface FsrsCardState {
  difficulty: number; // 1.0 .. 10.0
  stability: number; // days (> 0)
  reps: number;
  lapses: number;
  twinClearStreak: number;
  status: WrongQuestionStatus;
  lastReviewedAt: string;
  nextReviewAt: string;
}

export interface FsrsScheduleResult extends FsrsCardState {
  retrievabilityBefore: number;
  scheduledDays: number;
}

const DECAY = -0.5;
const FACTOR = 19 / 81; // Ensures R(t = S, S) = (1 + 19/81)^(-0.5) = 0.90

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function round2(val: number): number {
  return Math.round(val * 100) / 100;
}

/**
 * Compute memory retrievability R(t, S) in [0, 1].
 * At t = 0 -> 1.00; at t = S -> 0.90.
 */
export function computeRetrievability(
  stabilityDays: number,
  elapsedDays: number
): number {
  if (elapsedDays <= 0) return 1;
  const safeS = Math.max(0.1, stabilityDays);
  const r = Math.pow(1 + FACTOR * (elapsedDays / safeS), DECAY);
  return clamp(round2(r), 0.01, 1);
}

/**
 * Compute elapsed days between two timestamps.
 */
export function getElapsedDays(fromIso: string, toDate: Date = new Date()): number {
  const fromMs = new Date(fromIso).getTime();
  if (Number.isNaN(fromMs)) return 0;
  const diffDays = (toDate.getTime() - fromMs) / (1000 * 60 * 60 * 24);
  return Math.max(0, diffDays);
}

/**
 * Initial FSRS card state when a student misses a question in diagnosis/practice.
 */
export function createInitialWrongCard(now: Date = new Date()): FsrsCardState {
  const nowIso = now.toISOString();
  // Due immediately / within 4 hours for first remediation
  const due = new Date(now.getTime());
  return {
    difficulty: 6.4,
    stability: 0.4,
    reps: 0,
    lapses: 1,
    twinClearStreak: 0,
    status: "active",
    lastReviewedAt: nowIso,
    nextReviewAt: due.toISOString(),
  };
}

/**
 * Schedule next FSRS review and update Twin-Variant Clearance streak.
 */
export function scheduleFsrsReview(
  card: FsrsCardState,
  rating: FsrsRating,
  now: Date = new Date()
): FsrsScheduleResult {
  const elapsedDays = getElapsedDays(card.lastReviewedAt, now);
  const retrievabilityBefore = computeRetrievability(card.stability, elapsedDays);

  // Difficulty update with mean reversion toward D0 = 5.0
  const deltaD = -0.85 * (rating - 3);
  const rawD = card.difficulty + deltaD;
  const nextDifficulty = round2(clamp(0.85 * rawD + 0.15 * 5.0, 1.0, 10.0));

  let nextStability: number;
  let nextReps = card.reps;
  let nextLapses = card.lapses;
  let nextStreak = card.twinClearStreak;
  let nextStatus: WrongQuestionStatus = card.status;
  let scheduledDays: number;

  if (rating === 1) {
    // Lapse ("Again"): stability drops sharply, streak resets to 0, re-queued within 6 hours
    nextStability = round2(Math.max(0.25, card.stability * 0.35));
    nextLapses += 1;
    nextStreak = 0;
    nextStatus = "active";
    scheduledDays = 0.25;
  } else {
    nextReps += 1;
    if (card.reps === 0) {
      // First successful recall after initial wrong capture
      const baseByRating: Record<2 | 3 | 4, number> = {
        2: 1.2,
        3: 3.0,
        4: 6.5,
      };
      nextStability = baseByRating[rating];
    } else {
      const ratingBonus = rating === 2 ? 0.65 : rating === 4 ? 1.45 : 1.0;
      const desirabilityBoost = Math.exp(0.45 * (1 - retrievabilityBefore)) - 0.05;
      const growth =
        1 +
        0.32 *
          (11 - nextDifficulty) *
          Math.pow(Math.max(0.5, card.stability), -0.2) *
          Math.max(0.25, desirabilityBoost) *
          ratingBonus;
      nextStability = round2(clamp(card.stability * growth, 0.8, 365));
    }

    if (rating >= 3) {
      nextStreak += 1;
    }

    nextStatus = nextStreak >= 3 ? "cleared" : "reviewing";
    scheduledDays =
      rating === 2
        ? Math.max(1, Math.round(nextStability * 0.7))
        : Math.max(1, Math.round(nextStability));
  }

  const nextReviewDate = new Date(
    now.getTime() + scheduledDays * 24 * 60 * 60 * 1000
  );

  return {
    difficulty: nextDifficulty,
    stability: nextStability,
    reps: nextReps,
    lapses: nextLapses,
    twinClearStreak: nextStreak,
    status: nextStatus,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: nextReviewDate.toISOString(),
    retrievabilityBefore,
    scheduledDays,
  };
}
