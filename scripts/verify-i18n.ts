import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { LocaleCode, RegionCode } from "../src/types/taxonomy";
import { REGIONS_DATA, SUBJECTS_DATA } from "../src/data/regions-and-subjects";
import {
  ALL_CANONICAL_TOPICS,
  ALL_QUESTION_TEMPLATES,
  ALL_REGIONAL_ALIGNMENTS,
  CANONICAL_EDGES,
} from "../src/data/canonical-graph";
import {
  LOCALE_OPTIONS,
  SEED_ASSIGNMENT_I18N,
  SEED_CLASSROOM_I18N,
  SEED_PACT_REWARD_I18N,
  SEED_RELATIONSHIP_I18N,
  SEED_USER_I18N,
  findSimplifiedOnlyChars,
  getLocalizedGradeLabel,
  getLocalizedRegionProfile,
  getRegionDisplayName,
  localizeAlignment,
  localizeChoice,
  localizeExplanation,
  localizePrompt,
  localizeScaffold,
  localizeSvgDiagram,
  localizeText,
  toTraditionalChinese,
  uiPick,
  type UiCopy,
} from "../src/lib/i18n";
import { generateQuestion } from "../src/lib/engines/item-generator";
import { generateSocraticTutorReply } from "../src/lib/engines/socratic-tutor";
import {
  analyzeCapturedWrongQuestion,
  buildSmartExamPapers,
} from "../src/lib/engines/smart-capture-and-paper";
import { getLocalizedPrivacyRegime } from "../src/lib/engines/privacy-shield";
import { validateCustomEdgeAcyclic } from "../src/lib/engines/irt-engine";
import {
  CANVAS_COPY,
  FOOTER_COPY,
  NAV_COPY,
  WIDGET_COPY,
  getLoadingText,
} from "../src/lib/i18n/ui-common";
import {
  DIAGNOSE_COPY,
  EXPLORE_COPY,
  STUDENT_DASHBOARD_COPY,
} from "../src/lib/i18n/copy-student-core";
import {
  AUTH_COPY,
  CAPTURE_COPY,
  WRONG_BOOK_COPY,
  getCaptureSamplePresets,
  getPiiSandboxSample,
} from "../src/lib/i18n/copy-capture-clearance-auth";
import {
  PAPER_COPY,
  PARENT_COPY,
  PRINT_COPY,
  STUDIO_COPY,
  TEACHER_COPY,
  localizeCreatorName,
} from "../src/lib/i18n/copy-educator-parent";

const CJK_RE = /[\u3400-\u9FFF]/;
const KANA_RE = /[\u3040-\u30FF]/;
const HANGUL_RE = /[\uAC00-\uD7AF]/;
// Mainland-China-only simplified characters that do NOT exist in Japanese Shinjitai Kanji
const CN_ONLY_NON_JP_RE =
  /[这们个为动进连选过运还远适门问间阅难页项顺须风飞马验鱼鸟计认训议记讲论设访证评识诉词译试诗话诚询该详语误说请诸诺读课调谈谋谓谢谨谱针钉钙钛钠钢钥钦钧钩钱钳铁铃铅铜铝铭银链销锁锂锅锋锌锐错锡锦键锯锰锻镇镍镜纠红纤约级纪纬纯纱纲纳纵纷纸纹纺纽线练组绅细织终绍经绑绒结绕绘给络绝绞统绢绣继绩绪续绰绳维绵综绿缅缆缓缔缕编缘缚缝缠缩]/g;

function walkTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkTsxFiles(full));
    } else if (ent.isFile() && full.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function assertCleanForLocale(text: string, locale: LocaleCode, context: string): void {
  if (!text) return;
  if (locale === "en" || locale === "ms") {
    assert.equal(
      CJK_RE.test(text) || KANA_RE.test(text) || HANGUL_RE.test(text),
      false,
      `[${locale}] Foreign CJK/Kana/Hangul leaked in ${context}: "${text.slice(0, 120)}"`
    );
  } else if (locale === "zh-TW") {
    const simp = findSimplifiedOnlyChars(text);
    assert.equal(
      simp.length,
      0,
      `[zh-TW] Simplified-only chars [${simp.join("")}] leaked in ${context}: "${text.slice(0, 120)}"`
    );
  } else if (locale === "ko") {
    assert.equal(
      CJK_RE.test(text) || KANA_RE.test(text),
      false,
      `[ko] Foreign CJK/Kana leaked in ${context}: "${text.slice(0, 120)}"`
    );
  } else if (locale === "ja") {
    const cnOnly = Array.from(new Set(text.match(CN_ONLY_NON_JP_RE) ?? []));
    assert.equal(
      cnOnly.length === 0 && !HANGUL_RE.test(text),
      true,
      `[ja] Mainland-only Simplified Chinese [${cnOnly.join("")}] or Hangul leaked in ${context}: "${text.slice(0, 120)}"`
    );
  }
}

async function main(): Promise<void> {
  console.log("🌍 Running OmniGraph K12 Comprehensive 6-Locale × 9-Region Zero-Leak Audit...");

  const allLocales: LocaleCode[] = LOCALE_OPTIONS.map((o) => o.code);

  // 1. Static TSX scan: ZERO CJK characters in src/app/**/*.tsx and src/components/**/*.tsx
  const rootDir = process.cwd();
  const tsxFiles = [
    ...walkTsxFiles(path.join(rootDir, "src/app")),
    ...walkTsxFiles(path.join(rootDir, "src/components")),
  ];
  let tsxViolations = 0;
  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (CJK_RE.test(line)) {
        console.error(
          `  ❌ Hardcoded CJK in ${path.relative(rootDir, file)}:${idx + 1}: ${line.trim()}`
        );
        tsxViolations++;
      }
      if (/\[["']zh-CN["']\]/.test(line)) {
        console.error(
          `  ❌ Direct ["zh-CN"] index in ${path.relative(rootDir, file)}:${idx + 1}: ${line.trim()}`
        );
        tsxViolations++;
      }
    });
  }
  assert.equal(tsxViolations, 0, `Found ${tsxViolations} hardcoded CJK lines in TSX files!`);
  console.log(`  ✔ Static TSX Scan: 0 hardcoded CJK characters across ${tsxFiles.length} .tsx files`);

  // 2. Canonical Subjects, Topics, Micro-Lessons, Misconceptions & Edges across all 6 locales
  for (const locale of allLocales) {
    for (const subj of SUBJECTS_DATA) {
      assertCleanForLocale(localizeText(subj.name, locale, false), locale, `subject.name(${subj.id})`);
      assertCleanForLocale(
        localizeText(subj.description, locale, false),
        locale,
        `subject.description(${subj.id})`
      );
    }

    for (const topic of ALL_CANONICAL_TOPICS) {
      assertCleanForLocale(localizeText(topic.title, locale, false), locale, `topic.title(${topic.id})`);
      assertCleanForLocale(
        localizeText(topic.domainI18n, locale, false),
        locale,
        `topic.domainI18n(${topic.id})`
      );
      assertCleanForLocale(
        localizeText(topic.description, locale, false),
        locale,
        `topic.description(${topic.id})`
      );
      assertCleanForLocale(
        localizeText(topic.homeCheckPrompt, locale, false),
        locale,
        `topic.homeCheckPrompt(${topic.id})`
      );
      assertCleanForLocale(
        localizeText(topic.microLesson.intuition, locale, false),
        locale,
        `topic.intuition(${topic.id})`
      );
      if (topic.microLesson.coreFormula) {
        assert.equal(
          CJK_RE.test(topic.microLesson.coreFormula),
          false,
          `coreFormula has CJK on ${topic.id}: ${topic.microLesson.coreFormula}`
        );
      }
      for (const mc of topic.masteryCriteria) {
        assertCleanForLocale(localizeText(mc, locale, false), locale, `masteryCriteria(${topic.id})`);
      }
      for (const st of topic.microLesson.steps) {
        assertCleanForLocale(localizeText(st.title, locale, false), locale, `step.title(${topic.id})`);
        assertCleanForLocale(localizeText(st.body, locale, false), locale, `step.body(${topic.id})`);
        if (st.checkQuestion) {
          assertCleanForLocale(
            localizeText(st.checkQuestion, locale, false),
            locale,
            `step.checkQuestion(${topic.id})`
          );
        }
      }
      for (const misc of topic.microLesson.misconceptions) {
        assertCleanForLocale(
          localizeText(misc.label, locale, false),
          locale,
          `misc.label(${topic.id}/${misc.tag})`
        );
        assertCleanForLocale(
          localizeText(misc.wrongPattern, locale, false),
          locale,
          `misc.wrongPattern(${topic.id}/${misc.tag})`
        );
        assertCleanForLocale(
          localizeText(misc.remediationTip, locale, false),
          locale,
          `misc.remediationTip(${topic.id}/${misc.tag})`
        );
      }
    }

    for (const edge of CANONICAL_EDGES) {
      assertCleanForLocale(
        localizeText(edge.reason, locale, false),
        locale,
        `edge.reason(${edge.prerequisiteId}->${edge.topicId})`
      );
    }
  }
  console.log("  ✔ Canonical Data: all 9 subjects, 50 topics, micro-lessons & 78 edges clean in 6 locales");

  // 3. All 450 Regional Alignments + 9 Region Profiles + Seed Entities across all 6 locales
  const topicById = new Map(ALL_CANONICAL_TOPICS.map((t) => [t.id, t]));
  const regionByCode = new Map(REGIONS_DATA.map((r) => [r.code, r]));

  for (const locale of allLocales) {
    for (const reg of REGIONS_DATA) {
      assertCleanForLocale(getRegionDisplayName(reg.code, locale), locale, `regionName(${reg.code})`);
      const prof = getLocalizedRegionProfile(reg, locale, toTraditionalChinese);
      assertCleanForLocale(prof.labelWithSystem, locale, `prof.labelWithSystem(${reg.code})`);
      assertCleanForLocale(prof.schoolSystem, locale, `prof.schoolSystem(${reg.code})`);
      assertCleanForLocale(prof.curriculumName, locale, `prof.curriculumName(${reg.code})`);
      assertCleanForLocale(prof.privacyRegulation, locale, `prof.privacyRegulation(${reg.code})`);
      for (let g = 1; g <= 12; g++) {
        assertCleanForLocale(
          getLocalizedGradeLabel(reg, g, locale, toTraditionalChinese),
          locale,
          `gradeLabel(${reg.code}, G${g})`
        );
      }
    }

    for (const aln of ALL_REGIONAL_ALIGNMENTS) {
      const locAln = localizeAlignment(
        aln,
        topicById.get(aln.topicId),
        regionByCode.get(aln.regionCode),
        locale
      )!;
      assertCleanForLocale(locAln.localStageLabel, locale, `aln.stage(${aln.topicId},${aln.regionCode})`);
      assertCleanForLocale(locAln.textbookEdition, locale, `aln.edition(${aln.topicId},${aln.regionCode})`);
      assertCleanForLocale(locAln.localChapterTitle, locale, `aln.chapter(${aln.topicId},${aln.regionCode})`);
    }

    for (const [id, u] of Object.entries(SEED_USER_I18N)) {
      assertCleanForLocale(u.name[locale], locale, `seedUser.name(${id})`);
      assertCleanForLocale(u.track[locale], locale, `seedUser.track(${id})`);
    }
    for (const [id, cls] of Object.entries(SEED_CLASSROOM_I18N)) {
      assertCleanForLocale(cls[locale], locale, `seedClass(${id})`);
    }
    for (const [id, asg] of Object.entries(SEED_ASSIGNMENT_I18N)) {
      assertCleanForLocale(asg[locale], locale, `seedAssign(${id})`);
    }
    for (const [id, rel] of Object.entries(SEED_RELATIONSHIP_I18N)) {
      assertCleanForLocale(rel[locale], locale, `seedRel(${id})`);
    }
    for (const [id, pact] of Object.entries(SEED_PACT_REWARD_I18N)) {
      assertCleanForLocale(pact[locale], locale, `seedPact(${id})`);
    }
  }
  console.log("  ✔ Alignments & Personas: 2,700 regional alignment views + all seeded entities clean in 6 locales");

  // 4. All 150 Parameterized Question Templates across all 6 locales
  for (const tpl of ALL_QUESTION_TEMPLATES) {
    const inst = generateQuestion({
      templateId: tpl.id,
      seed: "verify_i18n_seed",
      regionCode: "US",
      variantIndex: 1,
    });
    for (const locale of allLocales) {
      // Note: question stems/choices in ja/ko/ms resolve to clean English STEM text (zero Chinese leakage)
      const checkLoc: LocaleCode = locale === "ja" || locale === "ko" ? "en" : locale;
      assertCleanForLocale(localizePrompt(inst, locale, false), checkLoc, `prompt(${tpl.id})`);
      assertCleanForLocale(localizeExplanation(inst, locale, false), checkLoc, `expl(${tpl.id})`);
      const svg = localizeSvgDiagram(inst.svgDiagram, locale);
      if (svg) assertCleanForLocale(svg, checkLoc, `svg(${tpl.id})`);
      for (const ch of inst.choices ?? []) {
        assertCleanForLocale(localizeChoice(ch, locale, false), checkLoc, `choice(${tpl.id})`);
      }
      for (const sc of inst.scaffolds) {
        const sLoc = localizeScaffold(sc, locale);
        assertCleanForLocale(sLoc.prompt, checkLoc, `sc.prompt(${tpl.id})`);
        assertCleanForLocale(sLoc.hint, checkLoc, `sc.hint(${tpl.id})`);
        assertCleanForLocale(sLoc.expected, checkLoc, `sc.expected(${tpl.id})`);
      }
    }
  }
  console.log("  ✔ Item Bank: all 150 parameterized templates × 6 locales verified zero Chinese leakage");

  // 5. Backend Engines (Socratic Tutor, Smart Capture, Exam Builder, Privacy Shield, DAG Cycle Guard)
  const regionForLocale: Record<LocaleCode, RegionCode> = {
    "zh-CN": "CN",
    "zh-TW": "HK",
    en: "US",
    ja: "JP",
    ko: "KR",
    ms: "MY",
  };

  for (const locale of allLocales) {
    const rCode = regionForLocale[locale];
    const q = generateQuestion({
      topicId: "mt_phy_ohm_law",
      difficulty: "standard",
      seed: "tutor_i18n",
      regionCode: rCode,
    });

    const tutorRes = await generateSocraticTutorReply({
      topicId: "mt_phy_ohm_law",
      regionCode: rCode,
      locale,
      bilingual: false,
      question: q,
      studentWrongAnswer: "18",
      detectedMisconceptionTag: "misc_ohm_parallel_add",
      messages: [{ role: "user", content: "18?" }],
    });
    assertCleanForLocale(tutorRes.reply, locale, `socraticTutor.reply(${locale})`);
    for (const pName of tutorRes.referencedPrerequisites) {
      assertCleanForLocale(pName, locale, `socraticTutor.prereq(${locale})`);
    }

    const capRes = analyzeCapturedWrongQuestion({
      sanitizedQuestionText: "Parallel circuit R1=6 ohm and R2=12 ohm using Ohm's law 1/R",
      studentWrongAnswer: "18",
      regionCode: rCode,
      locale,
      seed: "cap_i18n",
    });
    assertCleanForLocale(capRes.analysisSummary, locale, `capture.summary(${locale})`);
    assertCleanForLocale(capRes.matchedPrimary.title, locale, `capture.title(${locale})`);
    assertCleanForLocale(capRes.detectedMisconception.label, locale, `capture.misc(${locale})`);

    const paperRes = buildSmartExamPapers({
      regionCode: rCode,
      locale,
      subjectId: "math",
      topicIds: ["mt_math_rational_eq", "mt_math_quad_complete_sq", "mt_math_ratio_percent"],
      totalItems: 4,
      ratio: { basicPct: 25, standardPct: 50, challengePct: 25 },
      paperSeed: "paper_i18n",
    });
    assertCleanForLocale(paperRes.paperTitle, locale, `paper.title(${locale})`);
    for (const row of paperRes.blueprint) {
      assertCleanForLocale(row.topicTitle, locale, `paper.rowTitle(${locale})`);
      assertCleanForLocale(row.localChapterTitle, locale, `paper.rowChapter(${locale})`);
    }

    const priv = getLocalizedPrivacyRegime(rCode, locale);
    assertCleanForLocale(priv.regulationName, locale, `privacy.name(${locale})`);
    assertCleanForLocale(priv.summary, locale, `privacy.summary(${locale})`);

    const cyc = validateCustomEdgeAcyclic(
      CANONICAL_EDGES,
      { topicId: "mt_math_linear_eq_one", prerequisiteId: "mt_phy_ohm_law" },
      locale
    );
    assertCleanForLocale(cyc.reason ?? "", locale, `cycleGuard(${locale})`);
  }
  console.log("  ✔ Backend Engines: Socratic Tutor, Smart Capture, Exam Builder, Privacy Shield & Cycle Guard clean in 6 locales");

  // 6. All 15 UI Copy Dictionaries & Helper Presets across all 6 locales
  const uiDictionaries: Record<string, unknown> = {
    CANVAS_COPY,
    FOOTER_COPY,
    NAV_COPY,
    WIDGET_COPY,
    STUDENT_DASHBOARD_COPY,
    EXPLORE_COPY,
    DIAGNOSE_COPY,
    WRONG_BOOK_COPY,
    CAPTURE_COPY,
    AUTH_COPY,
    TEACHER_COPY,
    PAPER_COPY,
    STUDIO_COPY,
    PARENT_COPY,
    PRINT_COPY,
  };

  let uiEntriesChecked = 0;
  function walkUiCopy(node: unknown, ctxPath: string): void {
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    if (
      typeof rec.zh === "string" &&
      typeof rec.en === "string" &&
      typeof rec.ja === "string" &&
      typeof rec.ko === "string" &&
      typeof rec.ms === "string"
    ) {
      uiEntriesChecked++;
      for (const locale of allLocales) {
        assertCleanForLocale(
          uiPick(locale, rec as unknown as UiCopy),
          locale,
          `${ctxPath}[${locale}]`
        );
      }
      return;
    }
    for (const [k, v] of Object.entries(rec)) {
      walkUiCopy(v, `${ctxPath}.${k}`);
    }
  }

  for (const [dictName, dictVal] of Object.entries(uiDictionaries)) {
    walkUiCopy(dictVal, dictName);
  }

  for (const locale of allLocales) {
    assertCleanForLocale(getLoadingText(locale), locale, `getLoadingText(${locale})`);
    assertCleanForLocale(getPiiSandboxSample(locale), locale, `getPiiSandboxSample(${locale})`);
    assertCleanForLocale(
      localizeCreatorName("王知行老师 Ms. Evelyn Wang", locale),
      locale,
      `localizeCreatorName(${locale})`
    );
    for (const preset of getCaptureSamplePresets(locale)) {
      assertCleanForLocale(preset.label, locale, `capturePreset.label(${locale})`);
      assertCleanForLocale(preset.stem, locale, `capturePreset.stem(${locale})`);
      assertCleanForLocale(preset.wrongAns, locale, `capturePreset.wrongAns(${locale})`);
    }
  }
  console.log(
    `  ✔ UI Copy Dictionaries: ${uiEntriesChecked} 6-locale UI copy entries & presets verified clean across 15 modules`
  );

  console.log("🎉 ALL I18N ZERO-LEAK AUDIT CHECKS PASSED!");
}

main().catch((err) => {
  console.error("❌ i18n verification failed:", err);
  process.exit(1);
});
