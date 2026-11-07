import type {
  CommonMisconception,
  GeneratedChoice,
  GeneratedQuestionInstance,
  InteractiveWidgetConfig,
  LocaleCode,
  LocalizedText,
  RegionalAlignmentRecord,
  RegionCode,
  RegionMetadata,
  ScaffoldStep,
  TriLocaleText,
} from "@/types/taxonomy";
import { toTraditionalChinese, findSimplifiedOnlyChars } from "./s2tw";
import {
  LOCALE_OPTIONS,
  REGION_NAME_BY_LOCALE,
  SEED_ASSIGNMENT_I18N,
  SEED_AUDIT_PREVIEW_EN,
  SEED_CLASSROOM_I18N,
  SEED_CUSTOM_QUESTION_EXPL_EN,
  SEED_PACT_REWARD_I18N,
  SEED_RELATIONSHIP_I18N,
  SEED_USER_I18N,
  getLocalizedGradeLabel,
  getLocalizedRegionProfile,
  getRegionDisplayName,
  type LocaleOption,
  type LocalizedRegionProfile,
} from "./regions-and-entities";

export {
  toTraditionalChinese,
  findSimplifiedOnlyChars,
  LOCALE_OPTIONS,
  REGION_NAME_BY_LOCALE,
  SEED_ASSIGNMENT_I18N,
  SEED_AUDIT_PREVIEW_EN,
  SEED_CLASSROOM_I18N,
  SEED_CUSTOM_QUESTION_EXPL_EN,
  SEED_PACT_REWARD_I18N,
  SEED_RELATIONSHIP_I18N,
  SEED_USER_I18N,
  getLocalizedGradeLabel,
  getLocalizedRegionProfile,
  getRegionDisplayName,
  type LocaleOption,
  type LocalizedRegionProfile,
};

export interface UiCopy {
  zh: string;
  en: string;
  ja: string;
  ko: string;
  ms: string;
  tw?: string;
}

export function c(
  zh: string,
  en: string,
  ja: string,
  ko: string,
  ms: string,
  tw?: string
): UiCopy {
  return { zh, en, ja, ko, ms, tw };
}

export function uiPick(locale: LocaleCode, copy: UiCopy): string {
  switch (locale) {
    case "zh-CN":
      return copy.zh;
    case "zh-TW":
      return copy.tw ?? toTraditionalChinese(copy.zh);
    case "en":
      return copy.en;
    case "ja":
      return copy.ja;
    case "ko":
      return copy.ko;
    case "ms":
      return copy.ms;
    default:
      return copy.en;
  }
}

export function biPick(
  locale: LocaleCode,
  zh: string | undefined,
  en: string | undefined
): string {
  const safeZh = zh ?? "";
  const safeEn = en ?? "";
  if (locale === "zh-CN") return safeZh || safeEn;
  if (locale === "zh-TW") return toTraditionalChinese(safeZh) || safeEn;
  return safeEn || safeZh;
}

/**
 * Core LocalizedText resolver with strict zero-Chinese-leakage guarantees across all 6 locales.
 */
export function localizeText(
  text: LocalizedText | undefined,
  locale: LocaleCode,
  bilingual = false,
  regionCode?: RegionCode
): string {
  if (!text) return "";

  let primary = "";
  switch (locale) {
    case "zh-CN":
      primary = text["zh-CN"] || text.en;
      break;
    case "zh-TW":
      primary = text["zh-TW"] || toTraditionalChinese(text["zh-CN"]) || text.en;
      break;
    case "en":
      primary = text.en;
      break;
    case "ja":
      primary = text.ja || text.en;
      break;
    case "ko":
      primary = text.ko || text.en;
      break;
    case "ms":
      primary = text.ms || text.en;
      break;
    default:
      primary = text.en;
  }

  if (!bilingual) {
    return primary;
  }

  // Optional clean bilingual pairing ONLY when explicitly toggled ON
  if (locale !== "en") {
    if (text.en && !primary.toLowerCase().includes(text.en.toLowerCase())) {
      return `${primary} · ${text.en}`;
    }
    return primary;
  }

  // When locale === "en" and bilingual === true: only pair with the active region's local script
  if (regionCode === "HK" || regionCode === "TW") {
    const tw = text["zh-TW"] || toTraditionalChinese(text["zh-CN"]);
    return tw && tw !== primary ? `${primary} · ${tw}` : primary;
  }
  if (regionCode === "CN" || regionCode === "SG") {
    const cn = text["zh-CN"];
    return cn && cn !== primary ? `${primary} · ${cn}` : primary;
  }
  if (regionCode === "JP" && text.ja) {
    return `${primary} · ${text.ja}`;
  }
  if (regionCode === "KR" && text.ko) {
    return `${primary} · ${text.ko}`;
  }
  if (regionCode === "MY" && text.ms && text.ms !== primary) {
    return `${primary} · ${text.ms}`;
  }
  return primary;
}

const HAS_CJK_RE = /[\u3400-\u9FFF]/;
const HAS_KANA_RE = /[\u3040-\u30FF]/;
const HAS_HANGUL_RE = /[\uAC00-\uD7AF]/;

function hasForeignScriptForLocale(
  str: string,
  locale: LocaleCode,
  sourceRegion?: RegionCode
): boolean {
  if (!str) return false;
  if (locale === "en" || locale === "ms") {
    return HAS_CJK_RE.test(str) || HAS_KANA_RE.test(str) || HAS_HANGUL_RE.test(str);
  }
  if (locale === "ja") {
    // For non-JP regions (CN, HK, TW, KR), ANY CJK or Hangul in chapter/edition is Chinese or Korean — must localize!
    if (sourceRegion && sourceRegion !== "JP") {
      return HAS_CJK_RE.test(str) || HAS_HANGUL_RE.test(str);
    }
    return HAS_HANGUL_RE.test(str) || findSimplifiedOnlyChars(str).length > 0;
  }
  if (locale === "ko") {
    return HAS_CJK_RE.test(str) || HAS_KANA_RE.test(str);
  }
  if (locale === "zh-CN") {
    // Reject Japanese Kana, Korean Hangul, and JP/KR region native strings
    if (sourceRegion === "JP" || sourceRegion === "KR") {
      return HAS_CJK_RE.test(str) || HAS_KANA_RE.test(str) || HAS_HANGUL_RE.test(str);
    }
    return HAS_KANA_RE.test(str) || HAS_HANGUL_RE.test(str);
  }
  if (locale === "zh-TW") {
    // Never run s2tw on Japanese or Korean strings!
    if (sourceRegion === "JP" || sourceRegion === "KR") {
      return HAS_CJK_RE.test(str) || HAS_KANA_RE.test(str) || HAS_HANGUL_RE.test(str);
    }
    return HAS_KANA_RE.test(str) || HAS_HANGUL_RE.test(str);
  }
  return false;
}

export function localizeAlignment(
  aln: RegionalAlignmentRecord | undefined,
  topic: { baselineGrade: number; title: LocalizedText } | undefined,
  reg: RegionMetadata | undefined,
  locale: LocaleCode
): RegionalAlignmentRecord | undefined {
  if (!aln) return undefined;

  // Native passthrough ONLY when UI locale matches the region's native script
  if (locale === "zh-CN" && aln.regionCode === "CN") return aln;
  if (locale === "zh-TW" && (aln.regionCode === "TW" || aln.regionCode === "HK")) {
    return {
      ...aln,
      localStageLabel: toTraditionalChinese(aln.localStageLabel),
      textbookEdition: toTraditionalChinese(aln.textbookEdition),
      localChapterTitle: toTraditionalChinese(aln.localChapterTitle),
      regionalNote: aln.regionalNote ? toTraditionalChinese(aln.regionalNote) : undefined,
    };
  }
  if (locale === "ja" && aln.regionCode === "JP") return aln;
  if (locale === "ko" && aln.regionCode === "KR") return aln;

  // Cross-Chinese clean conversion: CN -> zh-TW
  if (locale === "zh-TW" && aln.regionCode === "CN") {
    return {
      ...aln,
      localStageLabel: toTraditionalChinese(aln.localStageLabel),
      textbookEdition: toTraditionalChinese(aln.textbookEdition),
      localChapterTitle: toTraditionalChinese(aln.localChapterTitle),
      regionalNote: aln.regionalNote ? toTraditionalChinese(aln.regionalNote) : undefined,
    };
  }

  // HK / TW viewed under Simplified Chinese (`zh-CN`): use clean Simplified labels
  if (locale === "zh-CN" && (aln.regionCode === "HK" || aln.regionCode === "TW")) {
    const prof = reg ? getLocalizedRegionProfile(reg, "zh-CN", toTraditionalChinese) : undefined;
    return {
      ...aln,
      localStageLabel: getLocalizedGradeLabel(reg, aln.localGrade, "zh-CN", toTraditionalChinese),
      textbookEdition: prof ? prof.curriculumName : aln.standardCode,
      localChapterTitle: topic ? topic.title["zh-CN"] : aln.standardCode,
      regionalNote: undefined,
    };
  }

  const cleanStage = getLocalizedGradeLabel(reg, aln.localGrade, locale, toTraditionalChinese);

  const rawEdition = locale === "zh-TW" && !hasForeignScriptForLocale(aln.textbookEdition, locale, aln.regionCode)
    ? toTraditionalChinese(aln.textbookEdition)
    : aln.textbookEdition;

  const cleanEdition = hasForeignScriptForLocale(aln.textbookEdition, locale, aln.regionCode)
    ? reg
      ? getLocalizedRegionProfile(reg, locale, toTraditionalChinese).curriculumName
      : aln.standardCode
    : rawEdition;

  const rawChapter = locale === "zh-TW" && !hasForeignScriptForLocale(aln.localChapterTitle, locale, aln.regionCode)
    ? toTraditionalChinese(aln.localChapterTitle)
    : aln.localChapterTitle;

  const cleanChapter = hasForeignScriptForLocale(aln.localChapterTitle, locale, aln.regionCode)
    ? topic
      ? localizeText(topic.title, locale, false)
      : aln.standardCode
    : rawChapter;

  const cleanNote =
    aln.regionalNote && !hasForeignScriptForLocale(aln.regionalNote, locale, aln.regionCode)
      ? locale === "zh-TW"
        ? toTraditionalChinese(aln.regionalNote)
        : aln.regionalNote
      : undefined;

  return {
    ...aln,
    localStageLabel: cleanStage,
    textbookEdition: cleanEdition,
    localChapterTitle: cleanChapter,
    regionalNote: cleanNote,
  };
}

export function localizePrompt(
  inst: GeneratedQuestionInstance,
  locale: LocaleCode,
  bilingual = false
): string {
  const zh = locale === "zh-TW"
    ? inst.promptZhTw || toTraditionalChinese(inst.promptZh)
    : inst.promptZh;
  const en = inst.promptEn && !HAS_CJK_RE.test(inst.promptEn) ? inst.promptEn : inst.promptEn || zh;

  if (locale === "zh-CN") {
    return bilingual && en && en !== inst.promptZh ? `${inst.promptZh}\n\n${en}` : inst.promptZh;
  }
  if (locale === "zh-TW") {
    return bilingual && en && en !== zh ? `${zh}\n\n${en}` : zh;
  }
  return triPick(locale, inst.promptI18n, en);
}

/**
 * Picks the native ja / ko / ms variant of an item-bank string, falling back to English.
 */
export function triPick(
  locale: LocaleCode,
  i18n: TriLocaleText | undefined,
  en: string
): string {
  if (locale === "ja" || locale === "ko" || locale === "ms") {
    const native = i18n?.[locale];
    if (native && native.trim() !== "") return native;
  }
  return en;
}

export function localizeExplanation(
  inst: GeneratedQuestionInstance,
  locale: LocaleCode,
  bilingual = false
): string {
  if (locale === "zh-CN") {
    return bilingual && inst.explanationEn && inst.explanationEn !== inst.explanationZh
      ? `${inst.explanationZh}\n${inst.explanationEn}`
      : inst.explanationZh;
  }
  if (locale === "zh-TW") {
    const tw = toTraditionalChinese(inst.explanationZh);
    return bilingual && inst.explanationEn && inst.explanationEn !== tw
      ? `${tw}\n${inst.explanationEn}`
      : tw;
  }
  if (HAS_CJK_RE.test(inst.explanationEn)) {
    return SEED_CUSTOM_QUESTION_EXPL_EN[inst.templateId] ?? "Apply the canonical formula step by step to derive the result.";
  }
  return triPick(locale, inst.explanationI18n, inst.explanationEn || inst.explanationZh);
}

export function localizeChoice(
  ch: GeneratedChoice,
  locale: LocaleCode,
  bilingual = false
): string {
  if (locale === "zh-CN") {
    return bilingual && ch.textEn && ch.textEn !== ch.text
      ? `${ch.text} · ${ch.textEn}`
      : ch.text;
  }
  if (locale === "zh-TW") {
    const tw = toTraditionalChinese(ch.text);
    return bilingual && ch.textEn && ch.textEn !== tw ? `${tw} · ${ch.textEn}` : tw;
  }
  return triPick(locale, ch.textI18n, ch.textEn || ch.text);
}

export function localizeScaffold(
  sc: ScaffoldStep,
  locale: LocaleCode
): { prompt: string; hint: string; expected: string } {
  if (locale === "zh-CN") {
    return {
      prompt: sc.promptZh,
      hint: sc.hintZh,
      expected: sc.expectedAnswer,
    };
  }
  if (locale === "zh-TW") {
    return {
      prompt: toTraditionalChinese(sc.promptZh),
      hint: toTraditionalChinese(sc.hintZh),
      expected: toTraditionalChinese(sc.expectedAnswer),
    };
  }
  return {
    prompt: triPick(locale, sc.promptI18n, sc.promptEn || sc.promptZh),
    hint: triPick(locale, sc.hintI18n, sc.hintEn || sc.hintZh),
    expected: triPick(locale, sc.expectedAnswerI18n, sc.expectedAnswerEn || sc.expectedAnswer),
  };
}

export function localizeWidgetCaption(
  cfg: InteractiveWidgetConfig,
  locale: LocaleCode
): string {
  return triPick(locale, cfg.captionI18n, biPick(locale, cfg.captionZh, cfg.captionEn));
}

export function localizeWhyAsked(
  entry: { whyAskedZh: string; whyAskedEn: string; whyAskedI18n?: TriLocaleText },
  locale: LocaleCode
): string {
  return triPick(locale, entry.whyAskedI18n, biPick(locale, entry.whyAskedZh, entry.whyAskedEn));
}

/**
 * Sanitizes any legacy SVG diagram strings (e.g. stored in DB snapshots) so no Chinese leaks.
 */
export function localizeSvgDiagram(
  svgHtml: string | undefined,
  locale: LocaleCode
): string | undefined {
  if (!svgHtml) return undefined;
  if (locale === "zh-CN") return svgHtml;
  if (locale === "zh-TW") return toTraditionalChinese(svgHtml);

  return svgHtml
    .replace(/总量\s*Total\s*=\s*([^（<]+)（平均分\s*(\d+)\s*份）/g, "Total = $1 ($2 units)")
    .replace(/占\s*(\d+\/\d+)\s*→\s*求这部分？/g, "$1 = ?")
    .replace(/上底\s*a\s*=/g, "a =")
    .replace(/下底\s*b\s*=/g, "b =")
    .replace(/底\s*b\s*=/g, "b =")
    .replace(/高\s*h\s*=/g, "h =")
    .replace(/斜边\s*c\s*=/g, "c =")
    .replace(/对边\s*/g, "opp = ")
    .replace(/邻边\s*/g, "adj = ")
    .replace(/斜边\s*/g, "hyp = ")
    .replace(/电源电压\s*U\s*=/g, "U =");
}

export function localizeUserName(
  user: { id: string; displayName: string },
  locale: LocaleCode
): string {
  const seeded = SEED_USER_I18N[user.id]?.name[locale];
  if (seeded) return seeded;
  if (locale === "zh-TW") return toTraditionalChinese(user.displayName);
  if (hasForeignScriptForLocale(user.displayName, locale)) {
    // Extract Latin part if bilingual name like "林小宇 Leo Lin", else fallback to ID handle
    const latinMatch = user.displayName.match(/[A-Za-z][A-Za-z\s.'-]+/);
    if (latinMatch) return latinMatch[0].trim();
  }
  return user.displayName;
}

export function localizeUserTrack(
  user: {
    id: string;
    schoolTrack: string | null;
    regionCode: RegionCode;
    currentGrade: number | null;
  },
  locale: LocaleCode
): string {
  const seeded = SEED_USER_I18N[user.id]?.track[locale];
  if (seeded) return seeded;
  const raw = user.schoolTrack ?? "";
  if (!raw) return "";
  if (locale === "zh-CN") return raw;
  if (locale === "zh-TW") return toTraditionalChinese(raw);
  if (hasForeignScriptForLocale(raw, locale)) {
    const regName = getRegionDisplayName(user.regionCode, locale);
    return user.currentGrade ? `${regName} · G${user.currentGrade}` : regName;
  }
  return raw;
}

export function localizeClassroomName(
  cls: { id: string; name: string },
  locale: LocaleCode
): string {
  const seeded = SEED_CLASSROOM_I18N[cls.id]?.[locale];
  if (seeded) return seeded;
  if (locale === "zh-TW") return toTraditionalChinese(cls.name);
  if (hasForeignScriptForLocale(cls.name, locale)) return `Global STEM Cohort (${cls.id})`;
  return cls.name;
}

export function localizeRelationship(
  studentId: string,
  rawLabel: string,
  locale: LocaleCode
): string {
  const seeded = SEED_RELATIONSHIP_I18N[studentId]?.[locale];
  if (seeded) return seeded;
  if (locale === "zh-CN") return rawLabel;
  if (locale === "zh-TW") return toTraditionalChinese(rawLabel);
  if (hasForeignScriptForLocale(rawLabel, locale)) {
    const gMatch = rawLabel.match(/G(\d+)/i);
    return gMatch ? `Child Account · G${gMatch[1]}` : "Linked Child Account";
  }
  return rawLabel;
}

export function localizeAssignmentTitle(
  asg: { id: string; title: string; tier: string },
  locale: LocaleCode
): string {
  const seeded = SEED_ASSIGNMENT_I18N[asg.id]?.[locale];
  if (seeded) return seeded;
  if (locale === "zh-CN") return asg.title;
  if (locale === "zh-TW") return toTraditionalChinese(asg.title);
  if (hasForeignScriptForLocale(asg.title, locale)) {
    const tierMap: Record<string, UiCopy> = {
      foundational: c("靶向补基任务包", "[Foundational] Prerequisite Remediation Pack", "【基礎補強】前提単元パック", "【기초 보강】 선수 개념 팩", "[Pek Asas] Pemulihan Prasyarat"),
      standard: c("核心巩固任务包", "[Standard] Core Mastery Consolidation Pack", "【標準定着】コア演習パック", "【표준 정착】 핵심 마스터 팩", "[Pek Teras] Pengukuhan Penguasaan"),
      challenge: c("拔高拓展任务包", "[Challenge] Advanced Extension Pack", "【発展挑戦】応用チャレンジパック", "【심화 챌린지】 확장 탐구 팩", "[Pek Cabaran] Lanjutan Aras Tinggi"),
    };
    return uiPick(locale, tierMap[asg.tier] ?? tierMap.standard);
  }
  return asg.title;
}

export function localizePactReward(
  pact: { id: string; rewardTitle: string },
  locale: LocaleCode
): string {
  const seeded = SEED_PACT_REWARD_I18N[pact.id]?.[locale];
  if (seeded) return seeded;
  if (locale === "zh-CN") return pact.rewardTitle;
  if (locale === "zh-TW") return toTraditionalChinese(pact.rewardTitle);
  if (hasForeignScriptForLocale(pact.rewardTitle, locale)) {
    return uiPick(
      locale,
      c(
        pact.rewardTitle,
        "Weekly Mastery Milestone Badge & Family Science Activity",
        "週間目標達成バッジ & 家族サイエンス体験",
        "주간 목표 달성 배지 & 가족 과학 체험 활동",
        "Lencana Pencapaian Mingguan & Aktiviti Sains Keluarga"
      )
    );
  }
  return pact.rewardTitle;
}

export function localizeMisconceptionLabel(
  wq: { misconceptionTag: string | null; misconceptionLabel: string | null },
  topic: { microLesson: { misconceptions: CommonMisconception[] } } | undefined,
  locale: LocaleCode
): string {
  if (topic && wq.misconceptionTag) {
    const matched = topic.microLesson.misconceptions.find(
      (m) => m.tag === wq.misconceptionTag
    );
    if (matched) {
      return localizeText(matched.label, locale, false);
    }
  }
  if (topic && topic.microLesson.misconceptions[0]) {
    return localizeText(topic.microLesson.misconceptions[0].label, locale, false);
  }
  const raw = wq.misconceptionLabel ?? "";
  if (locale === "zh-CN") return raw || "概念边界待强化";
  if (locale === "zh-TW") return toTraditionalChinese(raw || "概念邊界待強化");
  if (!raw || hasForeignScriptForLocale(raw, locale)) {
    return uiPick(
      locale,
      c(
        "概念边界待强化",
        "Conceptual boundary & prerequisite step check",
        "概念境界および前提ステップの要確認",
        "개념 경계 및 선수 단계 점검 필요",
        "Semakan sempadan konsep & langkah prasyarat"
      )
    );
  }
  return raw;
}

export function localizeCustomEdgeReason(
  edge: { reasonZh: string; reasonEn: string },
  locale: LocaleCode
): string {
  return biPick(locale, edge.reasonZh, edge.reasonEn);
}

export function localizeCustomQuestionExplanation(
  cq: { id: string; explanationZh: string },
  locale: LocaleCode
): string {
  if (locale === "zh-CN") return cq.explanationZh;
  if (locale === "zh-TW") return toTraditionalChinese(cq.explanationZh);
  if (SEED_CUSTOM_QUESTION_EXPL_EN[cq.id]) return SEED_CUSTOM_QUESTION_EXPL_EN[cq.id];
  if (hasForeignScriptForLocale(cq.explanationZh, locale)) {
    return "Apply the linked canonical formula step by step to derive the solution.";
  }
  return cq.explanationZh;
}

export function localizeAuditPreview(
  log: { id: string; payloadPreview: string },
  locale: LocaleCode
): string {
  if (locale === "zh-CN") return log.payloadPreview;
  if (locale === "zh-TW") return toTraditionalChinese(log.payloadPreview);
  if (SEED_AUDIT_PREVIEW_EN[log.id]) return SEED_AUDIT_PREVIEW_EN[log.id];
  if (hasForeignScriptForLocale(log.payloadPreview, locale)) {
    return "[REDACTED_PII] Sanitized student study prompt";
  }
  return log.payloadPreview;
}
