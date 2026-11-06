import type { DifficultyTier, LocaleCode } from "@/types/taxonomy";
import { c, uiPick } from "@/lib/i18n";

export interface IrtItemRecord {
  templateId: string;
  topicId: string;
  priorBeta: number; // Prior difficulty in [-3, +3]
  calibratedBeta: number; // Empirical difficulty calibrated from student logs
  discriminationAlpha: number; // 2PL slope in [0.5, 2.5]
  attempts: number;
  correct: number;
}

export function priorBetaForDifficulty(tier: DifficultyTier, baselineGrade = 7): number {
  const gradeOffset = (baselineGrade - 7) * 0.08;
  const base = tier === "basic" ? -0.85 : tier === "standard" ? 0.0 : 0.95;
  return Math.round((base + gradeOffset) * 100) / 100;
}

/**
 * Convert BKT mastery probability p in (0, 1) to latent trait ability theta in [-2.6, +2.6]
 */
export function masteryToTheta(pMastery: number): number {
  const clamped = Math.max(0.05, Math.min(0.95, pMastery));
  const logit = Math.log(clamped / (1 - clamped));
  return Math.round(Math.max(-2.6, Math.min(2.6, logit * 0.85)) * 100) / 100;
}

/**
 * 2-Parameter Logistic (2PL) IRT probability of a correct response:
 * P(correct | theta, alpha, beta) = 1 / (1 + exp(-alpha * (theta - beta)))
 */
export function irt2PLProbability(
  theta: number,
  beta: number,
  alpha = 1.1
): number {
  const z = Math.max(-12, Math.min(12, alpha * (theta - beta)));
  return 1 / (1 + Math.exp(-z));
}

/**
 * Online Elo-IRT calibration step (Data Flywheel):
 * - When students fail an item that their theta predicted they'd pass (S < E),
 *   calibratedBeta increases (item is empirically harder than prior).
 * - When students pass an item predicted hard (S > E), calibratedBeta decreases.
 * - Discrimination alpha updates gently along gradient (theta - beta) * (S - E).
 */
export function calibrateIrtAfterAttempt(
  current: IrtItemRecord,
  studentTheta: number,
  isCorrect: boolean
): IrtItemRecord {
  const expected = irt2PLProbability(
    studentTheta,
    current.calibratedBeta,
    current.discriminationAlpha
  );
  const score = isCorrect ? 1 : 0;

  const kBeta = 0.34 / (1 + 0.05 * current.attempts);
  const nextBetaRaw = current.calibratedBeta + kBeta * (expected - score);
  const calibratedBeta =
    Math.round(Math.max(-3.0, Math.min(3.0, nextBetaRaw)) * 1000) / 1000;

  const kAlpha = 0.06 / (1 + 0.05 * current.attempts);
  const alphaGrad = (studentTheta - current.calibratedBeta) * (score - expected);
  const nextAlphaRaw = current.discriminationAlpha + kAlpha * alphaGrad;
  const discriminationAlpha =
    Math.round(Math.max(0.5, Math.min(2.5, nextAlphaRaw)) * 1000) / 1000;

  return {
    ...current,
    calibratedBeta,
    discriminationAlpha,
    attempts: current.attempts + 1,
    correct: current.correct + (isCorrect ? 1 : 0),
  };
}

export interface SimpleDirectedEdge {
  topicId: string; // dependent topic
  prerequisiteId: string; // upstream prerequisite
}

export interface AcyclicCheckResult {
  ok: boolean;
  reason?: string;
  reasonZh?: string;
  reasonEn?: string;
  cyclePath?: string[];
}

/**
 * Verifies that adding `candidate` (topicId depends on prerequisiteId)
 * preserves strict Directed Acyclic Graph (DAG) topological validity.
 */
export function validateCustomEdgeAcyclic(
  existingEdges: SimpleDirectedEdge[],
  candidate: SimpleDirectedEdge,
  locale: LocaleCode = "zh-CN"
): AcyclicCheckResult {
  if (candidate.topicId === candidate.prerequisiteId) {
    const copy = c(
      "禁止自环依赖：同一微技能节点不能将自身设为先修前提。",
      "Self-loop blocked: a micro-topic cannot depend on itself as a prerequisite.",
      "自己ループ禁止：同一ノードを自身の前提単元に設定することはできません。",
      "자기 루프 금지: 동일한 노드를 자기 자신의 선수 개념으로 설정할 수 없습니다.",
      "Gelung kendiri disekat: topik tidak boleh menjadi prasyarat kepada dirinya sendiri."
    );
    return {
      ok: false,
      reason: uiPick(locale, copy),
      reasonZh: copy.zh,
      reasonEn: copy.en,
      cyclePath: [candidate.topicId, candidate.prerequisiteId],
    };
  }

  const dup = existingEdges.some(
    (e) =>
      e.topicId === candidate.topicId &&
      e.prerequisiteId === candidate.prerequisiteId
  );
  if (dup) {
    const copy = c(
      "该先修依赖边已存在于标准图谱或校本图谱中，无需重复添加。",
      "This prerequisite edge already exists in the canonical or school graph.",
      "この前提エッジは既に標準グラフまたは校内グラフに存在します。",
      "이 선수 의존 간선은 이미 표준 그래프 또는 학교 그래프에 존재합니다.",
      "Sisi prasyarat ini sudah wujud dalam graf kanonik atau sekolah."
    );
    return {
      ok: false,
      reason: uiPick(locale, copy),
      reasonZh: copy.zh,
      reasonEn: copy.en,
    };
  }

  // A cycle occurs iff `candidate.topicId` is already an upstream prerequisite
  // (direct or transitive) of `candidate.prerequisiteId`!
  // Let's search upstream from `candidate.prerequisiteId` following `x -> x.prerequisiteId`.
  const prereqsOf = new Map<string, string[]>();
  for (const e of existingEdges) {
    const arr = prereqsOf.get(e.topicId) ?? [];
    arr.push(e.prerequisiteId);
    prereqsOf.set(e.topicId, arr);
  }

  const queue: Array<{ node: string; path: string[] }> = [
    {
      node: candidate.prerequisiteId,
      path: [candidate.topicId, candidate.prerequisiteId],
    },
  ];
  const visited = new Set<string>([candidate.prerequisiteId]);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const upstreams = prereqsOf.get(curr.node) ?? [];
    for (const up of upstreams) {
      if (up === candidate.topicId) {
        const cyclePath = [...curr.path, up];
        const pathStr = cyclePath.join(" → ");
        const copy = c(
          `检测到有向环路（Cycle Detected）：${pathStr}，已自动拦截以保护自适应诊断收敛性！`,
          `Directed cycle detected (${pathStr}) — automatically blocked to preserve DAG convergence!`,
          `有向閉路を検出（${pathStr}）— 診断収束性を保護するため自動ブロックしました！`,
          `방향 사이클 감지(${pathStr}) — 적응형 진단 수렴성을 보호하기 위해 자동 차단되었습니다!`,
          `Kitaran terarah dikesan (${pathStr}) — disekat secara automatik untuk melindungi penumpuan DAG!`
        );
        return {
          ok: false,
          reason: uiPick(locale, copy),
          reasonZh: copy.zh,
          reasonEn: copy.en,
          cyclePath,
        };
      }
      if (!visited.has(up)) {
        visited.add(up);
        queue.push({ node: up, path: [...curr.path, up] });
      }
    }
  }

  return { ok: true };
}
