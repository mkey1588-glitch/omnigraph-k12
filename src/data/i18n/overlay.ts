import type { LocalizedText, TriLocaleText } from "@/types/taxonomy";
import type { TopicSeedDefinition } from "../canonical-topics-math";

/**
 * Native ja / ko / ms overlay for one canonical topic's teaching content.
 * Arrays must match the source order/length (masteryCriteria, steps).
 * Misconceptions are keyed by their `tag`.
 */
export interface TopicContentI18n {
  description: TriLocaleText;
  homeCheckPrompt: TriLocaleText;
  masteryCriteria: TriLocaleText[];
  intuition: TriLocaleText;
  steps: Array<{ title: TriLocaleText; body: TriLocaleText; checkQuestion?: TriLocaleText }>;
  misconceptions: Record<string, { label: TriLocaleText; wrongPattern: TriLocaleText; remediationTip: TriLocaleText }>;
}

export type TopicContentOverlay = Record<string, TopicContentI18n>;

/** Key format for edge overlays: `${prerequisiteId}->${topicId}` */
export type EdgeReasonOverlay = Record<string, TriLocaleText>;

/** Fill missing ja / ko / ms keys of a LocalizedText from an overlay (inline values win). */
export function mergeTri(base: LocalizedText, tri: TriLocaleText | undefined): LocalizedText {
  if (!tri) return base;
  return {
    ...base,
    ja: base.ja ?? tri.ja,
    ko: base.ko ?? tri.ko,
    ms: base.ms ?? tri.ms,
  };
}

export function applyTopicContentOverlay(
  topics: TopicSeedDefinition[],
  overlay: TopicContentOverlay
): TopicSeedDefinition[] {
  return topics.map((tp) => {
    const o = overlay[tp.id];
    if (!o) return tp;
    return {
      ...tp,
      description: mergeTri(tp.description, o.description),
      homeCheckPrompt: mergeTri(tp.homeCheckPrompt, o.homeCheckPrompt),
      masteryCriteria: tp.masteryCriteria.map((m, i) => mergeTri(m, o.masteryCriteria[i])),
      microLesson: {
        ...tp.microLesson,
        intuition: mergeTri(tp.microLesson.intuition, o.intuition),
        steps: tp.microLesson.steps.map((st, i) => ({
          ...st,
          title: mergeTri(st.title, o.steps[i]?.title),
          body: mergeTri(st.body, o.steps[i]?.body),
          checkQuestion: st.checkQuestion
            ? mergeTri(st.checkQuestion, o.steps[i]?.checkQuestion)
            : undefined,
        })),
        misconceptions: tp.microLesson.misconceptions.map((mc) => {
          const mo = o.misconceptions[mc.tag];
          return mo
            ? {
                ...mc,
                label: mergeTri(mc.label, mo.label),
                wrongPattern: mergeTri(mc.wrongPattern, mo.wrongPattern),
                remediationTip: mergeTri(mc.remediationTip, mo.remediationTip),
              }
            : mc;
        }),
      },
    };
  });
}

export function applyEdgeReasonOverlay<
  E extends { topicId: string; prerequisiteId: string; reason: LocalizedText },
>(edges: E[], overlay: EdgeReasonOverlay): E[] {
  return edges.map((e) => {
    const tri = overlay[`${e.prerequisiteId}->${e.topicId}`];
    return tri ? { ...e, reason: mergeTri(e.reason, tri) } : e;
  });
}
