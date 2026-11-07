import type {
  DiagnosticAnswerEntry,
  DiagnosticSessionState,
  DifficultyTier,
  GeneratedQuestionInstance,
  MasteryStatus,
  RegionCode,
  SubjectId,
  TriLocaleText,
} from "@/types/taxonomy";
import {
  ALL_CANONICAL_TOPICS,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
  type EdgeSeedDefinition,
} from "@/data/canonical-graph";
import type { TopicSeedDefinition } from "@/data/canonical-topics-math";
import { generateQuestion } from "./item-generator";
import { gradeQuestionResponse } from "./grader";

const TOPIC_MAP = new Map<string, TopicSeedDefinition>(
  ALL_CANONICAL_TOPICS.map((t) => [t.id, t])
);

export function getTopicById(topicId: string): TopicSeedDefinition | undefined {
  return TOPIC_MAP.get(topicId);
}

/**
 * Direct prerequisites of `topicId` (edges where edge.topicId === topicId)
 */
export function getDirectPrerequisites(
  topicId: string,
  includeCrossSubject = true
): EdgeSeedDefinition[] {
  return CANONICAL_EDGES.filter(
    (e) =>
      e.topicId === topicId &&
      (includeCrossSubject || e.relationType !== "cross_subject")
  );
}

/**
 * Direct dependents of `topicId` (edges where edge.prerequisiteId === topicId)
 */
export function getDirectDependents(
  topicId: string,
  includeCrossSubject = true
): EdgeSeedDefinition[] {
  return CANONICAL_EDGES.filter(
    (e) =>
      e.prerequisiteId === topicId &&
      (includeCrossSubject || e.relationType !== "cross_subject")
  );
}

/**
 * Transitive ancestors (upstream prerequisites) of one or more target topics
 */
export function getAncestors(
  targetIds: string[],
  includeCrossSubject = true
): string[] {
  const visited = new Set<string>();
  const queue = [...targetIds];
  const seedSet = new Set(targetIds);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const edge of getDirectPrerequisites(curr, includeCrossSubject)) {
      if (!visited.has(edge.prerequisiteId) && !seedSet.has(edge.prerequisiteId)) {
        visited.add(edge.prerequisiteId);
        queue.push(edge.prerequisiteId);
      }
    }
  }
  return [...visited];
}

/**
 * Transitive descendants (downstream unlocked topics) of one or more topics
 */
export function getDescendants(
  sourceIds: string[],
  includeCrossSubject = true
): string[] {
  const visited = new Set<string>();
  const queue = [...sourceIds];
  const seedSet = new Set(sourceIds);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const edge of getDirectDependents(curr, includeCrossSubject)) {
      if (!visited.has(edge.topicId) && !seedSet.has(edge.topicId)) {
        visited.add(edge.topicId);
        queue.push(edge.topicId);
      }
    }
  }
  return [...visited];
}

/**
 * Topological sort (Kahn's algorithm) ordered from foundational upstream prerequisites -> advanced downstream targets,
 * tie-breaking by regional grade, baselineGrade, and topicId.
 */
export function topologicalSort(
  topicIds: string[],
  regionCode: RegionCode = "CN"
): string[] {
  const scope = new Set(topicIds);
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of scope) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of CANONICAL_EDGES) {
    if (scope.has(edge.topicId) && scope.has(edge.prerequisiteId)) {
      adj.get(edge.prerequisiteId)!.push(edge.topicId);
      inDegree.set(edge.topicId, (inDegree.get(edge.topicId) ?? 0) + 1);
    }
  }

  const gradeLookup = (id: string): number => {
    const aln = ALL_REGIONAL_ALIGNMENTS.find(
      (a) => a.topicId === id && a.regionCode === regionCode
    );
    return aln?.localGrade ?? TOPIC_MAP.get(id)?.baselineGrade ?? 6;
  };

  const sortReady = (arr: string[]) =>
    arr.sort((a, b) => {
      const ga = gradeLookup(a);
      const gb = gradeLookup(b);
      if (ga !== gb) return ga - gb;
      return a.localeCompare(b);
    });

  let ready = sortReady(
    [...scope].filter((id) => (inDegree.get(id) ?? 0) === 0)
  );
  const result: string[] = [];

  while (ready.length > 0) {
    const u = ready.shift()!;
    result.push(u);
    for (const v of adj.get(u) ?? []) {
      const nextDeg = (inDegree.get(v) ?? 1) - 1;
      inDegree.set(v, nextDeg);
      if (nextDeg === 0) {
        ready.push(v);
        ready = sortReady(ready);
      }
    }
  }

  // Fallback append if any residual
  for (const id of scope) {
    if (!result.includes(id)) result.push(id);
  }
  return result;
}

/**
 * Bayesian Knowledge Tracing (BKT) posterior mastery probability update
 */
export function updateBktMastery(
  priorMastery: number,
  isCorrect: boolean,
  difficulty: DifficultyTier = "standard"
): number {
  const pSlip = difficulty === "challenge" ? 0.16 : difficulty === "basic" ? 0.06 : 0.1;
  const pGuess = difficulty === "basic" ? 0.22 : difficulty === "challenge" ? 0.08 : 0.15;
  const pTransit = 0.18;

  const pL = Math.max(0.03, Math.min(0.98, priorMastery));
  let posterior: number;
  if (isCorrect) {
    const num = pL * (1 - pSlip);
    const den = num + (1 - pL) * pGuess;
    posterior = den > 0 ? num / den : pL;
  } else {
    const num = pL * pSlip;
    const den = num + (1 - pL) * (1 - pGuess);
    posterior = den > 0 ? num / den : pL;
  }

  const nextMastery = posterior + (1 - posterior) * pTransit;
  return Math.round(Math.max(0.04, Math.min(0.99, nextMastery)) * 100) / 100;
}

export interface CreateSessionOptions {
  sessionId?: string;
  studentId: string;
  subjectId: SubjectId;
  regionCode: RegionCode;
  mode: "target" | "chapter" | "grade_screen";
  targetTopicIds: string[];
  confirmRequired?: number;
  maxQuestions?: number;
  seed?: string;
  initialKnownMastery?: Record<string, MasteryStatus>;
}

/**
 * Create a new Adaptive Prerequisite Backtracking Diagnostic Session
 */
export function createDiagnosticSession(
  opts: CreateSessionOptions
): DiagnosticSessionState {
  const confirmRequired = opts.confirmRequired ?? 2;
  const maxQuestions = opts.maxQuestions ?? 14;
  const seed = opts.seed ?? `diag_${Date.now().toString(36)}`;
  const sessionId = opts.sessionId ?? `ses_${Date.now().toString(36)}`;

  const validTargets = opts.targetTopicIds.filter((id) => TOPIC_MAP.has(id));
  const fallbackTargets =
    validTargets.length > 0
      ? validTargets
      : ["mt_math_quad_complete_sq"];

  const ancestors = getAncestors(fallbackTargets, true);
  const scopeTopicIds = topologicalSort(
    [...new Set([...fallbackTargets, ...ancestors])],
    opts.regionCode
  );

  const statusByTopic: Record<string, MasteryStatus> = {};
  for (const id of scopeTopicIds) {
    statusByTopic[id] = opts.initialKnownMastery?.[id] ?? "untested";
  }

  // Order initial stack so highest/target nodes are tested first (enabling ancestor closure pruning!)
  const orderedTargets = topologicalSort(fallbackTargets, opts.regionCode);
  // Top of stack is last element -> orderedTargets[orderedTargets.length - 1] tested first
  const stack = orderedTargets.filter((id) => statusByTopic[id] === "untested");

  return {
    sessionId,
    studentId: opts.studentId,
    subjectId: opts.subjectId,
    regionCode: opts.regionCode,
    mode: opts.mode,
    targets: fallbackTargets,
    scopeTopicIds,
    confirmRequired,
    maxQuestions,
    seed,
    stack,
    statusByTopic,
    attemptsByTopic: {},
    backtrackOriginByTopic: {},
    history: [],
    finished: stack.length === 0,
  };
}

export interface NextDiagnosticPrompt {
  topicId: string;
  difficulty: DifficultyTier;
  whyAskedZh: string;
  whyAskedEn: string;
  whyAskedI18n?: TriLocaleText;
  instance: GeneratedQuestionInstance;
}

/**
 * Select and parameterize the next adaptive question for an active session
 */
export function getNextDiagnosticQuestion(
  session: DiagnosticSessionState
): NextDiagnosticPrompt | null {
  if (session.finished || session.history.length >= session.maxQuestions) {
    session.finished = true;
    return null;
  }

  // Pop already-resolved nodes off the top of the stack
  while (session.stack.length > 0) {
    const top = session.stack[session.stack.length - 1];
    if (session.statusByTopic[top] && session.statusByTopic[top] !== "untested") {
      session.stack.pop();
    } else {
      break;
    }
  }

  // If stack empty, check if any original target remains untested
  if (session.stack.length === 0) {
    const remainingTarget = session.targets.find(
      (id) => session.statusByTopic[id] === "untested"
    );
    if (remainingTarget) {
      session.stack.push(remainingTarget);
    } else {
      session.finished = true;
      return null;
    }
  }

  const topicId = session.stack[session.stack.length - 1];
  const topic = TOPIC_MAP.get(topicId)!;
  const attempts = session.attemptsByTopic[topicId] ?? [];
  const originId = session.backtrackOriginByTopic[topicId];
  const originTopic = originId ? TOPIC_MAP.get(originId) : undefined;

  let difficulty: DifficultyTier = "standard";
  let whyAskedZh = "";
  let whyAskedEn = "";
  let whyAskedI18n: TriLocaleText = {};
  const tj = (tp: TopicSeedDefinition) => tp.title.ja ?? tp.title.en;
  const tk = (tp: TopicSeedDefinition) => tp.title.ko ?? tp.title.en;
  const tm = (tp: TopicSeedDefinition) => tp.title.ms ?? tp.title.en;

  if (attempts.length === 0) {
    difficulty = "standard";
    if (originTopic) {
      const isCross = originTopic.subjectId !== topic.subjectId;
      whyAskedZh = isCross
        ? `【跨科根因回溯】因下游「${originTopic.title["zh-CN"]}」连续受阻，自动跨学科回溯检测前置数学工具「${topic.title["zh-CN"]}」`
        : `【先修回溯排查】因下游「${originTopic.title["zh-CN"]}」受阻，沿 DAG 先修边向上游排查「${topic.title["zh-CN"]}」`;
      whyAskedEn = isCross
        ? `[Cross-Subject Backtrack] Triggered by difficulty in "${originTopic.title.en}" → checking prerequisite math tool "${topic.title.en}"`
        : `[Prerequisite Backtrack] Triggered by "${originTopic.title.en}" → checking upstream foundation "${topic.title.en}"`;
      whyAskedI18n = isCross
        ? {
            ja: `【教科横断の根本原因さかのぼり】「${tj(originTopic)}」でつまずいたため、前提となる数学ツール「${tj(topic)}」を確認します`,
            ko: `[교과 간 근본 원인 역추적] '${tk(originTopic)}'에서 막혀 선수 수학 도구 '${tk(topic)}' 단원을 점검합니다`,
            ms: `[Jejak Balik Rentas Subjek] Dicetuskan oleh kesukaran dalam "${tm(originTopic)}" → menyemak alat matematik prasyarat "${tm(topic)}"`,
          }
        : {
            ja: `【前提単元さかのぼり】「${tj(originTopic)}」でつまずいたため、上流の基礎「${tj(topic)}」を確認します`,
            ko: `[선수 개념 역추적] '${tk(originTopic)}'에서 막혀 상위 기초 '${tk(topic)}' 단원을 점검합니다`,
            ms: `[Jejak Balik Prasyarat] Dicetuskan oleh "${tm(originTopic)}" → menyemak asas huluan "${tm(topic)}"`,
          };
    } else {
      whyAskedZh = `【靶向首测】正在检测目标微技能「${topic.title["zh-CN"]}」的标准掌握度`;
      whyAskedEn = `[Target Check] Assessing standard mastery on "${topic.title.en}"`;
      whyAskedI18n = {
        ja: `【ターゲット初回チェック】目標スキル「${tj(topic)}」の標準的な習熟度を確認しています`,
        ko: `[타깃 첫 점검] 목표 마이크로 스킬 '${tk(topic)}'의 표준 숙달도를 확인합니다`,
        ms: `[Semakan Sasaran] Menilai penguasaan standard bagi "${tm(topic)}"`,
      };
    }
  } else if (attempts.length === 1 && attempts[0].isCorrect) {
    difficulty = "challenge";
    whyAskedZh = `【进阶确认】首题答对！再答对本道变式题即可确认掌握「${topic.title["zh-CN"]}」，并自动剪枝豁免全部上游先修节点`;
    whyAskedEn = `[Mastery Confirmation] First item correct! Answering this variant confirms mastery and prunes all upstream prerequisites`;
    whyAskedI18n = {
      ja: `【習熟の確認】1問目正解！この類題にも正解すると「${tj(topic)}」の習熟が確定し、上流の前提単元はすべて自動的に免除されます`,
      ko: `[숙달 확인] 첫 문항 정답! 이 변형 문항도 맞히면 '${tk(topic)}' 숙달이 확정되고 상위 선수 개념은 모두 자동 면제됩니다`,
      ms: `[Pengesahan Penguasaan] Soalan pertama betul! Jawab variasi ini dengan betul untuk mengesahkan penguasaan dan melangkau semua prasyarat huluan`,
    };
  } else if (attempts.length === 1 && !attempts[0].isCorrect) {
    difficulty = "basic";
    whyAskedZh = `【降维复测】首题受阻，自动降维至基础辨析题：区分「偶然粗心滑档（Shaky）」与「概念根基薄弱（Weak）」`;
    whyAskedEn = `[Diagnostic Confirmation] Dropping to a foundational check to distinguish a careless slip (Shaky) from a true gap (Weak)`;
    whyAskedI18n = {
      ja: `【基礎レベルで再確認】1問目でつまずいたため基礎問題に切り替え、「うっかりミス（Shaky）」か「概念の理解不足（Weak）」かを見分けます`,
      ko: `[기초 수준 재확인] 첫 문항에서 막혀 기초 문항으로 전환하여 '단순 실수(Shaky)'와 '개념 결손(Weak)'을 구별합니다`,
      ms: `[Pengesahan Diagnostik] Beralih ke semakan asas untuk membezakan kesilapan cuai (Shaky) daripada jurang sebenar (Weak)`,
    };
  } else {
    difficulty = "standard";
    whyAskedZh = `【决胜复核】一正一误，通过第 3 题锁定「${topic.title["zh-CN"]}」最终状态`;
    whyAskedEn = `[Tie-Breaker] Resolving mastery status for "${topic.title.en}"`;
    whyAskedI18n = {
      ja: `【決定問題】正解1・不正解1のため、3問目で「${tj(topic)}」の最終的な状態を確定します`,
      ko: `[결정 문항] 정답 1·오답 1이므로 3번째 문항으로 '${tk(topic)}'의 최종 상태를 확정합니다`,
      ms: `[Penentu] Menentukan status penguasaan akhir bagi "${tm(topic)}"`,
    };
  }

  const instance = generateQuestion({
    topicId,
    difficulty,
    seed: session.seed,
    regionCode: session.regionCode,
    variantIndex: session.history.length + attempts.length * 7,
  });

  return {
    topicId,
    difficulty,
    whyAskedZh,
    whyAskedEn,
    whyAskedI18n,
    instance,
  };
}

export interface DiagnosticStepOutcome {
  isCorrect: boolean;
  normalizedAnswer: string;
  detectedMisconception?: string;
  updatedTopicStatus: MasteryStatus;
  prunedAncestors: string[];
  pushedPrerequisites: string[];
  sessionFinished: boolean;
}

/**
 * Grade answer, transition node mastery state, prune mastered ancestors or push prerequisites for DFS backtracking!
 */
export function applyDiagnosticAnswer(
  session: DiagnosticSessionState,
  instance: GeneratedQuestionInstance,
  rawUserAnswer: string,
  whyAskedZh = "",
  whyAskedEn = ""
): DiagnosticStepOutcome {
  const grade = gradeQuestionResponse(instance, rawUserAnswer);
  const topicId = instance.topicId;

  if (!session.attemptsByTopic[topicId]) {
    session.attemptsByTopic[topicId] = [];
  }
  session.attemptsByTopic[topicId].push({
    instanceId: instance.instanceId,
    difficulty: instance.difficulty,
    isCorrect: grade.isCorrect,
    misconception: grade.detectedMisconception,
  });

  const entry: DiagnosticAnswerEntry = {
    order: session.history.length + 1,
    topicId,
    instance,
    userAnswer: rawUserAnswer,
    isCorrect: grade.isCorrect,
    detectedMisconception: grade.detectedMisconception,
    whyAskedZh,
    whyAskedEn,
    timestamp: new Date().toISOString(),
  };
  session.history.push(entry);

  const attempts = session.attemptsByTopic[topicId];
  const prunedAncestors: string[] = [];
  const pushedPrerequisites: string[] = [];

  // Check consecutive correct tail
  let consecutiveCorrect = 0;
  for (let i = attempts.length - 1; i >= 0; i--) {
    if (attempts[i].isCorrect) consecutiveCorrect++;
    else break;
  }

  if (consecutiveCorrect >= session.confirmRequired) {
    // 1. Confirmed MASTERED -> Ancestor Mastery Closure Pruning!
    session.statusByTopic[topicId] = "mastered";
    const ancestors = getAncestors([topicId], true);
    for (const ancId of ancestors) {
      if (
        session.statusByTopic[ancId] === "untested" ||
        session.statusByTopic[ancId] === undefined
      ) {
        session.statusByTopic[ancId] = "inferred_mastered";
        prunedAncestors.push(ancId);
      }
    }
  } else if (attempts.length === 2 && !attempts[0].isCorrect && attempts[1].isCorrect) {
    // 2. Missed standard, passed basic confirmation -> SHAKY (careless slip / procedural instability; no deep backtracking needed)
    session.statusByTopic[topicId] = "shaky";
  } else if (attempts.length === 2 && !attempts[0].isCorrect && !attempts[1].isCorrect) {
    // 3. Missed standard AND missed basic confirmation -> WEAK! Trigger DFS Prerequisite Backtracking!
    session.statusByTopic[topicId] = "weak";
    const prereqEdges = getDirectPrerequisites(topicId, true);

    // Priority order to test FIRST: 'hard' -> 'cross_subject' -> 'soft'
    // Since stack is LIFO, push in reverse priority ('soft', then 'cross_subject', then 'hard')!
    const priorityRank = (rel: string) =>
      rel === "hard" ? 3 : rel === "cross_subject" ? 2 : 1;

    const sortedForLifoPush = [...prereqEdges].sort(
      (a, b) => priorityRank(a.relationType) - priorityRank(b.relationType)
    );

    for (const edge of sortedForLifoPush) {
      const pId = edge.prerequisiteId;
      if (
        (session.statusByTopic[pId] ?? "untested") === "untested" &&
        !session.stack.includes(pId)
      ) {
        session.stack.push(pId);
        session.backtrackOriginByTopic[pId] = topicId;
        pushedPrerequisites.push(pId);
      }
    }
  } else if (attempts.length >= 3) {
    // 4. Tie-breaker after 3 attempts (e.g. [true, false, true] or [true, false, false])
    const correctTotal = attempts.filter((a) => a.isCorrect).length;
    if (correctTotal >= 2 && grade.isCorrect) {
      session.statusByTopic[topicId] = "mastered";
      for (const ancId of getAncestors([topicId], true)) {
        if ((session.statusByTopic[ancId] ?? "untested") === "untested") {
          session.statusByTopic[ancId] = "inferred_mastered";
          prunedAncestors.push(ancId);
        }
      }
    } else {
      session.statusByTopic[topicId] = "shaky";
    }
  }

  // Peek whether session is now complete
  while (session.stack.length > 0) {
    const top = session.stack[session.stack.length - 1];
    if (session.statusByTopic[top] && session.statusByTopic[top] !== "untested") {
      session.stack.pop();
    } else {
      break;
    }
  }

  if (
    session.stack.length === 0 ||
    session.history.length >= session.maxQuestions
  ) {
    const stillUntestedTarget = session.targets.find(
      (id) => session.statusByTopic[id] === "untested"
    );
    if (stillUntestedTarget && session.history.length < session.maxQuestions) {
      session.stack.push(stillUntestedTarget);
    } else {
      session.finished = true;
    }
  }

  return {
    isCorrect: grade.isCorrect,
    normalizedAnswer: grade.normalizedAnswer,
    detectedMisconception: grade.detectedMisconception,
    updatedTopicStatus: session.statusByTopic[topicId] ?? "untested",
    prunedAncestors,
    pushedPrerequisites,
    sessionFinished: session.finished,
  };
}

export interface DiagnosticSummaryReport {
  masteredIds: string[];
  inferredMasteredIds: string[];
  shakyIds: string[];
  weakIds: string[];
  weakRootIds: string[]; // Deepest upstream weak nodes (True Root Causes!)
  remedialPathIds: string[]; // Topological Bottom-Up Remediation Sequence
  accuracyPercent: number;
}

/**
 * Pinpoint root-cause weaknesses (`weakRootIds`) and construct an ordered bottom-up remedial path
 */
export function summarizeDiagnosis(
  session: DiagnosticSessionState
): DiagnosticSummaryReport {
  const masteredIds: string[] = [];
  const inferredMasteredIds: string[] = [];
  const shakyIds: string[] = [];
  const weakIds: string[] = [];

  for (const [id, status] of Object.entries(session.statusByTopic)) {
    if (status === "mastered") masteredIds.push(id);
    else if (status === "inferred_mastered") inferredMasteredIds.push(id);
    else if (status === "shaky") shakyIds.push(id);
    else if (status === "weak") weakIds.push(id);
  }

  const weakSet = new Set(weakIds);

  // A weak topic is a ROOT CAUSE if none of its upstream prerequisites are also weak!
  const weakRootIds = weakIds.filter((id) => {
    const anc = getAncestors([id], true);
    return !anc.some((a) => weakSet.has(a));
  });

  const remedialPathIds = topologicalSort(
    [...weakIds, ...shakyIds],
    session.regionCode
  );

  const correctCount = session.history.filter((h) => h.isCorrect).length;
  const accuracyPercent =
    session.history.length > 0
      ? Math.round((correctCount / session.history.length) * 100)
      : 0;

  return {
    masteredIds,
    inferredMasteredIds,
    shakyIds,
    weakIds,
    weakRootIds,
    remedialPathIds,
    accuracyPercent,
  };
}
