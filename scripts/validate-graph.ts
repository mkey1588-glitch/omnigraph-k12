import { REGIONS_DATA, SUBJECTS_DATA } from "../src/data/regions-and-subjects";
import {
  ALL_CANONICAL_TOPICS,
  ALL_QUESTION_TEMPLATES,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
} from "../src/data/canonical-graph";

function validateGraph(): void {
  const errors: string[] = [];

  // 1. Check unique topic IDs & valid subjects
  const subjectIds = new Set(SUBJECTS_DATA.map((s) => s.id));
  const topicById = new Map<string, (typeof ALL_CANONICAL_TOPICS)[number]>();

  for (const topic of ALL_CANONICAL_TOPICS) {
    if (topicById.has(topic.id)) {
      errors.push(`Duplicate topic ID: ${topic.id}`);
    }
    if (!subjectIds.has(topic.subjectId)) {
      errors.push(`Topic ${topic.id} references unknown subject ${topic.subjectId}`);
    }
    if (!topic.title["zh-CN"] || !topic.title.en) {
      errors.push(`Topic ${topic.id} missing bilingual zh-CN/en title`);
    }
    const cf = topic.microLesson.coreFormula ?? "";
    if (cf && !cf.includes("$") && /\\[a-zA-Z]+|\^\{|_\{/.test(cf)) {
      errors.push(`Topic ${topic.id} has raw LaTeX in coreFormula without $...$ delimiters: ${cf}`);
    }
    const step0 = topic.microLesson.steps[0];
    if (!step0?.checkQuestion?.["zh-CN"] || !step0?.checkQuestion?.en || !step0?.checkAnswer) {
      errors.push(`Topic ${topic.id} missing interactive microLesson steps[0].checkQuestion or checkAnswer`);
    }
    topicById.set(topic.id, topic);
  }

  // 2. Check edges: endpoints exist, no self-loops, no duplicate pairs, relationType matches subject boundary
  const edgeKeys = new Set<string>();
  const withinSubjectPrereqCount = new Map<string, number>();
  for (const topic of ALL_CANONICAL_TOPICS) {
    withinSubjectPrereqCount.set(topic.id, 0);
  }

  for (const edge of CANONICAL_EDGES) {
    const key = `${edge.topicId}->${edge.prerequisiteId}`;
    if (edgeKeys.has(key)) {
      errors.push(`Duplicate edge: ${key}`);
    }
    edgeKeys.add(key);

    if (edge.topicId === edge.prerequisiteId) {
      errors.push(`Self-loop detected on ${edge.topicId}`);
    }

    const down = topicById.get(edge.topicId);
    const up = topicById.get(edge.prerequisiteId);
    if (!down) {
      errors.push(`Edge references missing topicId: ${edge.topicId}`);
      continue;
    }
    if (!up) {
      errors.push(`Edge references missing prerequisiteId: ${edge.prerequisiteId}`);
      continue;
    }

    const isCross = down.subjectId !== up.subjectId;
    if (isCross && edge.relationType !== "cross_subject") {
      errors.push(
        `Cross-subject edge ${key} (${down.subjectId} -> ${up.subjectId}) must use relationType='cross_subject'`
      );
    }
    if (!isCross && edge.relationType === "cross_subject") {
      errors.push(
        `Within-subject edge ${key} (${down.subjectId}) should use 'hard' or 'soft', not 'cross_subject'`
      );
    }
    if (!isCross) {
      withinSubjectPrereqCount.set(
        down.id,
        (withinSubjectPrereqCount.get(down.id) ?? 0) + 1
      );
    }
  }

  // 3. DFS 3-color cycle detection across the entire global + cross-subject graph
  // Edge direction for learning order: prerequisiteId -> topicId
  const adj = new Map<string, string[]>();
  for (const topic of ALL_CANONICAL_TOPICS) {
    adj.set(topic.id, []);
  }
  for (const edge of CANONICAL_EDGES) {
    adj.get(edge.prerequisiteId)?.push(edge.topicId);
  }

  const color = new Map<string, 0 | 1 | 2>(); // 0=unvisited, 1=visiting, 2=visited
  const stack: string[] = [];

  function dfs(u: string): void {
    color.set(u, 1);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      const c = color.get(v) ?? 0;
      if (c === 1) {
        const cycleStart = stack.indexOf(v);
        const cyclePath = [...stack.slice(cycleStart), v].join(" -> ");
        errors.push(`Cycle detected in DAG: ${cyclePath}`);
      } else if (c === 0) {
        dfs(v);
      }
    }
    stack.pop();
    color.set(u, 2);
  }

  for (const topic of ALL_CANONICAL_TOPICS) {
    if ((color.get(topic.id) ?? 0) === 0) {
      dfs(topic.id);
    }
  }

  // 4. Root-node justification check (inspired by os-taxonomy / cn-math-taxonomy build checks)
  for (const topic of ALL_CANONICAL_TOPICS) {
    const prereqCount = withinSubjectPrereqCount.get(topic.id) ?? 0;
    if (prereqCount === 0 && (!topic.rootReason || topic.rootReason.trim().length === 0)) {
      errors.push(
        `Orphan/Root topic ${topic.id} (${topic.subjectId}) has 0 within-subject prerequisites and no rootReason`
      );
    }
  }

  // 5. Full 9-Region alignment check
  const alignmentSet = new Set<string>();
  for (const aln of ALL_REGIONAL_ALIGNMENTS) {
    const k = `${aln.topicId}::${aln.regionCode}`;
    if (alignmentSet.has(k)) {
      errors.push(`Duplicate regional alignment: ${k}`);
    }
    alignmentSet.add(k);
    if (!aln.standardCode || aln.standardCode.trim().length < 3) {
      errors.push(`Empty/invalid standardCode for ${k}`);
    }
  }

  for (const topic of ALL_CANONICAL_TOPICS) {
    for (const region of REGIONS_DATA) {
      const k = `${topic.id}::${region.code}`;
      if (!alignmentSet.has(k)) {
        errors.push(`Missing regional alignment for ${k}`);
      }
    }
  }

  // 6. Question template coverage check
  for (const topic of ALL_CANONICAL_TOPICS) {
    for (const tier of ["basic", "standard", "challenge"] as const) {
      const found = ALL_QUESTION_TEMPLATES.some(
        (t) => t.topicId === topic.id && t.difficulty === tier
      );
      if (!found) {
        errors.push(`Missing '${tier}' question template for topic ${topic.id}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("❌ Knowledge Graph Validation Failed:");
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  const crossCount = CANONICAL_EDGES.filter((e) => e.relationType === "cross_subject").length;
  console.log("✅ OmniGraph K12 Canonical Graph Validation Passed!");
  console.log(`   • Regions configured      : ${REGIONS_DATA.length} (${REGIONS_DATA.map((r) => r.code).join(", ")})`);
  console.log(`   • Subjects configured     : ${SUBJECTS_DATA.length} (${SUBJECTS_DATA.map((s) => s.id).join(", ")})`);
  console.log(`   • Canonical micro-topics  : ${ALL_CANONICAL_TOPICS.length}`);
  console.log(`   • Prerequisite DAG edges  : ${CANONICAL_EDGES.length} (${crossCount} cross-subject math bridges)`);
  console.log(`   • Regional alignments     : ${ALL_REGIONAL_ALIGNMENTS.length} (100% 9-region coverage)`);
  console.log(`   • Question templates      : ${ALL_QUESTION_TEMPLATES.length} (3 tiers × ${ALL_CANONICAL_TOPICS.length} topics)`);
}

validateGraph();
