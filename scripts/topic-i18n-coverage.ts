/**
 * Knowledge-graph teaching content ja / ko / ms coverage checker.
 *
 * Usage:
 *   pnpm exec tsx scripts/topic-i18n-coverage.ts                       # all groups, summary
 *   pnpm exec tsx scripts/topic-i18n-coverage.ts --group math          # math | stem | science-cs | humanities-lang | edges
 *
 * Exit code is 1 when any gap or leak is found in the selected scope.
 */
import type { LocalizedText } from "../src/types/taxonomy";
import { ALL_CANONICAL_TOPICS, CANONICAL_EDGES } from "../src/data/canonical-graph";
import { MATH_TOPICS } from "../src/data/canonical-topics-math";
import { STEM_AND_ALL_SUBJECT_TOPICS } from "../src/data/canonical-topics-stem";
import { SCIENCE_AND_CS_EXPANSION_TOPICS } from "../src/data/canonical-topics-science-cs";
import { HUMANITIES_AND_LANG_EXPANSION_TOPICS } from "../src/data/canonical-topics-humanities-lang";
import { isWordy, leakFor } from "./item-i18n-coverage";

const TRI = ["ja", "ko", "ms"] as const;
const JA_SCRIPT_RE = /[\u3040-\u30FF\u4E00-\u9FFF]/;
const HANGUL_RE = /[\uAC00-\uD7AF]/;

export type TopicGroup = "math" | "stem" | "science-cs" | "humanities-lang" | "edges";

const GROUP_IDS: Record<Exclude<TopicGroup, "edges">, Set<string>> = {
  math: new Set(MATH_TOPICS.map((t) => t.id)),
  stem: new Set(STEM_AND_ALL_SUBJECT_TOPICS.map((t) => t.id)),
  "science-cs": new Set(SCIENCE_AND_CS_EXPANSION_TOPICS.map((t) => t.id)),
  "humanities-lang": new Set(HUMANITIES_AND_LANG_EXPANSION_TOPICS.map((t) => t.id)),
};

export interface TopicGap {
  group: TopicGroup;
  id: string;
  field: string;
  locale: string;
  problem: string;
  sample: string;
}

function checkText(
  gaps: TopicGap[],
  group: TopicGroup,
  id: string,
  field: string,
  lt: LocalizedText | undefined
): void {
  if (!lt) return;
  for (const loc of TRI) {
    const v = lt[loc];
    const push = (problem: string, sample: string) =>
      gaps.push({ group, id, field, locale: loc, problem, sample: sample.slice(0, 110) });
    if (!v) {
      push("missing", lt.en);
      continue;
    }
    const leak = leakFor(loc, v);
    if (leak) push(`LEAK: ${leak}`, v);
    if (loc === "ja" && !JA_SCRIPT_RE.test(v)) push("ja text has no Japanese script", v);
    if (loc === "ko" && !HANGUL_RE.test(v)) push("ko text has no Hangul", v);
    if (loc === "ms" && isWordy(lt.en) && v.trim() === lt.en.trim()) push("ms text identical to English", v);
  }
}

export function collectTopicI18nGaps(groups?: TopicGroup[]): { gaps: TopicGap[]; checked: number } {
  const gaps: TopicGap[] = [];
  let checked = 0;
  const want = (g: TopicGroup) => !groups || groups.includes(g);

  for (const tp of ALL_CANONICAL_TOPICS) {
    const group = (Object.keys(GROUP_IDS) as Array<Exclude<TopicGroup, "edges">>).find((g) =>
      GROUP_IDS[g].has(tp.id)
    );
    if (!group || !want(group)) continue;
    checked++;
    const ck = (field: string, lt: LocalizedText | undefined) => checkText(gaps, group, tp.id, field, lt);
    ck("title", tp.title);
    ck("domainI18n", tp.domainI18n);
    ck("description", tp.description);
    ck("homeCheckPrompt", tp.homeCheckPrompt);
    tp.masteryCriteria.forEach((m, i) => ck(`masteryCriteria[${i}]`, m));
    ck("intuition", tp.microLesson.intuition);
    tp.microLesson.steps.forEach((st, i) => {
      ck(`steps[${i}].title`, st.title);
      ck(`steps[${i}].body`, st.body);
      ck(`steps[${i}].checkQuestion`, st.checkQuestion);
    });
    for (const mc of tp.microLesson.misconceptions) {
      ck(`misconceptions.${mc.tag}.label`, mc.label);
      ck(`misconceptions.${mc.tag}.wrongPattern`, mc.wrongPattern);
      ck(`misconceptions.${mc.tag}.remediationTip`, mc.remediationTip);
    }
  }

  if (want("edges")) {
    for (const e of CANONICAL_EDGES) {
      checked++;
      checkText(gaps, "edges", `${e.prerequisiteId}->${e.topicId}`, "reason", e.reason);
    }
  }
  return { gaps, checked };
}

if (process.argv[1] && process.argv[1].endsWith("topic-i18n-coverage.ts")) {
  const gIdx = process.argv.indexOf("--group");
  const groups = gIdx >= 0 ? (process.argv[gIdx + 1].split(",") as TopicGroup[]) : undefined;
  const { gaps, checked } = collectTopicI18nGaps(groups);
  const byId = new Map<string, TopicGap[]>();
  for (const g of gaps) byId.set(g.id, [...(byId.get(g.id) ?? []), g]);
  for (const [id, list] of byId) {
    console.log(`✗ ${id}: ${list.length} gap(s)`);
    if (groups) for (const g of list) console.log(`    ${g.field} (${g.locale}) ${g.problem} :: ${g.sample}`);
  }
  console.log(`\nTopic i18n coverage: ${checked - byId.size}/${checked} entries fully covered · ${gaps.length} gap(s)`);
  process.exit(gaps.length === 0 ? 0 : 1);
}
