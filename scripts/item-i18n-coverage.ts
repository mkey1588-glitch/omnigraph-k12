/**
 * Item-bank ja / ko / ms coverage & leak checker.
 *
 * Usage:
 *   pnpm exec tsx scripts/item-i18n-coverage.ts                 # all generators, summary
 *   pnpm exec tsx scripts/item-i18n-coverage.ts --keys a,b,c    # only these generatorKeys, full detail
 *   pnpm exec tsx scripts/item-i18n-coverage.ts --verbose       # print every gap
 *
 * Exit code is 1 when any gap or leak is found in the selected scope.
 */
import type { GeneratedQuestionInstance, TriLocaleText } from "../src/types/taxonomy";
import { ALL_CANONICAL_TOPICS, ALL_QUESTION_TEMPLATES } from "../src/data/canonical-graph";
import { generateQuestion } from "../src/lib/engines/item-generator";
import {
  findSimplifiedOnlyChars,
  localizeChoice,
  localizeExplanation,
  localizePrompt,
  localizeScaffold,
  localizeWidgetCaption,
} from "../src/lib/i18n";

const TRI = ["ja", "ko", "ms"] as const;
type Tri = (typeof TRI)[number];

const CJK_RE = /[\u3400-\u9FFF]/;
const KANA_RE = /[\u3040-\u30FF]/;
const HANGUL_RE = /[\uAC00-\uD7AF]/;
const JA_SCRIPT_RE = /[\u3040-\u30FF\u4E00-\u9FFF]/;
// Mainland-only simplified characters that do not exist in Japanese Shinjitai
const CN_ONLY_NON_JP_RE =
  /[这们个为动进连选过运还远适门问间阅难页项顺须风飞马验鱼鸟计认训议记讲论设访证评识诉词译试诗话诚询该详语误说请诸诺读课调谈谋谓谢谨谱针钉钙钛钠钢钥钦钧钩钱钳铁铃铅铜铝铭银链销锁锂锅锋锌锐错锡锦键锯锰锻镇镍镜纠红纤约级纪纬纯纱纲纳纵纷纸纹纺纽线练组绅细织终绍经绑绒结绕绘给络绝绞统绢绣继绩绪续绰绳维绵综绿缅缆缓缔缕编缘缚缝缠缩]/g;

/** A string "needs translation" when it contains a real word (not just math tokens / units). */
const MATH_TOKENS = new Set([
  "sin", "cos", "tan", "log", "ln", "sqrt", "lim", "max", "min", "mod", "div",
  "kg", "cm", "mm", "km", "mol", "hz", "mph", "kmh", "rad", "deg", "frac", "cdot", "times", "text",
]);
export function isWordy(s: string | undefined): boolean {
  if (!s) return false;
  const stripped = s.replace(/\$[^$]*\$/g, " "); // ignore inline KaTeX
  const words = stripped.match(/[A-Za-z]{3,}/g) ?? [];
  return words.some((w) => !MATH_TOKENS.has(w.toLowerCase()));
}

export function leakFor(locale: Tri, text: string): string | null {
  if (!text) return null;
  if (locale === "ms") {
    if (CJK_RE.test(text) || KANA_RE.test(text) || HANGUL_RE.test(text)) return "CJK/Kana/Hangul in ms";
  } else if (locale === "ko") {
    if (CJK_RE.test(text) || KANA_RE.test(text)) return "CJK/Kana in ko";
  } else if (locale === "ja") {
    const cn = Array.from(new Set(text.match(CN_ONLY_NON_JP_RE) ?? []));
    if (cn.length > 0) return `Mainland-only simplified chars [${cn.join("")}] in ja`;
    if (HANGUL_RE.test(text)) return "Hangul in ja";
  }
  return null;
}

function nativeScriptProblem(locale: Tri, native: string, en: string): string | null {
  if (locale === "ja" && !JA_SCRIPT_RE.test(native)) return "ja text has no Japanese script";
  if (locale === "ko" && !HANGUL_RE.test(native)) return "ko text has no Hangul";
  if (locale === "ms" && isWordy(en) && native.trim() === en.trim()) return "ms text identical to English";
  return null;
}

export interface ItemGap {
  generatorKey: string;
  templateId: string;
  field: string;
  locale: Tri;
  problem: string;
  sample: string;
}

const SUBJECT_BY_TOPIC = new Map(ALL_CANONICAL_TOPICS.map((t) => [t.id, t.subjectId]));

export function collectItemI18nGaps(filterKeys?: string[]): { gaps: ItemGap[]; instances: number } {
  const gaps: ItemGap[] = [];
  let instances = 0;
  const templates = ALL_QUESTION_TEMPLATES.filter(
    (t) => !filterKeys || filterKeys.includes(t.generatorKey)
  );

  for (const tpl of templates) {
    const isEnglishSubject = SUBJECT_BY_TOPIC.get(tpl.topicId) === "english";
    const seenGap = new Set<string>();
    const push = (field: string, locale: Tri, problem: string, sample: string) => {
      const k = `${field}|${locale}|${problem}`;
      if (seenGap.has(k)) return;
      seenGap.add(k);
      gaps.push({ generatorKey: tpl.generatorKey, templateId: tpl.id, field, locale, problem, sample: sample.slice(0, 110) });
    };

    for (const region of ["CN", "US", "JP", "KR", "MY"] as const) {
      for (let v = 0; v < 6; v++) {
        const inst: GeneratedQuestionInstance = generateQuestion({
          templateId: tpl.id,
          seed: "i18n_cov",
          regionCode: region,
          variantIndex: v,
        });
        instances++;

        const requireTri = (field: string, i18n: TriLocaleText | undefined, en: string, required: boolean) => {
          for (const loc of TRI) {
            const native = i18n?.[loc];
            if (!native) {
              if (required) push(field, loc, "missing", en);
              continue;
            }
            const scriptIssue = nativeScriptProblem(loc, native, en);
            if (scriptIssue) push(field, loc, scriptIssue, native);
          }
        };

        requireTri("prompt", inst.promptI18n, inst.promptEn, true);
        requireTri("explanation", inst.explanationI18n, inst.explanationEn, true);
        if (inst.interactiveWidget) {
          requireTri("widget.caption", inst.interactiveWidget.captionI18n, inst.interactiveWidget.captionEn, true);
        }
        inst.scaffolds.forEach((sc, i) => {
          requireTri(`scaffold[${i}].prompt`, sc.promptI18n, sc.promptEn, true);
          requireTri(`scaffold[${i}].hint`, sc.hintI18n, sc.hintEn, isWordy(sc.hintEn));
          const expEn = sc.expectedAnswerEn ?? sc.expectedAnswer;
          requireTri(`scaffold[${i}].expected`, sc.expectedAnswerI18n, expEn, !isEnglishSubject && isWordy(expEn));
        });
        for (const ch of inst.choices ?? []) {
          const en = ch.textEn ?? ch.text;
          requireTri(`choice`, ch.textI18n, en, !isEnglishSubject && isWordy(en));
        }

        // Leak checks on the final rendered output
        for (const loc of TRI) {
          const outputs: Array<[string, string]> = [
            ["prompt", localizePrompt(inst, loc)],
            ["explanation", localizeExplanation(inst, loc)],
          ];
          if (inst.interactiveWidget) outputs.push(["widget.caption", localizeWidgetCaption(inst.interactiveWidget, loc)]);
          inst.scaffolds.forEach((sc, i) => {
            const s = localizeScaffold(sc, loc);
            outputs.push([`scaffold[${i}].prompt`, s.prompt], [`scaffold[${i}].hint`, s.hint], [`scaffold[${i}].expected`, s.expected]);
          });
          for (const ch of inst.choices ?? []) outputs.push(["choice", localizeChoice(ch, loc)]);
          for (const [field, text] of outputs) {
            const leak = leakFor(loc, text);
            if (leak) push(field, loc, `LEAK: ${leak}`, text);
          }
        }
      }
    }
  }
  return { gaps, instances };
}

// Keep the import used (simplified-char helper is part of the public audit surface)
void findSimplifiedOnlyChars;

if (process.argv[1] && process.argv[1].endsWith("item-i18n-coverage.ts")) {
  const keysArg = process.argv.find((a) => a.startsWith("--keys"));
  const keysIdx = process.argv.indexOf("--keys");
  const keysRaw = keysArg?.includes("=") ? keysArg.split("=")[1] : keysIdx >= 0 ? process.argv[keysIdx + 1] : undefined;
  const filterKeys = keysRaw ? keysRaw.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  const verbose = process.argv.includes("--verbose") || Boolean(filterKeys);

  const { gaps, instances } = collectItemI18nGaps(filterKeys);
  const byKey = new Map<string, ItemGap[]>();
  for (const g of gaps) byKey.set(g.generatorKey, [...(byKey.get(g.generatorKey) ?? []), g]);

  const allKeys = Array.from(
    new Set(ALL_QUESTION_TEMPLATES.filter((t) => !filterKeys || filterKeys.includes(t.generatorKey)).map((t) => t.generatorKey))
  );
  let clean = 0;
  for (const key of allKeys) {
    const list = byKey.get(key) ?? [];
    if (list.length === 0) {
      clean++;
      continue;
    }
    console.log(`✗ ${key}: ${list.length} gap(s)`);
    if (verbose) {
      for (const g of list) {
        console.log(`    [${g.templateId}] ${g.field} (${g.locale}) ${g.problem} :: ${g.sample}`);
      }
    }
  }
  console.log(
    `\nItem i18n coverage: ${clean}/${allKeys.length} generators fully covered · ${gaps.length} gap(s) · ${instances} instances scanned`
  );
  process.exit(gaps.length === 0 ? 0 : 1);
}
