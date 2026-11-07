import type {
  DifficultyTier,
  GeneratedChoice,
  GeneratedQuestionInstance,
  InteractiveWidgetConfig,
  RegionCode,
  ScaffoldStep,
} from "@/types/taxonomy";
import { REGIONS_DATA } from "@/data/regions-and-subjects";
import { ALL_QUESTION_TEMPLATES, type QuestionTemplateSeed } from "@/data/canonical-graph";
import { generatePhase2Core } from "./item-generator-phase2";
import { generateStemCore } from "./item-generator-stem";
import {
  DeterministicRng,
  formatFrac,
  formatLinearExpr,
  formatQuadraticExpr,
  gcd,
  getCurrency,
  hashSeed,
  koP,
  svgBarModel,
  svgParabola,
  svgRightTriangle,
  svgTrapezoidOrTriangle,
  synthesizeCleanNumericDistractor,
  type RawGeneratedCore,
} from "./item-generator-shared";

export { DeterministicRng, formatLinearExpr, formatQuadraticExpr, koP };
export type { RawGeneratedCore };


function finalizeInstance(
  rng: DeterministicRng,
  template: QuestionTemplateSeed,
  seed: string,
  variantIndex: number,
  core: RawGeneratedCore
): GeneratedQuestionInstance {
  const instanceId = `inst_${template.id}_${hashSeed(`${seed}:${variantIndex}`).toString(36)}`;

  // Sanitize misconceptionsByValue so the canonical answer (or accepted equivalents) NEVER appears as a wrong key!
  let sanitizedMisconceptions: Record<string, string> | undefined;
  if (core.misconceptionsByValue) {
    const forbidden = new Set(
      [core.answer, ...(core.acceptedEquivalents ?? [])].map((s) => s.trim().toLowerCase())
    );
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(core.misconceptionsByValue)) {
      if (k.trim() !== "" && !forbidden.has(k.trim().toLowerCase())) {
        cleaned[k] = v;
      }
    }
    sanitizedMisconceptions = Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  let choices: GeneratedChoice[] | undefined;
  let finalAnswer = core.answer;

  if (template.itemType === "choice") {
    const uniqueDistractors: RawGeneratedCore["distractors"] = [];
    const seen = new Set<string>([core.answer.trim().toLowerCase()]);
    for (const eq of core.acceptedEquivalents ?? []) {
      seen.add(eq.trim().toLowerCase());
    }
    for (const d of core.distractors) {
      const k = d.text.trim().toLowerCase();
      if (!seen.has(k) && d.text.trim() !== "") {
        seen.add(k);
        uniqueDistractors.push(d);
      }
      if (uniqueDistractors.length === 3) break;
    }

    let fallbackAttempt = 0;
    while (uniqueDistractors.length < 3 && fallbackAttempt < 12) {
      fallbackAttempt++;
      const cleanVal = synthesizeCleanNumericDistractor(core.answer, seen, fallbackAttempt);
      if (cleanVal) {
        seen.add(cleanVal.toLowerCase());
        uniqueDistractors.push({
          text: cleanVal,
          textEn: cleanVal,
          misconceptionTag: "misc_arithmetic_slip",
        });
      }
    }

    const pool = rng.shuffle([
      {
        text:
          core.unit && !core.answer.includes(core.unit)
            ? `${core.answer} ${core.unit}`
            : core.answer,
        textEn:
          core.answerEn ??
          (core.unit && !core.answer.includes(core.unit) && /^-?\d/.test(core.answer)
            ? `${core.answer} ${core.unit}`
            : undefined),
        textI18n: core.answerI18n,
        isCorrect: true,
        misconceptionTag: undefined,
      },
      ...uniqueDistractors.map((d) => ({
        text:
          core.unit && !d.text.includes(core.unit) && /^-?\d/.test(d.text)
            ? `${d.text} ${core.unit}`
            : d.text,
        textEn:
          d.textEn ??
          (core.unit && !d.text.includes(core.unit) && /^-?\d/.test(d.text)
            ? `${d.text} ${core.unit}`
            : undefined),
        textI18n: d.textI18n,
        isCorrect: false,
        misconceptionTag: d.misconceptionTag,
      })),
    ]);

    const keys: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
    choices = pool.map((item, idx) => {
      if (item.isCorrect) finalAnswer = keys[idx];
      return {
        key: keys[idx],
        text: item.text,
        textEn: item.textEn,
        textI18n: item.textI18n,
        misconceptionTag: item.misconceptionTag,
      };
    });
  }

  return {
    instanceId,
    templateId: template.id,
    topicId: template.topicId,
    seed: `${seed}#${variantIndex}`,
    difficulty: template.difficulty,
    itemType: template.itemType,
    promptZh: core.promptZh,
    promptEn: core.promptEn,
    promptI18n: core.promptI18n,
    latexFormula: core.latexFormula,
    svgDiagram: core.svgDiagram,
    interactiveWidget: core.interactiveWidget,
    choices,
    answer: finalAnswer,
    acceptedEquivalents: core.acceptedEquivalents,
    unorderedMulti: core.unorderedMulti,
    requireSimplifiedFraction: core.requireSimplifiedFraction,
    unit: core.unit,
    explanationZh: core.explanationZh,
    explanationEn: core.explanationEn,
    explanationI18n: core.explanationI18n,
    scaffolds: core.scaffolds,
    misconceptionsByValue: sanitizedMisconceptions,
  };
}

export interface GenerateQuestionParams {
  templateId?: string;
  topicId?: string;
  difficulty?: DifficultyTier;
  seed: string;
  regionCode?: RegionCode;
  variantIndex?: number;
}

/**
 * Generate an anti-memorization parameterized question instance for any of the 30 canonical topics.
 */
export function generateQuestion(params: GenerateQuestionParams): GeneratedQuestionInstance {
  const difficulty = params.difficulty ?? "standard";
  const regionCode = params.regionCode ?? "CN";
  const variantIndex = params.variantIndex ?? 0;

  let template: QuestionTemplateSeed | undefined;
  if (params.templateId) {
    template = ALL_QUESTION_TEMPLATES.find((t) => t.id === params.templateId);
  }
  if (!template && params.topicId) {
    template =
      ALL_QUESTION_TEMPLATES.find(
        (t) => t.topicId === params.topicId && t.difficulty === difficulty
      ) ?? ALL_QUESTION_TEMPLATES.find((t) => t.topicId === params.topicId);
  }
  if (!template) {
    template = ALL_QUESTION_TEMPLATES[0];
  }

  const rng = new DeterministicRng(
    `${params.seed}::${template.id}::${regionCode}::v${variantIndex}`
  );
  const cur = getCurrency(regionCode);
  const dTier = template.difficulty;

  let core: RawGeneratedCore;

  switch (template.generatorKey) {
    // 1. Place value & inverse four operations
    case "math_place_value_ops": {
      if (dTier === "challenge") {
        const div = rng.int(6, 9);
        const q = rng.int(12, 24);
        const r = rng.int(2, div - 1);
        const total = div * q + r;
        const wrongR = div * r + q;
        core = {
          promptZh: `一个正整数除以 ${div}，商是 ${q}，余数是 ${r}。这个被除数是多少？`,
          promptEn: `When a positive integer is divided by ${div}, the quotient is ${q} and the remainder is ${r}. Find the dividend.`,
          promptI18n: {
            ja: `ある正の整数を ${div} でわると、商が ${q}、余りが ${r} になります。わられる数を求めなさい。`,
            ko: `어떤 자연수를 ${koP(div, "으로", "로")} 나누었더니 몫이 ${q}, 나머지가 ${koP(r, "이었습니다", "였습니다")}. 나누어지는 수를 구하시오.`,
            ms: `Apabila suatu integer positif dibahagi dengan ${div}, hasil bahaginya ialah ${q} dan bakinya ialah ${r}. Cari nombor yang dibahagi.`,
          },
          answer: `${total}`,
          explanationZh: `根据被除数 = 商 × 除数 + 余数，得 ${q} × ${div} + ${r} = ${total}（且余数 ${r} < ${div}）。`,
          explanationEn: `Dividend = Quotient × Divisor + Remainder = ${q} × ${div} + ${r} = ${total}.`,
          explanationI18n: {
            ja: `わられる数 = 商 × わる数 + 余り より、${q} × ${div} + ${r} = ${total} です（余り ${r} < ${div}）。`,
            ko: `나누어지는 수 = 몫 × 나누는 수 + 나머지이므로 ${q} × ${div} + ${r} = ${total}입니다 (나머지 ${r} < ${div}).`,
            ms: `Nombor yang dibahagi = Hasil bahagi × Pembahagi + Baki = ${q} × ${div} + ${r} = ${total}.`,
          },
          scaffolds: [
            {
              promptZh: `先算整分出去的部分：${q} × ${div} 等于多少？`,
              promptEn: `First multiply ${q} × ${div}:`,
              promptI18n: {
                ja: `まず ${q} × ${div} を計算しなさい：`,
                ko: `먼저 ${q} × ${koP(div, "을", "를")} 계산하시오:`,
                ms: `Mula-mula darabkan ${q} × ${div}:`,
              },
              hintZh: `计算 ${q} 个 ${div} 的积`,
              hintEn: `Multiply ${q} by ${div}`,
              hintI18n: {
                ja: `${q} に ${div} をかける`,
                ko: `${q}에 ${koP(div, "을", "를")} 곱하기`,
                ms: `Darabkan ${q} dengan ${div}`,
              },
              expectedAnswer: `${div * q}`,
            },
            {
              promptZh: `再加上剩余的 ${r}，原数是多少？`,
              promptEn: `Now add the remainder ${r}:`,
              promptI18n: {
                ja: `次に余りの ${r} を加えなさい：`,
                ko: `이제 나머지 ${koP(r, "을", "를")} 더하시오:`,
                ms: `Sekarang tambahkan baki ${r}:`,
              },
              hintZh: `${div * q} + ${r}`,
              hintEn: `${div * q} + ${r}`,
              expectedAnswer: `${total}`,
            },
          ],
          distractors: [
            { text: `${div * q - r}`, misconceptionTag: "misc_order_left_to_right" },
            { text: `${wrongR}` },
            { text: `${div * q}` },
          ],
          misconceptionsByValue: { [`${div * q - r}`]: "misc_order_left_to_right" },
        };
      } else if (dTier === "standard") {
        const b = rng.int(4, 8);
        const c = rng.int(4, 7);
        const a = b * c + rng.int(12, 35);
        const d = rng.int(5, 18);
        const ans = a - b * c + d;
        const trap = (a - b) * c + d;
        const subGroupTrap = a - (b * c + d);
        core = {
          promptZh: `计算四则混合算式的值：${a} - ${b} × ${c} + ${d} = ?`,
          promptEn: `Evaluate using order of operations: ${a} - ${b} × ${c} + ${d} = ?`,
          promptI18n: {
            ja: `計算の順序に従って計算しなさい：${a} - ${b} × ${c} + ${d} = ?`,
            ko: `연산 순서에 따라 계산하시오: ${a} - ${b} × ${c} + ${d} = ?`,
            ms: `Nilaikan mengikut tertib operasi: ${a} - ${b} × ${c} + ${d} = ?`,
          },
          answer: `${ans}`,
          explanationZh: `先算乘法 ${b} × ${c} = ${b * c}，再从左往右依次算加减：${a} - ${b * c} + ${d} = ${ans}（切勿先算 ${a} - ${b} 误得 ${trap}）。`,
          explanationEn: `Multiply first: ${b} × ${c} = ${b * c}, then work left-to-right: ${a} - ${b * c} + ${d} = ${ans}.`,
          explanationI18n: {
            ja: `かけ算を先に計算します：${b} × ${c} = ${b * c}、次に左から順に ${a} - ${b * c} + ${d} = ${ans} となります。`,
            ko: `곱셈을 먼저 계산합니다: ${b} × ${c} = ${b * c}, 그다음 왼쪽부터 차례대로 ${a} - ${b * c} + ${d} = ${ans}입니다.`,
            ms: `Darab dahulu: ${b} × ${c} = ${b * c}, kemudian kira dari kiri ke kanan: ${a} - ${b * c} + ${d} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `先算乘法部分：${b} × ${c} 等于多少？`,
              promptEn: `Evaluate ${b} × ${c} first:`,
              promptI18n: {
                ja: `まず ${b} × ${c} を計算しなさい：`,
                ko: `먼저 ${b} × ${koP(c, "을", "를")} 계산하시오:`,
                ms: `Nilaikan ${b} × ${c} dahulu:`,
              },
              hintZh: `先乘除后加减`,
              hintEn: `Multiply first`,
              hintI18n: { ja: `かけ算が先`, ko: `곱셈 먼저`, ms: `Darab dahulu` },
              expectedAnswer: `${b * c}`,
            },
            {
              promptZh: `再从左往右计算 ${a} - ${b * c} + ${d}：`,
              promptEn: `Now compute ${a} - ${b * c} + ${d} from left to right:`,
              promptI18n: {
                ja: `左から順に ${a} - ${b * c} + ${d} を計算しなさい：`,
                ko: `왼쪽부터 차례대로 ${a} - ${b * c} + ${koP(d, "을", "를")} 계산하시오:`,
                ms: `Sekarang kira ${a} - ${b * c} + ${d} dari kiri ke kanan:`,
              },
              hintZh: `${a - b * c} + ${d}`,
              hintEn: `${a - b * c} + ${d}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${trap}`, misconceptionTag: "misc_order_left_to_right" },
            { text: `${subGroupTrap}`, misconceptionTag: "misc_order_left_to_right" },
            { text: `${a - (b + c) + d}` },
          ],
          misconceptionsByValue: {
            [`${trap}`]: "misc_order_left_to_right",
            [`${subGroupTrap}`]: "misc_order_left_to_right",
          },
        };
      } else {
        const a = rng.int(12, 32);
        const b = rng.int(4, 9);
        const c = rng.int(3, 7);
        const ans = a + b * c;
        const trap = (a + b) * c;
        core = {
          promptZh: `计算四则混合算式的值：${a} + ${b} × ${c} = ?`,
          promptEn: `Evaluate using order of operations: ${a} + ${b} × ${c} = ?`,
          promptI18n: {
            ja: `計算の順序に従って計算しなさい：${a} + ${b} × ${c} = ?`,
            ko: `연산 순서에 따라 계산하시오: ${a} + ${b} × ${c} = ?`,
            ms: `Nilaikan mengikut tertib operasi: ${a} + ${b} × ${c} = ?`,
          },
          answer: `${ans}`,
          explanationZh: `遵循先乘除后加减：先算 ${b} × ${c} = ${b * c}，再算 ${a} + ${b * c} = ${ans}。若直接从左往右算会误得 ${trap}。`,
          explanationEn: `Multiply before adding: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${ans}.`,
          explanationI18n: {
            ja: `たし算よりかけ算を先に計算します：${b} × ${c} = ${b * c}、次に ${a} + ${b * c} = ${ans} です。`,
            ko: `덧셈보다 곱셈을 먼저 계산합니다: ${b} × ${c} = ${b * c}, 그다음 ${a} + ${b * c} = ${ans}입니다.`,
            ms: `Darab dahulu sebelum tambah: ${b} × ${c} = ${b * c}, kemudian ${a} + ${b * c} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `加号和乘号同时出现，应先算哪一步的结果？写出 ${b} × ${c} 的值。`,
              promptEn: `Evaluate ${b} × ${c} first:`,
              promptI18n: {
                ja: `まず ${b} × ${c} を計算しなさい：`,
                ko: `먼저 ${b} × ${koP(c, "을", "를")} 계산하시오:`,
                ms: `Nilaikan ${b} × ${c} dahulu:`,
              },
              hintZh: `先乘后加`,
              hintEn: `Multiply first`,
              hintI18n: { ja: `かけ算が先`, ko: `곱셈 먼저`, ms: `Darab dahulu` },
              expectedAnswer: `${b * c}`,
            },
            {
              promptZh: `把 ${a} 与刚才的积相加，最终答案是？`,
              promptEn: `Add ${a} to that product:`,
              promptI18n: {
                ja: `その積に ${a} を加えなさい：`,
                ko: `그 곱에 ${koP(a, "을", "를")} 더하시오:`,
                ms: `Tambahkan ${a} kepada hasil darab itu:`,
              },
              hintZh: `${a} + ${b * c}`,
              hintEn: `${a} + ${b * c}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${trap}`, misconceptionTag: "misc_order_left_to_right" },
            { text: `${a + b + c}` },
            { text: `${ans + b}` },
          ],
          misconceptionsByValue: { [`${trap}`]: "misc_order_left_to_right" },
        };
      }
      break;
    }

    // 2. Fraction equivalence
    case "math_frac_equiv": {
      if (dTier === "challenge") {
        const pairs = [
          [2, 3],
          [3, 4],
          [2, 5],
          [3, 5],
          [4, 7],
          [5, 6],
          [5, 8],
        ] as const;
        const [p, q] = rng.pick(pairs);
        const k = rng.pick([6, 8, 9, 12, 14, 15]);
        const numBig = p * k;
        const denBig = q * k;
        const ans = `${p}/${q}`;
        const additiveTrap = formatFrac(p + 1, q + 1);
        const flipTrap = `${q}/${p}`;
        core = {
          promptZh: `利用最大公因数将分数 ${numBig}/${denBig} 约分为最简分数（格式 a/b）：`,
          promptEn: `Simplify the fraction ${numBig}/${denBig} to lowest terms (simplest fraction a/b):`,
          promptI18n: {
            ja: `最大公約数を使って、分数 ${numBig}/${denBig} を既約分数 a/b に約分しなさい：`,
            ko: `최대공약수를 이용하여 분수 ${numBig}/${denBig}을 기약분수 a/b로 약분하시오:`,
            ms: `Permudahkan pecahan ${numBig}/${denBig} kepada sebutan terendah (pecahan termudah a/b):`,
          },
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `${numBig} 与 ${denBig} 的最大公因数是 ${k}，分子分母同时除以 ${k} 得最简分数 ${ans}。`,
          explanationEn: `The GCD of ${numBig} and ${denBig} is ${k}. Dividing numerator and denominator by ${k} gives ${ans}.`,
          explanationI18n: {
            ja: `${numBig} と ${denBig} の最大公約数は ${k} です。分子と分母を ${k} でわると、既約分数 ${ans} になります。`,
            ko: `${koP(numBig, "과", "와")} ${denBig}의 최대공약수는 ${k}입니다. 분자와 분모를 ${koP(k, "으로", "로")} 나누면 기약분수 ${ans}입니다.`,
            ms: `FSTB bagi ${numBig} dan ${denBig} ialah ${k}. Membahagikan pengangka dan penyebut dengan ${k} menghasilkan ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `分子 ${numBig} 和分母 ${denBig} 的最大公因数是多少？`,
              promptEn: `Find the GCD of ${numBig} and ${denBig}:`,
              promptI18n: {
                ja: `${numBig} と ${denBig} の最大公約数を求めなさい：`,
                ko: `${koP(numBig, "과", "와")} ${denBig}의 최대공약수를 구하시오:`,
                ms: `Cari FSTB bagi ${numBig} dan ${denBig}:`,
              },
              hintZh: `能同时整除 ${numBig} 和 ${denBig} 的最大整数`,
              hintEn: `Largest integer dividing both ${numBig} and ${denBig}`,
              hintI18n: {
                ja: `両方をわり切れる最大の整数`,
                ko: `두 수를 동시에 나누어떨어지게 하는 가장 큰 자연수`,
                ms: `Integer terbesar yang membahagi tepat kedua-duanya`,
              },
              expectedAnswer: `${k}`,
            },
            {
              promptZh: `将分子分母同除以 ${k}，写出最简分数 a/b：`,
              promptEn: `Divide both by ${k} and write as simplest fraction a/b:`,
              promptI18n: {
                ja: `分子と分母を ${k} でわって既約分数 a/b を書きなさい：`,
                ko: `분자와 분모를 ${koP(k, "으로", "로")} 나누어 기약분수 a/b를 쓰시오:`,
                ms: `Bahagikan kedua-duanya dengan ${k} dan tulis pecahan termudah a/b:`,
              },
              hintZh: `(${numBig}÷${k}) / (${denBig}÷${k})`,
              hintEn: `(${numBig}÷${k}) / (${denBig}÷${k})`,
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: additiveTrap, misconceptionTag: "misc_frac_add_const" },
            { text: flipTrap },
            { text: formatFrac(p, q + p) },
          ],
          misconceptionsByValue: { [additiveTrap]: "misc_frac_add_const" },
        };
      } else {
        const pairs = [
          [2, 3],
          [3, 4],
          [3, 5],
          [4, 7],
          [5, 6],
        ] as const;
        const [p, q] = rng.pick(pairs);
        const k = dTier === "standard" ? rng.int(5, 9) : rng.int(2, 5);
        const targetDen = q * k;
        const ansNum = p * k;
        const additiveTrap = p + (targetDen - q);
        core = {
          promptZh: `根据分数基本性质填空：${p}/${q} = ( ? ) / ${targetDen}，括号里的分子应填多少？`,
          promptEn: `Find the missing numerator for equivalent fractions: ${p}/${q} = ( ? ) / ${targetDen}`,
          promptI18n: {
            ja: `大きさの等しい分数になるように、分子にあてはまる数を求めなさい：${p}/${q} = ( ? ) / ${targetDen}`,
            ko: `크기가 같은 분수가 되도록 분자에 알맞은 수를 구하시오: ${p}/${q} = ( ? ) / ${targetDen}`,
            ms: `Cari pengangka yang tertinggal bagi pecahan setara: ${p}/${q} = ( ? ) / ${targetDen}`,
          },
          answer: `${ansNum}`,
          explanationZh: `分母从 ${q} 变为 ${targetDen} 乘了 ${k} 倍，分子 ${p} 也必须同乘 ${k} 得 ${ansNum}（不能同加 ${targetDen - q} 误算成 ${additiveTrap}）。`,
          explanationEn: `Since the denominator is multiplied by ${k} (${q} × ${k} = ${targetDen}), multiply the numerator by ${k}: ${p} × ${k} = ${ansNum}.`,
          explanationI18n: {
            ja: `分母に ${k} をかけている（${q} × ${k} = ${targetDen}）ので、分子にも ${k} をかけて ${p} × ${k} = ${ansNum} となります。`,
            ko: `분모에 ${koP(k, "을", "를")} 곱했으므로 (${q} × ${k} = ${targetDen}), 분자에도 ${koP(k, "을", "를")} 곱합니다: ${p} × ${k} = ${ansNum}입니다.`,
            ms: `Oleh sebab penyebut didarab dengan ${k} (${q} × ${k} = ${targetDen}), darabkan pengangka dengan ${k}: ${p} × ${k} = ${ansNum}.`,
          },
          scaffolds: [
            {
              promptZh: `分母从 ${q} 扩大到 ${targetDen}，乘了多少倍？`,
              promptEn: `By what factor did ${q} scale to ${targetDen}?`,
              promptI18n: {
                ja: `${q} は何倍されて ${targetDen} になりましたか？`,
                ko: `${q}에 몇을 곱하면 ${koP(targetDen, "이", "가")} 됩니까?`,
                ms: `${q} didarab dengan faktor berapa untuk menjadi ${targetDen}?`,
              },
              hintZh: `${targetDen} ÷ ${q}`,
              hintEn: `${targetDen} ÷ ${q}`,
              expectedAnswer: `${k}`,
            },
            {
              promptZh: `分子 ${p} 同步乘以 ${k} 等于多少？`,
              promptEn: `Multiply numerator ${p} by ${k}:`,
              promptI18n: {
                ja: `分子 ${p} に ${k} をかけなさい：`,
                ko: `분자 ${p}에 ${koP(k, "을", "를")} 곱하시오:`,
                ms: `Darabkan pengangka ${p} dengan ${k}:`,
              },
              hintZh: `${p} × ${k}`,
              hintEn: `${p} × ${k}`,
              expectedAnswer: `${ansNum}`,
            },
          ],
          distractors: [
            { text: `${additiveTrap}`, misconceptionTag: "misc_frac_add_const" },
            { text: `${p}` },
            { text: `${targetDen + p}` },
          ],
          misconceptionsByValue: { [`${additiveTrap}`]: "misc_frac_add_const" },
        };
      }
      break;
    }

    // 3. Fraction add/sub
    case "math_frac_add_sub": {
      if (dTier === "challenge") {
        const triples = [
          [3, 4, 1, 6, 1, 3],
          [2, 3, 5, 8, 1, 4],
          [5, 6, 2, 9, 1, 3],
          [3, 5, 3, 4, 1, 2],
          [5, 6, 3, 10, 1, 5],
          [7, 12, 3, 8, 1, 6],
          [5, 6, 1, 4, 1, 3],
        ] as const;
        const [n1, d1, n2, d2, n3, d3] = rng.pick(triples);
        const lcd12 = (d1 * d2) / gcd(d1, d2);
        const lcd = (lcd12 * d3) / gcd(lcd12, d3);
        const k1 = lcd / d1;
        const k2 = lcd / d2;
        const k3 = lcd / d3;
        const numAns = n1 * k1 + n2 * k2 - n3 * k3;
        const ans = formatFrac(numAns, lcd);
        const wrongAddDenom = formatFrac(n1 + n2 - n3, d1 + d2 - d3);
        const wrongSignAdd = formatFrac(n1 * k1 + n2 * k2 + n3 * k3, lcd);
        const wrongNoScale = formatFrac(n1 + n2 - n3, lcd);
        core = {
          promptZh: `计算异分母分数加减混合运算（结果化为最简分数 a/b）：${n1}/${d1} + ${n2}/${d2} - ${n3}/${d3} = ?`,
          promptEn: `Evaluate and simplify to lowest terms (a/b): ${n1}/${d1} + ${n2}/${d2} - ${n3}/${d3} = ?`,
          promptI18n: {
            ja: `次の計算をし、既約分数 a/b で答えなさい：${n1}/${d1} + ${n2}/${d2} - ${n3}/${d3} = ?`,
            ko: `다음을 계산하여 기약분수 a/b로 나타내시오: ${n1}/${d1} + ${n2}/${d2} - ${n3}/${d3} = ?`,
            ms: `Nilaikan dan permudahkan kepada pecahan termudah a/b: ${n1}/${d1} + ${n2}/${d2} - ${n3}/${d3} = ?`,
          },
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `三个分母 ${d1}、${d2}、${d3} 的最小公分母为 ${lcd}：通分得 (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} = ${numAns}/${lcd}，约分后最简结果为 ${ans}。`,
          explanationEn: `Using the LCD ${lcd}, rewrite as (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} = ${numAns}/${lcd}, which simplifies to ${ans}.`,
          explanationI18n: {
            ja: `分母 ${d1}, ${d2}, ${d3} の最小公倍数 ${lcd} で通分すると (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} = ${numAns}/${lcd} となり、約分して ${ans} です。`,
            ko: `세 분모 ${d1}, ${d2}, ${d3}의 최소공배수 ${koP(lcd, "으로", "로")} 통분하면 (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} = ${numAns}/${lcd}이고, 기약분수로 나타내면 ${ans}입니다.`,
            ms: `Dengan penyebut sepunya terkecil ${lcd}, tukarkan kepada (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} = ${numAns}/${lcd}, dan permudahkan kepada ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `分母 ${d1}、${d2}、${d3} 的最小公倍数是多少？`,
              promptEn: `Find the LCM of ${d1}, ${d2}, and ${d3}:`,
              promptI18n: {
                ja: `${d1}, ${d2}, ${d3} の最小公倍数を求めなさい：`,
                ko: `${d1}, ${d2}, ${d3}의 최소공배수를 구하시오:`,
                ms: `Cari GSTK bagi ${d1}, ${d2}, dan ${d3}:`,
              },
              hintZh: `同时是 ${d1}、${d2}、${d3} 倍数的最小正整数`,
              hintEn: `Least common multiple of ${d1}, ${d2}, ${d3}`,
              hintI18n: { ja: `最小公倍数`, ko: `최소공배수`, ms: `Gandaan sepunya terkecil` },
              expectedAnswer: `${lcd}`,
            },
            {
              promptZh: `通分后计算 (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} 并化为最简分数：`,
              promptEn: `Compute (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} in simplest form:`,
              promptI18n: {
                ja: `(${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} を計算し、既約分数で答えなさい：`,
                ko: `(${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd}을 계산하여 기약분수로 나타내시오:`,
                ms: `Hitung (${n1 * k1} + ${n2 * k2} - ${n3 * k3})/${lcd} dalam bentuk pecahan termudah:`,
              },
              hintZh: `格式如 a/b`,
              hintEn: `Write as a/b`,
              hintI18n: { ja: `a/b の形で書く`, ko: `a/b 꼴로 쓰기`, ms: `Tulis sebagai a/b` },
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: wrongAddDenom, misconceptionTag: "misc_frac_add_denom" },
            { text: wrongSignAdd },
            { text: wrongNoScale },
          ],
          misconceptionsByValue: { [wrongAddDenom]: "misc_frac_add_denom" },
        };
      } else {
        const basicPairs = [
          [1, 2, 1, 3],
          [1, 3, 1, 4],
          [2, 5, 1, 2],
          [1, 4, 3, 8],
          [2, 3, 1, 5],
        ] as const;
        const stdPairs = [
          [3, 4, 1, 6],
          [3, 8, 5, 12],
          [5, 6, 1, 4],
          [2, 3, 3, 4],
          [3, 5, 3, 10],
          [5, 8, 1, 6],
        ] as const;
        const [n1, d1, n2, d2] = dTier === "standard" ? rng.pick(stdPairs) : rng.pick(basicPairs);
        const num = n1 * d2 + n2 * d1;
        const den = d1 * d2;
        const ans = formatFrac(num, den);
        const wrongAddDenom = formatFrac(n1 + n2, d1 + d2);
        const lcd = (d1 * d2) / gcd(d1, d2);
        core = {
          promptZh: `计算异分母分数加法（结果化为最简分数 a/b）：${n1}/${d1} + ${n2}/${d2} = ?`,
          promptEn: `Evaluate and simplify to lowest terms (a/b): ${n1}/${d1} + ${n2}/${d2} = ?`,
          promptI18n: {
            ja: `次の計算をし、既約分数 a/b で答えなさい：${n1}/${d1} + ${n2}/${d2} = ?`,
            ko: `다음을 계산하여 기약분수 a/b로 나타내시오: ${n1}/${d1} + ${n2}/${d2} = ?`,
            ms: `Nilaikan dan permudahkan kepada sebutan terendah (a/b): ${n1}/${d1} + ${n2}/${d2} = ?`,
          },
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `公分母为 ${lcd}：通分后分子相加，最简结果为 ${ans}。切忌将分子分母分别相加写成 ${wrongAddDenom}！`,
          explanationEn: `Using common denominator ${lcd}, convert both fractions and add numerators to get ${ans}.`,
          explanationI18n: {
            ja: `分母を ${lcd} にそろえて通分し、分子どうしをたすと ${ans} になります。`,
            ko: `공통분모 ${koP(lcd, "으로", "로")} 통분한 뒤 분자끼리 더하면 ${ans}입니다.`,
            ms: `Dengan penyebut sepunya ${lcd}, tukarkan kedua-dua pecahan dan tambahkan pengangka untuk mendapat ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `分母 ${d1} 和 ${d2} 的最小公倍数是多少？`,
              promptEn: `Find the LCM of ${d1} and ${d2}:`,
              promptI18n: {
                ja: `${d1} と ${d2} の最小公倍数を求めなさい：`,
                ko: `${koP(d1, "과", "와")} ${d2}의 최소공배수를 구하시오:`,
                ms: `Cari GSTK bagi ${d1} dan ${d2}:`,
              },
              hintZh: `找最小公分母`,
              hintEn: `Least common multiple`,
              hintI18n: { ja: `最小公倍数`, ko: `최소공배수`, ms: `Gandaan sepunya terkecil` },
              expectedAnswer: `${lcd}`,
            },
            {
              promptZh: `通分后两分子相加，写出最简分数结果：`,
              promptEn: `Add the converted fractions in simplest form:`,
              promptI18n: {
                ja: `通分した分数をたし、既約分数で答えなさい：`,
                ko: `통분한 분수를 더하여 기약분수로 나타내시오:`,
                ms: `Tambahkan pecahan yang telah ditukar dalam bentuk termudah:`,
              },
              hintZh: `格式如 a/b`,
              hintEn: `Write as a/b`,
              hintI18n: { ja: `a/b の形で書く`, ko: `a/b 꼴로 쓰기`, ms: `Tulis sebagai a/b` },
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: wrongAddDenom, misconceptionTag: "misc_frac_add_denom" },
            { text: formatFrac(n1 + n2, lcd) },
            { text: formatFrac(num + gcd(d1, d2), den) },
          ],
          misconceptionsByValue: { [wrongAddDenom]: "misc_frac_add_denom" },
        };
      }
      break;
    }

    // 4. Fraction mul/div
    case "math_frac_mul_div": {
      if (dTier === "challenge") {
        const chains = [
          [3, 4, 9, 10, 2, 5],
          [2, 5, 4, 15, 3, 8],
          [5, 6, 5, 9, 4, 7],
          [4, 7, 8, 21, 5, 6],
          [3, 8, 9, 16, 4, 5],
          [7, 10, 14, 15, 2, 3],
          [5, 12, 15, 16, 9, 10],
        ] as const;
        const [a, b, c, d, e, f] = rng.pick(chains);
        const ans = formatFrac(a * d * e, b * c * f);
        const wrongNoFlip = formatFrac(a * c * e, b * d * f);
        const wrongFlipMultToo = formatFrac(a * d * f, b * c * e);
        const wrongRecip = formatFrac(b * c * f, a * d * e);
        core = {
          promptZh: `计算分数乘除混合算式并化为最简分数：(${a}/${b}) ÷ (${c}/${d}) × (${e}/${f}) = ?`,
          promptEn: `Evaluate and simplify to lowest terms: (${a}/${b}) ÷ (${c}/${d}) × (${e}/${f}) = ?`,
          promptI18n: {
            ja: `次の計算をし、既約分数で答えなさい：(${a}/${b}) ÷ (${c}/${d}) × (${e}/${f}) = ?`,
            ko: `다음을 계산하여 기약분수로 나타내시오: (${a}/${b}) ÷ (${c}/${d}) × (${e}/${f}) = ?`,
            ms: `Nilaikan dan permudahkan kepada sebutan terendah: (${a}/${b}) ÷ (${c}/${d}) × (${e}/${f}) = ?`,
          },
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `只把除号后面的除数 ${c}/${d} 翻转为倒数 ${d}/${c}，乘数 ${e}/${f} 保持不变：(${a}/${b}) × (${d}/${c}) × (${e}/${f}) = ${ans}。`,
          explanationEn: `Invert ONLY the divisor ${c}/${d} to ${d}/${c} (keep ${e}/${f} unchanged): (${a}/${b}) × (${d}/${c}) × (${e}/${f}) = ${ans}.`,
          explanationI18n: {
            ja: `わる数 ${c}/${d} だけを逆数 ${d}/${c} にします（かける数 ${e}/${f} はそのまま）：(${a}/${b}) × (${d}/${c}) × (${e}/${f}) = ${ans} です。`,
            ko: `나누는 수 ${c}/${d}만 역수 ${d}/${c}로 바꾸고 곱하는 수 ${e}/${f}는 그대로 둡니다: (${a}/${b}) × (${d}/${c}) × (${e}/${f}) = ${ans}입니다.`,
            ms: `Songsangkan pembahagi ${c}/${d} sahaja kepada ${d}/${c} (biarkan ${e}/${f} kekal): (${a}/${b}) × (${d}/${c}) × (${e}/${f}) = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `先把 (${a}/${b}) ÷ (${c}/${d}) 化简为最简分数：`,
              promptEn: `First compute (${a}/${b}) ÷ (${c}/${d}) in simplest form:`,
              promptI18n: {
                ja: `まず (${a}/${b}) ÷ (${c}/${d}) を既約分数で求めなさい：`,
                ko: `먼저 (${a}/${b}) ÷ (${c}/${d})의 값을 기약분수로 구하시오:`,
                ms: `Mula-mula hitung (${a}/${b}) ÷ (${c}/${d}) dalam bentuk termudah:`,
              },
              hintZh: `(${a}/${b}) × (${d}/${c})`,
              hintEn: `(${a}/${b}) × (${d}/${c})`,
              expectedAnswer: formatFrac(a * d, b * c),
            },
            {
              promptZh: `再乘以 ${e}/${f} 并约分为最简分数：`,
              promptEn: `Now multiply by ${e}/${f} and simplify:`,
              promptI18n: {
                ja: `次に ${e}/${f} をかけて約分しなさい：`,
                ko: `이제 분수 ${e}/${f}를 곱하고 약분하시오:`,
                ms: `Sekarang darabkan dengan ${e}/${f} dan permudahkan:`,
              },
              hintZh: `交叉约分后相乘`,
              hintEn: `Cross-cancel and multiply`,
              hintI18n: { ja: `約分してからかける`, ko: `약분한 뒤 곱하기`, ms: `Permudah silang dan darab` },
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: wrongNoFlip, misconceptionTag: "misc_flip_dividend" },
            { text: wrongFlipMultToo, misconceptionTag: "misc_flip_dividend" },
            { text: wrongRecip, misconceptionTag: "misc_flip_dividend" },
          ],
          misconceptionsByValue: {
            [wrongNoFlip]: "misc_flip_dividend",
            [wrongFlipMultToo]: "misc_flip_dividend",
            [wrongRecip]: "misc_flip_dividend",
          },
        };
      } else {
        let a: number;
        let b: number;
        let c: number;
        let d: number;
        if (dTier === "standard") {
          const stdTuples = [
            [3, 8, 9, 16],
            [4, 9, 8, 15],
            [5, 12, 10, 21],
            [2, 9, 4, 15],
            [3, 10, 9, 25],
            [7, 12, 14, 15],
            [5, 8, 15, 16],
          ] as const;
          [a, b, c, d] = rng.pick(stdTuples);
        } else {
          const firstPairs = [
            [1, 3],
            [2, 5],
            [3, 7],
            [2, 7],
            [4, 9],
          ] as const;
          [a, b] = rng.pick(firstPairs);
          const secondPairs = (
            [
              [2, 3],
              [3, 4],
              [2, 5],
              [3, 8],
              [4, 5],
            ] as const
          ).filter(([x, y]) => a * y !== b * x);
          [c, d] = rng.pick(secondPairs);
        }
        // Compute (a/b) ÷ (c/d) = (a*d)/(b*c) with guaranteed coprime proper inputs & distinct reduced distractors
        const ans = formatFrac(a * d, b * c);
        const wrongFlipDividend = formatFrac(b * c, a * d);
        const wrongNoFlip = formatFrac(a * c, b * d);
        const wrongFlipBoth = formatFrac(b * d, a * c);
        const recipDivisor = formatFrac(d, c);
        core = {
          promptZh: `计算分数除法并化为最简分数：(${a}/${b}) ÷ (${c}/${d}) = ?`,
          promptEn: `Divide and simplify to lowest terms: (${a}/${b}) ÷ (${c}/${d}) = ?`,
          promptI18n: {
            ja: `次のわり算をし、既約分数で答えなさい：(${a}/${b}) ÷ (${c}/${d}) = ?`,
            ko: `다음 나눗셈을 계산하여 기약분수로 나타내시오: (${a}/${b}) ÷ (${c}/${d}) = ?`,
            ms: `Bahagikan dan permudahkan kepada sebutan terendah: (${a}/${b}) ÷ (${c}/${d}) = ?`,
          },
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `除以一个非零分数等于乘它的倒数：(${a}/${b}) × (${d}/${c}) = ${ans}。注意保持被除数 ${a}/${b} 不变，只翻转除数 ${c}/${d}！`,
          explanationEn: `Multiply by the reciprocal of the divisor: (${a}/${b}) × (${d}/${c}) = ${ans}.`,
          explanationI18n: {
            ja: `わる数の逆数をかけます：(${a}/${b}) × (${d}/${c}) = ${ans} です。`,
            ko: `나누는 수의 역수를 곱합니다: (${a}/${b}) × (${d}/${c}) = ${ans}입니다.`,
            ms: `Darabkan dengan salingan pembahagi: (${a}/${b}) × (${d}/${c}) = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `除数 ${c}/${d} 的倒数是多少？`,
              promptEn: `What is the reciprocal of ${c}/${d}?`,
              promptI18n: {
                ja: `${c}/${d} の逆数は何ですか？`,
                ko: `분수 ${c}/${d}의 역수는 무엇입니까?`,
                ms: `Apakah salingan bagi ${c}/${d}?`,
              },
              hintZh: `交换分子与分母`,
              hintEn: `Flip numerator and denominator`,
              hintI18n: {
                ja: `分子と分母を入れかえる`,
                ko: `분자와 분모를 바꾸기`,
                ms: `Tukar kedudukan pengangka dan penyebut`,
              },
              expectedAnswer: recipDivisor,
            },
            {
              promptZh: `计算 (${a}/${b}) × (${d}/${c}) 并约分为最简分数：`,
              promptEn: `Multiply (${a}/${b}) × (${d}/${c}) and simplify:`,
              promptI18n: {
                ja: `(${a}/${b}) × (${d}/${c}) を計算し、約分しなさい：`,
                ko: `식 (${a}/${b}) × (${d}/${c})의 값을 계산하고 약분하시오:`,
                ms: `Darabkan (${a}/${b}) × (${d}/${c}) dan permudahkan:`,
              },
              hintZh: `分子乘分子，分母乘分母后约分`,
              hintEn: `Multiply across and reduce`,
              hintI18n: {
                ja: `分子どうし・分母どうしをかけて約分する`,
                ko: `분자끼리, 분모끼리 곱한 뒤 약분하기`,
                ms: `Darab pengangka dengan pengangka, penyebut dengan penyebut, kemudian permudahkan`,
              },
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: wrongFlipDividend, misconceptionTag: "misc_flip_dividend" },
            { text: wrongNoFlip, misconceptionTag: "misc_flip_dividend" },
            { text: wrongFlipBoth, misconceptionTag: "misc_flip_dividend" },
          ],
          misconceptionsByValue: {
            [wrongFlipDividend]: "misc_flip_dividend",
            [wrongNoFlip]: "misc_flip_dividend",
            [wrongFlipBoth]: "misc_flip_dividend",
          },
        };
      }
      break;
    }

    // 5. Ratio, percentage & Singapore Bar Model
    case "math_ratio_percent": {
      if (dTier === "challenge") {
        const orig = rng.pick([100, 200, 300, 400, 500]);
        const pctPairs = [
          [20, 20],
          [20, 25],
          [30, 20],
          [40, 20],
          [50, 20],
          [40, 25],
          [50, 40],
          [30, 30],
        ] as const;
        const [p, q] = rng.pick(pctPairs);
        const mid = (orig * (100 + p)) / 100;
        const ans = (mid * (100 - q)) / 100;
        const naiveTrap = (orig * (100 + p - q)) / 100;
        const addBothTrap = mid + (orig * q) / 100;
        core = {
          promptZh: `【百分率连续变化】一套实验器材原价为 ${cur}${orig} ，先提价 ${p}%，随后在提价后的新价格基础上优惠降价 ${q}%。最终售价是多少（无需填货币符号）？`,
          promptEn: `[Successive Percent Change] A lab kit originally costs ${cur}${orig}. Its price is first increased by ${p}%, and then discounted by ${q}% off the new price. What is the final price (enter number only, omit currency symbol)?`,
          promptI18n: {
            ja: `【割合の連続変化】実験キットの元の価格は ${cur}${orig} です。まず ${p}% 値上げし、その後、値上げ後の価格から ${q}% 値引きしました。最終的な価格はいくらですか（通貨記号は不要、数値のみ入力）？`,
            ko: `[연속 백분율 변화] 실험 키트의 원래 가격은 ${cur}${orig} 입니다. 먼저 가격을 ${p}% 인상한 뒤, 인상된 가격에서 다시 ${q}% 할인했습니다. 최종 가격은 얼마입니까 (통화 기호 없이 숫자만 입력)?`,
            ms: `[Perubahan Peratus Berturut-turut] Satu kit makmal asalnya berharga ${cur}${orig}. Harganya dinaikkan sebanyak ${p}% dahulu, kemudian diberi diskaun ${q}% daripada harga baharu itu. Berapakah harga akhir (masukkan nombor sahaja, tanpa simbol mata wang)?`,
          },
          answer: `${ans}`,
          explanationZh: `第一步提价后变为 ${orig} × (1 + ${p}%) = ${mid}；第二步降价以 ${mid} 为新基准量：${mid} × (1 - ${q}%) = ${cur}${ans}（切勿把两次百分率直接相减误算成 ${naiveTrap}）。`,
          explanationEn: `After +${p}%, the new base is ${orig} × ${1 + p / 100} = ${mid}. Then -${q}% off ${mid} gives ${mid} × ${(100 - q) / 100} = ${ans} (not ${naiveTrap}).`,
          explanationI18n: {
            ja: `${p}% 値上げ後の価格は ${mid} になります。次は ${mid} をもとにする量として ${q}% 引きするので、${mid} × ${(100 - q) / 100} = ${ans} です（単純に割合を引いた ${naiveTrap} ではありません）。`,
            ko: `${p}% 인상 후 가격은 ${mid}입니다. 그다음 ${koP(mid, "을", "를")} 새로운 기준량으로 하여 ${q}% 할인하므로 ${mid} × ${(100 - q) / 100} = ${ans}입니다 (단순히 백분율끼리 뺀 ${koP(naiveTrap, "이", "가")} 아닙니다).`,
            ms: `Selepas kenaikan ${p}%, harga baharu ialah ${mid}. Diskaun ${q}% dikira daripada asas baharu ${mid}, maka ${mid} × ${(100 - q) / 100} = ${ans} (bukan ${naiveTrap}).`,
          },
          scaffolds: [
            {
              promptZh: `原价 ${orig} 提价 ${p}% 后的新价格是多少？`,
              promptEn: `Find the intermediate price after increasing ${orig} by ${p}%:`,
              promptI18n: {
                ja: `元の価格 ${orig} を ${p}% 値上げした後の価格を求めなさい：`,
                ko: `원래 가격 ${orig}에서 ${p}% 인상한 후의 가격을 구하시오:`,
                ms: `Cari harga pertengahan selepas ${orig} dinaikkan sebanyak ${p}%:`,
              },
              hintZh: `${orig} × (100 + ${p}) ÷ 100`,
              hintEn: `${orig} × ${(100 + p) / 100}`,
              expectedAnswer: `${mid}`,
            },
            {
              promptZh: `以 ${mid} 为基准再降价 ${q}%，最终售价是多少？`,
              promptEn: `Discount ${mid} by ${q}% to find the final price:`,
              promptI18n: {
                ja: `${mid} から ${q}% 値引きした最終価格を求めなさい：`,
                ko: `${mid}에서 ${q}% 할인한 최종 가격을 구하시오:`,
                ms: `Berikan diskaun ${q}% ke atas ${mid} untuk mencari harga akhir:`,
              },
              hintZh: `${mid} × (100 - ${q}) ÷ 100`,
              hintEn: `${mid} × ${(100 - q) / 100}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${naiveTrap}`, misconceptionTag: "misc_percent_wrong_base" },
            { text: `${mid}` },
            { text: `${addBothTrap}` },
          ],
          misconceptionsByValue: { [`${naiveTrap}`]: "misc_percent_wrong_base" },
        };
      } else {
        const ratioPairs = [
          [5, 2],
          [5, 3],
          [7, 2],
          [7, 3],
          [8, 3],
          [8, 5],
          [10, 3],
          [10, 7],
        ] as const;
        const [parts, shaded] = rng.pick(ratioPairs);
        const unitVal = dTier === "standard" ? rng.int(22, 45) : rng.int(10, 20);
        const total = parts * unitVal;
        const ans = shaded * unitVal;
        const remainVal = (parts - shaded) * unitVal;
        core = {
          promptZh: `【条形建模与应用】一套科普绘本原价总额为 ${cur}${total} ，科技馆研学补贴承担了其中的 ${shaded}/${parts}（见条形图）。补贴金额是多少（无需填货币符号）？`,
          promptEn: `[Bar Model & Ratio] A science book set costs ${cur}${total} in total. A STEM grant covers ${shaded}/${parts} of the cost (see bar model). How much does the grant cover (enter number only, omit currency symbol)?`,
          promptI18n: {
            ja: `【テープ図と割合】科学の本のセットは全部で ${cur}${total} です。STEM 助成金がその ${shaded}/${parts} を負担します（テープ図を参照）。助成金はいくらですか（通貨記号は不要、数値のみ入力）？`,
            ko: `[막대 모델과 비] 과학책 세트의 전체 가격은 ${cur}${total} 입니다. STEM 지원금이 그중 분수 ${shaded}/${parts}만큼을 부담합니다(막대 모델 참고). 지원금은 얼마입니까 (통화 기호 없이 숫자만 입력)?`,
            ms: `[Model Bar & Nisbah] Satu set buku sains berharga ${cur}${total} kesemuanya. Geran STEM menanggung ${shaded}/${parts} daripada kos itu (lihat model bar). Berapakah jumlah yang ditanggung oleh geran itu (masukkan nombor sahaja, tanpa simbol mata wang)?`,
          },
          svgDiagram: svgBarModel(parts, shaded, total, cur),
          answer: `${ans}`,
          explanationZh: `将总量 ${cur}${total} 平均分成 ${parts} 份，每 1 份代表 ${total} ÷ ${parts} = ${unitVal}；补贴占 ${shaded} 份，共 ${shaded} × ${unitVal} = ${cur}${ans}。`,
          explanationEn: `1 unit = ${total} ÷ ${parts} = ${unitVal}; ${shaded} units = ${shaded} × ${unitVal} = ${ans}.`,
          explanationI18n: {
            ja: `1 目もり分は ${total} ÷ ${parts} = ${unitVal} なので、${shaded} 目もり分は ${shaded} × ${unitVal} = ${ans} です。`,
            ko: `1칸의 값은 ${total} ÷ ${parts} = ${unitVal}이므로, ${shaded}칸의 값은 ${shaded} × ${unitVal} = ${ans}입니다.`,
            ms: `1 unit = ${total} ÷ ${parts} = ${unitVal}; ${shaded} unit = ${shaded} × ${unitVal} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `条形图平均分成 ${parts} 份等于 ${total}，先求 1 份代表多少？`,
              promptEn: `If ${parts} equal units = ${total}, find 1 unit:`,
              promptI18n: {
                ja: `等しい ${parts} 目もり分が ${total} のとき、1 目もり分を求めなさい：`,
                ko: `똑같은 ${parts}칸이 ${total}일 때, 1칸의 값을 구하시오:`,
                ms: `Jika ${parts} unit yang sama = ${total}, cari nilai 1 unit:`,
              },
              hintZh: `${total} ÷ ${parts}`,
              hintEn: `${total} ÷ ${parts}`,
              expectedAnswer: `${unitVal}`,
            },
            {
              promptZh: `补贴占 ${shaded} 份，金额是多少？`,
              promptEn: `Now find ${shaded} units:`,
              promptI18n: {
                ja: `次に ${shaded} 目もり分を求めなさい：`,
                ko: `이제 ${shaded}칸의 값을 구하시오:`,
                ms: `Sekarang cari nilai ${shaded} unit:`,
              },
              hintZh: `${unitVal} × ${shaded}`,
              hintEn: `${unitVal} × ${shaded}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${remainVal}`, misconceptionTag: "misc_percent_wrong_base" },
            { text: `${Math.round((total * parts) / shaded)}`, misconceptionTag: "misc_percent_wrong_base" },
            { text: `${unitVal}` },
          ],
          misconceptionsByValue: { [`${remainVal}`]: "misc_percent_wrong_base" },
        };
      }
      break;
    }

    // 6. Polygon area & perimeter
    case "math_polygon_area": {
      if (dTier === "challenge") {
        const a = rng.int(4, 9);
        const b = a + rng.int(4, 8);
        const h = rng.pick([4, 6, 8, 10]);
        const area = ((a + b) * h) / 2;
        const forgetHalf = (a + b) * h;
        core = {
          promptZh: `求图中梯形的面积（上底 a = ${a} cm，下底 b = ${b} cm，高 h = ${h} cm），单位 cm²：`,
          promptEn: `Find the area (in cm²) of the trapezoid with bases a = ${a} cm, b = ${b} cm, and height h = ${h} cm:`,
          promptI18n: {
            ja: `上底 a = ${a} cm、下底 b = ${b} cm、高さ h = ${h} cm の台形の面積（cm²）を求めなさい：`,
            ko: `윗변 a = ${a} cm, 아랫변 b = ${b} cm, 높이 h = ${h} cm인 사다리꼴의 넓이(cm²)를 구하시오:`,
            ms: `Cari luas (dalam cm²) trapezium dengan sisi selari a = ${a} cm, b = ${b} cm, dan tinggi h = ${h} cm:`,
          },
          svgDiagram: svgTrapezoidOrTriangle("trapezoid", a, b, h),
          answer: `${area}`,
          unit: "cm²",
          explanationZh: `梯形面积 S = (a + b) × h ÷ 2 = (${a} + ${b}) × ${h} ÷ 2 = ${area} cm²（勿漏除以 2 误得 ${forgetHalf}）。`,
          explanationEn: `Area = (a + b) × h / 2 = (${a} + ${b}) × ${h} / 2 = ${area} cm².`,
          explanationI18n: {
            ja: `台形の面積は (a + b) × h ÷ 2 = (${a} + ${b}) × ${h} ÷ 2 = ${area} cm² です。`,
            ko: `사다리꼴의 넓이는 (a + b) × h ÷ 2 = (${a} + ${b}) × ${h} ÷ 2 = ${area} cm²입니다.`,
            ms: `Luas trapezium = (a + b) × h / 2 = (${a} + ${b}) × ${h} / 2 = ${area} cm².`,
          },
          scaffolds: [
            {
              promptZh: `先算上底加下底之和 ${a} + ${b} = ?`,
              promptEn: `Sum the parallel bases ${a} + ${b}:`,
              promptI18n: {
                ja: `上底と下底の和 ${a} + ${b} を求めなさい：`,
                ko: `윗변과 아랫변의 합 ${a} + ${koP(b, "을", "를")} 구하시오:`,
                ms: `Jumlahkan sisi selari ${a} + ${b}:`,
              },
              hintZh: `上底 + 下底`,
              hintEn: `Add bases`,
              hintI18n: { ja: `上底 + 下底`, ko: `윗변 + 아랫변`, ms: `Tambah sisi selari` },
              expectedAnswer: `${a + b}`,
            },
            {
              promptZh: `乘以高 ${h} 再除以 2，梯形面积是多少？`,
              promptEn: `Multiply by ${h} and divide by 2:`,
              promptI18n: {
                ja: `${h} をかけて 2 でわりなさい：`,
                ko: `${koP(h, "을", "를")} 곱하고 2로 나누시오:`,
                ms: `Darab dengan ${h} dan bahagi dengan 2:`,
              },
              hintZh: `(${a + b} × ${h}) ÷ 2`,
              hintEn: `(${a + b} × ${h}) / 2`,
              expectedAnswer: `${area}`,
            },
          ],
          distractors: [
            { text: `${forgetHalf}`, misconceptionTag: "misc_triangle_forget_half" },
            { text: `${a * h}` },
            { text: `${b * h}` },
          ],
          misconceptionsByValue: { [`${forgetHalf}`]: "misc_triangle_forget_half" },
        };
      } else {
        const b = dTier === "standard" ? rng.pick([12, 14, 16, 18]) : rng.pick([6, 8, 10]);
        const h = dTier === "standard" ? rng.int(7, 15) : rng.int(5, 9);
        const area = (b * h) / 2;
        const forgetHalf = b * h;
        core = {
          promptZh: `如图，三角形的底 b = ${b} cm，对应的高 h = ${h} cm，它的面积是多少 cm²？`,
          promptEn: `Find the area (in cm²) of the triangle with base b = ${b} cm and perpendicular height h = ${h} cm:`,
          promptI18n: {
            ja: `底辺 b = ${b} cm、高さ h = ${h} cm の三角形の面積（cm²）を求めなさい：`,
            ko: `밑변 b = ${b} cm, 높이 h = ${h} cm인 삼각형의 넓이(cm²)를 구하시오:`,
            ms: `Cari luas (dalam cm²) segi tiga dengan tapak b = ${b} cm dan tinggi tegak h = ${h} cm:`,
          },
          svgDiagram: svgTrapezoidOrTriangle("triangle", b, 0, h),
          answer: `${area}`,
          unit: "cm²",
          explanationZh: `三角形是等底等高平行四边形的一半：S = ½ × ${b} × ${h} = ${area} cm²（漏乘 ½ 会误算成 ${forgetHalf}）。`,
          explanationEn: `Triangle area = ½ × base × height = ½ × ${b} × ${h} = ${area} cm².`,
          explanationI18n: {
            ja: `三角形の面積は ½ × 底辺 × 高さ = ½ × ${b} × ${h} = ${area} cm² です。`,
            ko: `삼각형의 넓이는 ½ × 밑변 × 높이 = ½ × ${b} × ${h} = ${area} cm²입니다.`,
            ms: `Luas segi tiga = ½ × tapak × tinggi = ½ × ${b} × ${h} = ${area} cm².`,
          },
          scaffolds: [
            {
              promptZh: `等底等高平行四边形的面积 b × h 是多少？`,
              promptEn: `Compute base × height (${b} × ${h}):`,
              promptI18n: {
                ja: `底辺 × 高さ（${b} × ${h}）を計算しなさい：`,
                ko: `밑변 × 높이인 ${b} × ${koP(h, "을", "를")} 계산하시오:`,
                ms: `Hitung tapak × tinggi (${b} × ${h}):`,
              },
              hintZh: `${b} × ${h}`,
              hintEn: `${b} × ${h}`,
              expectedAnswer: `${forgetHalf}`,
            },
            {
              promptZh: `三角形面积需要除以 2，结果是多少？`,
              promptEn: `Halve that area for the triangle:`,
              promptI18n: {
                ja: `三角形の面積はその半分なので、2 でわりなさい：`,
                ko: `삼각형의 넓이는 그 절반이므로 2로 나누시오:`,
                ms: `Bahagi dua luas itu untuk mendapat luas segi tiga:`,
              },
              hintZh: `${forgetHalf} ÷ 2`,
              hintEn: `${forgetHalf} / 2`,
              expectedAnswer: `${area}`,
            },
          ],
          distractors: [
            { text: `${forgetHalf}`, misconceptionTag: "misc_triangle_forget_half" },
            { text: `${b + h}` },
            { text: `${area + b}` },
          ],
          misconceptionsByValue: { [`${forgetHalf}`]: "misc_triangle_forget_half" },
        };
      }
      break;
    }

    // 7. Signed numbers & exponents
    case "math_signed_numbers": {
      if (dTier === "challenge") {
        const m = rng.int(2, 4);
        const p = rng.int(2, 5);
        const q = rng.int(2, 4);
        // Evaluate -m^2 - (-p) × q = -(m^2) + p*q
        const ans = -(m * m) + p * q;
        const sqSignTrap = m * m + p * q;
        const prodSignTrap = -(m * m) - p * q;
        const orderTrap = (-m * m + p) * q;
        core = {
          promptZh: `计算有理数含乘方与括号混合算式：-${m}² - (-${p}) × ${q} = ?`,
          promptEn: `Evaluate carefully (watch exponent and sign precedence): -${m}² - (-${p}) × ${q} = ?`,
          promptI18n: {
            ja: `累乗と符号の順序に注意して計算しなさい：-${m}² - (-${p}) × ${q} = ?`,
            ko: `거듭제곱과 부호 순서에 주의하여 계산하시오: -${m}² - (-${p}) × ${q} = ?`,
            ms: `Nilaikan dengan teliti (perhatikan keutamaan indeks dan tanda): -${m}² - (-${p}) × ${q} = ?`,
          },
          latexFormula: `-${m}^2 - (-${p}) \\times ${q}`,
          answer: `${ans}`,
          explanationZh: `先算乘方 -${m}² = -${m * m}，再算乘法 (-${p}) × ${q} = -${p * q}；减去负数等于加上正数：-${m * m} - (-${p * q}) = -${m * m} + ${p * q} = ${ans}。`,
          explanationEn: `First -${m}² = -${m * m}, and (-${p}) × ${q} = -${p * q}. Then -${m * m} - (-${p * q}) = -${m * m} + ${p * q} = ${ans}.`,
          explanationI18n: {
            ja: `まず -${m}² = -${m * m}、(-${p}) × ${q} = -${p * q} なので、-${m * m} - (-${p * q}) = -${m * m} + ${p * q} = ${ans} です。`,
            ko: `먼저 -${m}² = -${m * m}이고 (-${p}) × ${q} = -${p * q}이므로, -${m * m} - (-${p * q}) = -${m * m} + ${p * q} = ${ans}입니다.`,
            ms: `Mula-mula -${m}² = -${m * m}, dan (-${p}) × ${q} = -${p * q}. Maka -${m * m} - (-${p * q}) = -${m * m} + ${p * q} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `先分别算出 -${m}² 的值（注意负号不在括号内）：`,
              promptEn: `First find the value of -${m}²:`,
              promptI18n: {
                ja: `まず -${m}² の値を求めなさい：`,
                ko: `먼저 -${m}²의 값을 구하시오:`,
                ms: `Mula-mula cari nilai -${m}²:`,
              },
              hintZh: `-(${m} × ${m})`,
              hintEn: `-(${m} × ${m})`,
              expectedAnswer: `${-(m * m)}`,
            },
            {
              promptZh: `再化简 - (-${p}) × ${q} = +${p * q}，与 -${m * m} 相加得多少？`,
              promptEn: `Combine -${m * m} + ${p * q}:`,
              promptI18n: {
                ja: `-${m * m} + ${p * q} を計算しなさい：`,
                ko: `-${m * m} + ${koP(p * q, "을", "를")} 계산하시오:`,
                ms: `Hitung -${m * m} + ${p * q}:`,
              },
              hintZh: `-${m * m} + ${p * q}`,
              hintEn: `-${m * m} + ${p * q}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${sqSignTrap}`, misconceptionTag: "misc_neg_square_sign" },
            { text: `${prodSignTrap}`, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${orderTrap}` },
          ],
          misconceptionsByValue: {
            [`${sqSignTrap}`]: "misc_neg_square_sign",
            [`${prodSignTrap}`]: "misc_dist_neg_sign",
          },
        };
      } else {
        // Pick m >= 3 so -2m !== -m^2 (eliminating the m=2 distractor collision!)
        const m = dTier === "standard" ? rng.pick([3, 4, 5]) : rng.pick([3, 4]);
        const k = dTier === "standard" ? rng.int(5, 14) : rng.int(2, 8);
        const ans = -(m * m) + k;
        const signTrap = m * m + k;
        const mulTwoTrap = -2 * m + k;
        const subTrap = -(m * m) - k;
        core = {
          promptZh: `计算有理数含乘方算式（注意底数是否含括号）：-${m}² + ${k} = ?`,
          promptEn: `Evaluate carefully (watch exponent precedence): -${m}² + ${k} = ?`,
          promptI18n: {
            ja: `累乗の計算の順序に注意して計算しなさい：-${m}² + ${k} = ?`,
            ko: `거듭제곱의 계산 순서에 주의하여 계산하시오: -${m}² + ${k} = ?`,
            ms: `Nilaikan dengan teliti (perhatikan keutamaan indeks): -${m}² + ${k} = ?`,
          },
          latexFormula: `-${m}^2 + ${k}`,
          interactiveWidget: {
            kind: "number_line_slider",
            min: -25,
            max: 25,
            step: 1,
            initialValue: 0,
            captionZh: `在数轴上先找到 -${m}² = -${m * m}，再向右移动 +${k} 个单位验证终点`,
            captionEn: `Locate -${m}² = -${m * m} on the number line, then shift right by +${k} units`,
            captionI18n: {
              ja: `数直線上で -${m}² = -${m * m} の位置を確認し、右へ +${k} だけ移動してみましょう`,
              ko: `수직선 위에서 -${m}² = -${m * m}의 위치를 찾은 뒤, 오른쪽으로 +${k}만큼 이동해 보세요`,
              ms: `Tentukan kedudukan -${m}² = -${m * m} pada garis nombor, kemudian gerak ke kanan sebanyak +${k}`,
            },
            bindToAnswer: false,
          },
          answer: `${ans}`,
          explanationZh: `无括号时乘方优先级高于负号：-${m}² = -(${m} × ${m}) = -${m * m}，再加 ${k} 得 ${ans}。若把 -${m}² 误看作 (-${m})² = +${m * m} 会错得 ${signTrap}。`,
          explanationEn: `Exponentiation binds tighter than unary minus: -${m}² = -(${m * m}), so -${m * m} + ${k} = ${ans}.`,
          explanationI18n: {
            ja: `かっこがないとき、累乗は負の符号より先に計算します：-${m}² = -(${m * m}) なので、-${m * m} + ${k} = ${ans} です。`,
            ko: `괄호가 없으면 거듭제곱을 음의 부호보다 먼저 계산합니다: -${m}² = -(${m * m})이므로 -${m * m} + ${k} = ${ans}입니다.`,
            ms: `Kuasa diutamakan berbanding tanda negatif: -${m}² = -(${m * m}), maka -${m * m} + ${k} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `-${m}² 表示“${m} 的平方的相反数”，它的值是多少？`,
              promptEn: `What is the value of -${m}² (i.e. -(${m}²))?`,
              promptI18n: {
                ja: `-${m}²（つまり -(${m}²)）の値はいくつですか？`,
                ko: `-${m}² (즉, -(${m}²))의 값은 얼마입니까?`,
                ms: `Apakah nilai -${m}² (iaitu -(${m}²))?`,
              },
              hintZh: `负号在平方外`,
              hintEn: `Negative of ${m * m}`,
              hintI18n: {
                ja: `${m * m} に負の符号をつけた数`,
                ko: `${m * m}에 음의 부호를 붙인 수`,
                ms: `Negatif bagi ${m * m}`,
              },
              expectedAnswer: `${-(m * m)}`,
            },
            {
              promptZh: `再加上 ${k}，结果是多少？`,
              promptEn: `Now add ${k}:`,
              promptI18n: {
                ja: `次に ${k} を加えなさい：`,
                ko: `이제 ${koP(k, "을", "를")} 더하시오:`,
                ms: `Sekarang tambahkan ${k}:`,
              },
              hintZh: `-${m * m} + ${k}`,
              hintEn: `-${m * m} + ${k}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${signTrap}`, misconceptionTag: "misc_neg_square_sign" },
            { text: `${mulTwoTrap}` },
            { text: `${subTrap}` },
          ],
          misconceptionsByValue: { [`${signTrap}`]: "misc_neg_square_sign" },
        };
      }
      break;
    }

    // 8. Algebraic expressions (strictly clean formatting: zero "0x + 5" or "-1x" or "+ -3")
    case "math_alg_expressions": {
      if (template.itemType === "expression") {
        // Challenge tier: simplify 2(ax + b) - (cx - d) with guaranteed 2a - c !== 0
        const a = rng.pick([2, 3, 4]);
        const c = rng.pick([1, 3, 5].filter((v) => v !== 2 * a));
        const b = rng.int(2, 5);
        const d = rng.int(1, 5);
        const coef = 2 * a - c;
        const cst = 2 * b + d;
        const wrongSignCst = 2 * b - d;
        const exprAns = formatLinearExpr(coef, cst);
        const exprWrongSign = formatLinearExpr(coef, wrongSignCst);
        const exprWrongDist = formatLinearExpr(coef, b + d);
        const cTerm = c === 1 ? "x" : `${c}x`;
        core = {
          promptZh: `去括号并合并同类项化简代数式：2(${a}x + ${b}) - (${cTerm} - ${d})`,
          promptEn: `Expand brackets and simplify the algebraic expression: 2(${a}x + ${b}) - (${cTerm} - ${d})`,
          promptI18n: {
            ja: `かっこをはずして同類項をまとめ、次の式を簡単にしなさい：2(${a}x + ${b}) - (${cTerm} - ${d})`,
            ko: `괄호를 풀고 동류항을 정리하여 다음 식을 간단히 하시오: 2(${a}x + ${b}) - (${cTerm} - ${d})`,
            ms: `Kembangkan kurungan dan permudahkan ungkapan algebra: 2(${a}x + ${b}) - (${cTerm} - ${d})`,
          },
          answer: exprAns,
          explanationZh: `分配律展开并注意负括号变号：${2 * a}x + ${2 * b} - ${cTerm} + ${d} = ${exprAns}（切勿漏乘常数 ${b} 或漏变 -${d} 的符号）。`,
          explanationEn: `Distribute both 2 and the minus sign: ${2 * a}x + ${2 * b} - ${cTerm} + ${d} = ${exprAns}.`,
          explanationI18n: {
            ja: `分配法則とかっこの前の負号に注意すると、${2 * a}x + ${2 * b} - ${cTerm} + ${d} = ${exprAns} です。`,
            ko: `분배법칙과 괄호 앞의 음의 부호에 주의하면 ${2 * a}x + ${2 * b} - ${cTerm} + ${d} = ${exprAns}입니다.`,
            ms: `Agihkan kedua-dua 2 dan tanda tolak: ${2 * a}x + ${2 * b} - ${cTerm} + ${d} = ${exprAns}.`,
          },
          scaffolds: [
            {
              promptZh: `展开 2(${a}x + ${b}) 后常数项是多少？去掉 -(${cTerm} - ${d}) 后常数项变成加几？两者相加得：`,
              promptEn: `Combine the expanded constants ${2 * b} - (-${d}):`,
              promptI18n: {
                ja: `展開後の定数項 ${2 * b} - (-${d}) をまとめなさい：`,
                ko: `전개한 상수항 ${2 * b} - (-${d})을 계산하시오:`,
                ms: `Gabungkan pemalar ${2 * b} - (-${d}):`,
              },
              hintZh: `${2 * b} + ${d}`,
              hintEn: `${2 * b} + ${d}`,
              expectedAnswer: `${cst}`,
            },
            {
              promptZh: `合并同类项后写出最简一次式：`,
              promptEn: `Combine like terms and write the simplified linear expression:`,
              promptI18n: {
                ja: `同類項をまとめて、最も簡単な式を書きなさい：`,
                ko: `동류항끼리 정리하여 가장 간단한 일차식을 쓰시오:`,
                ms: `Gabungkan sebutan serupa dan tulis ungkapan linear termudah:`,
              },
              hintZh: `一次项系数为 ${coef}，常数项为 ${cst}`,
              hintEn: `x-coefficient is ${coef}, constant is ${cst}`,
              hintI18n: {
                ja: `x の係数は ${coef}、定数項は ${cst} です`,
                ko: `x의 계수는 ${coef}, 상수항은 ${cst}입니다`,
                ms: `Pekali x ialah ${coef}, pemalar ialah ${cst}`,
              },
              expectedAnswer: exprAns,
            },
          ],
          distractors: [
            { text: exprWrongSign, misconceptionTag: "misc_dist_neg_sign" },
            { text: exprWrongDist, misconceptionTag: "misc_dist_neg_sign" },
          ],
          misconceptionsByValue: {
            [exprWrongSign]: "misc_dist_neg_sign",
            [exprWrongDist]: "misc_dist_neg_sign",
          },
        };
      } else {
        // Basic (choice) & Standard (numeric): guarantee a > c so coef >= 1
        const c = rng.int(2, 4);
        const a = c + (dTier === "standard" ? rng.int(2, 5) : rng.int(1, 3));
        const b = rng.int(2, 6);
        const d = rng.int(1, 5);
        const coef = a - c;
        const cst = b + d;
        const wrongCst = b - d;
        const xVal = dTier === "standard" ? rng.pick([-2, 3, 4, 5]) : rng.int(2, 4);
        const simpStr = formatLinearExpr(coef, cst);
        const valAns = coef * xVal + cst;
        const valWrong = coef * xVal + wrongCst;
        const valAddX = (a + c) * xVal + cst;
        core = {
          promptZh: `先化简整式 (${a}x + ${b}) - (${c}x - ${d})，再求当 x = ${xVal} 时代数式的值：`,
          promptEn: `Simplify (${a}x + ${b}) - (${c}x - ${d}) and evaluate at x = ${xVal}:`,
          promptI18n: {
            ja: `(${a}x + ${b}) - (${c}x - ${d}) を簡単にし、x = ${xVal} のときの式の値を求めなさい：`,
            ko: `식 (${a}x + ${b}) - (${c}x - ${d})의 괄호를 풀어 간단히 한 뒤, x = ${xVal}일 때의 식의 값을 구하시오:`,
            ms: `Permudahkan (${a}x + ${b}) - (${c}x - ${d}) dan nilaikan apabila x = ${xVal}:`,
          },
          answer: `${valAns}`,
          explanationZh: `去括号变号得 ${simpStr}；代入 x = ${xVal} 得 ${coef}×(${xVal}) + ${cst} = ${valAns}（若漏变 -${d} 的符号会错得 ${valWrong}）。`,
          explanationEn: `Simplifies to ${simpStr}; substituting x = ${xVal} gives ${valAns}.`,
          explanationI18n: {
            ja: `簡単にすると ${simpStr} となり、x = ${xVal} を代入すると式の値は ${valAns} です。`,
            ko: `간단히 하면 ${simpStr}이고, x = ${koP(xVal, "을", "를")} 대입하면 식의 값은 ${valAns}입니다.`,
            ms: `Dipermudahkan menjadi ${simpStr}; apabila x = ${xVal}, nilainya ialah ${valAns}.`,
          },
          scaffolds: [
            {
              promptZh: `去括号合并常数项：${b} - (-${d}) 等于多少？`,
              promptEn: `Combine the constants ${b} - (-${d}):`,
              promptI18n: {
                ja: `定数項 ${b} - (-${d}) をまとめなさい：`,
                ko: `상수항 ${b} - (-${d})의 값을 구하시오:`,
                ms: `Gabungkan pemalar ${b} - (-${d}):`,
              },
              hintZh: `注意负负得正`,
              hintEn: `${b} + ${d}`,
              expectedAnswer: `${cst}`,
            },
            {
              promptZh: `将 x = ${xVal} 代入 ${simpStr} 计算结果：`,
              promptEn: `Substitute x = ${xVal} into ${simpStr}:`,
              promptI18n: {
                ja: `${simpStr} に x = ${xVal} を代入して計算しなさい：`,
                ko: `${simpStr}에 x = ${koP(xVal, "을", "를")} 대입하여 계산하시오:`,
                ms: `Gantikan x = ${xVal} ke dalam ${simpStr}:`,
              },
              hintZh: `${coef} × (${xVal}) + ${cst}`,
              hintEn: `${coef} × (${xVal}) + ${cst}`,
              expectedAnswer: `${valAns}`,
            },
          ],
          distractors: [
            { text: `${valWrong}`, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${valAddX}` },
            { text: `${valAns + d + 1}` },
          ],
          misconceptionsByValue: { [`${valWrong}`]: "misc_dist_neg_sign" },
        };
      }
      break;
    }

    // 9. Linear equation in one variable
    case "math_linear_eq_one": {
      if (dTier === "challenge") {
        // Two-denominator equation: (x + a)/2 - (x - c)/3 = b => 3(x+a) - 2(x-c) = 6b => x = 6b - 3a - 2c
        const a = rng.int(1, 4);
        const c = rng.int(1, 4);
        const b = rng.int(2, 5);
        const xAns = 6 * b - 3 * a - 2 * c;
        const signTrap = 6 * b - 3 * a + 2 * c;
        const skipRhsLcdTrap = b - 3 * a - 2 * c;
        core = {
          promptZh: `解含双分母的一元一次方程，求 x 的值：(x + ${a})/2 - (x - ${c})/3 = ${b}`,
          promptEn: `Solve the fractional linear equation for x: (x + ${a})/2 - (x - ${c})/3 = ${b}`,
          promptI18n: {
            ja: `分母を含む一次方程式を解き、x の値を求めなさい：(x + ${a})/2 - (x - ${c})/3 = ${b}`,
            ko: `분수가 있는 일차방정식을 풀어 x의 값을 구하시오: (x + ${a})/2 - (x - ${c})/3 = ${b}`,
            ms: `Selesaikan persamaan linear pecahan bagi x: (x + ${a})/2 - (x - ${c})/3 = ${b}`,
          },
          answer: `${xAns}`,
          explanationZh: `两边同乘最小公分母 6：3(x + ${a}) - 2(x - ${c}) = ${6 * b}，注意 -2(-${c}) = +${2 * c}，整理得 x + ${3 * a + 2 * c} = ${6 * b}，解得 x = ${xAns}。`,
          explanationEn: `Multiply every term by 6: 3(x + ${a}) - 2(x - ${c}) = ${6 * b} ⇒ x + ${3 * a + 2 * c} = ${6 * b} ⇒ x = ${xAns}.`,
          explanationI18n: {
            ja: `両辺に 6 をかけて分母をはらうと 3(x + ${a}) - 2(x - ${c}) = ${6 * b} となり、符号に注意して整理すると x = ${xAns} です。`,
            ko: `양변에 최소공배수 6을 곱하면 3(x + ${a}) - 2(x - ${c}) = ${6 * b}이고, 부호에 주의하여 정리하면 x = ${xAns}입니다.`,
            ms: `Darabkan setiap sebutan dengan 6: 3(x + ${a}) - 2(x - ${c}) = ${6 * b} ⇒ x + ${3 * a + 2 * c} = ${6 * b} ⇒ x = ${xAns}.`,
          },
          scaffolds: [
            {
              promptZh: `两边同乘最小公倍数 6 后，右边常数 ${b} 变成多少？`,
              promptEn: `Multiply both sides by 6; what does the RHS ${b} become?`,
              promptI18n: {
                ja: `両辺に 6 をかけると、右辺の ${b} はいくつになりますか？`,
                ko: `양변에 6을 곱하면 우변의 ${koP(b, "은", "는")} 얼마가 됩니까?`,
                ms: `Darabkan kedua-dua belah dengan 6; ${b} di sebelah kanan menjadi berapa?`,
              },
              hintZh: `${b} × 6`,
              hintEn: `${b} × 6`,
              expectedAnswer: `${6 * b}`,
            },
            {
              promptZh: `展开左边得 x + ${3 * a + 2 * c} = ${6 * b}，求出 x：`,
              promptEn: `Solve x + ${3 * a + 2 * c} = ${6 * b} for x:`,
              promptI18n: {
                ja: `x + ${3 * a + 2 * c} = ${6 * b} を解いて x を求めなさい：`,
                ko: `x + ${3 * a + 2 * c} = ${koP(6 * b, "을", "를")} 풀어 x를 구하시오:`,
                ms: `Selesaikan x + ${3 * a + 2 * c} = ${6 * b} bagi x:`,
              },
              hintZh: `${6 * b} - ${3 * a + 2 * c}`,
              hintEn: `${6 * b} - ${3 * a + 2 * c}`,
              expectedAnswer: `${xAns}`,
            },
          ],
          distractors: [
            { text: `${signTrap}`, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${skipRhsLcdTrap}`, misconceptionTag: "misc_eq_skip_const_lcd" },
            { text: `${xAns + 6}` },
          ],
          misconceptionsByValue: {
            [`${signTrap}`]: "misc_dist_neg_sign",
            [`${skipRhsLcdTrap}`]: "misc_eq_skip_const_lcd",
          },
        };
      } else {
        const den = dTier === "standard" ? 3 : 2;
        const a = rng.int(1, 5);
        const b = rng.int(2, 6);
        const xAns = den * (b + 1) - a;
        const xTrap = den * b + 1 - a;
        const noScaleRhsTrap = b + den - a;
        core = {
          promptZh: `解含分母的一元一次方程，求 x 的值：(x + ${a}) / ${den} - 1 = ${b}`,
          promptEn: `Solve the linear equation for x: (x + ${a}) / ${den} - 1 = ${b}`,
          promptI18n: {
            ja: `次の一次方程式を解き、x の値を求めなさい：(x + ${a}) / ${den} - 1 = ${b}`,
            ko: `다음 일차방정식을 풀어 x의 값을 구하시오: (x + ${a}) / ${den} - 1 = ${b}`,
            ms: `Selesaikan persamaan linear bagi x: (x + ${a}) / ${den} - 1 = ${b}`,
          },
          answer: `${xAns}`,
          explanationZh: `方程两边每一项同乘 ${den} 去分母：(x + ${a}) - ${den} = ${den * b}，解得 x = ${xAns}。注意常数项“-1”也必须乘 ${den}，否则会漏乘错得 ${xTrap}！`,
          explanationEn: `Multiply EVERY term on both sides by ${den}: (x + ${a}) - ${den} = ${den * b} ⇒ x = ${xAns}.`,
          explanationI18n: {
            ja: `両辺のすべての項に ${den} をかけて分母をはらいます：(x + ${a}) - ${den} = ${den * b} より x = ${xAns} です。`,
            ko: `양변의 모든 항에 ${koP(den, "을", "를")} 곱하여 분모를 없앱니다: (x + ${a}) - ${den} = ${den * b}이므로 x = ${xAns}입니다.`,
            ms: `Darabkan SETIAP sebutan pada kedua-dua belah dengan ${den}: (x + ${a}) - ${den} = ${den * b} ⇒ x = ${xAns}.`,
          },
          scaffolds: [
            {
              promptZh: `方程两边每一项同乘 ${den} 后，右边的 ${b} 变成多少？`,
              promptEn: `Multiplying both sides by ${den} turns the RHS ${b} into:`,
              promptI18n: {
                ja: `両辺に ${den} をかけると、右辺の ${b} はいくつになりますか：`,
                ko: `양변에 ${koP(den, "을", "를")} 곱하면 우변의 ${koP(b, "은", "는")} 얼마가 됩니까:`,
                ms: `Apabila kedua-dua belah didarab dengan ${den}, ${b} di sebelah kanan menjadi:`,
              },
              hintZh: `${b} × ${den}`,
              hintEn: `${b} × ${den}`,
              expectedAnswer: `${den * b}`,
            },
            {
              promptZh: `左边变为 x + ${a} - ${den} = ${den * b}，解出 x = ?`,
              promptEn: `Solve x + ${a} - ${den} = ${den * b} for x:`,
              promptI18n: {
                ja: `x + ${a} - ${den} = ${den * b} を解いて x を求めなさい：`,
                ko: `x + ${a} - ${den} = ${koP(den * b, "을", "를")} 풀어 x를 구하시오:`,
                ms: `Selesaikan x + ${a} - ${den} = ${den * b} bagi x:`,
              },
              hintZh: `移项计算`,
              hintEn: `Isolate x`,
              hintI18n: { ja: `移項して x だけを左辺に残す`, ko: `이항하여 x만 남기기`, ms: `Asingkan x` },
              expectedAnswer: `${xAns}`,
            },
          ],
          distractors: [
            { text: `${xTrap}`, misconceptionTag: "misc_eq_skip_const_lcd" },
            { text: `${noScaleRhsTrap}` },
            { text: `${xAns + 2 * a}` },
          ],
          misconceptionsByValue: { [`${xTrap}`]: "misc_eq_skip_const_lcd" },
        };
      }
      break;
    }

    // 10. 2x2 Linear systems (zero x === y distractor collisions + challenge scaling elimination)
    case "math_linear_systems": {
      if (dTier === "challenge") {
        const x = rng.int(3, 7);
        const y = rng.pick([1, 2, 4, 5].filter((v) => v !== x));
        const s1 = 2 * x + y;
        const d1 = x - 2 * y;
        const unscaledTrap = formatFrac(s1 + d1, 3);
        const signTrap = formatFrac(2 * s1 - d1, 5);
        core = {
          promptZh: `用加减消元法解二元一次方程组：{ 2x + y = ${s1} ； x - 2y = ${d1} }，求 x + y 的值：`,
          promptEn: `Solve the linear system { 2x + y = ${s1},  x - 2y = ${d1} } and find the value of x + y:`,
          promptI18n: {
            ja: `連立方程式 { 2x + y = ${s1},  x - 2y = ${d1} } を解き、x + y の値を求めなさい：`,
            ko: `연립방정식 { 2x + y = ${s1},  x - 2y = ${d1} }을 풀어 x + y의 값을 구하시오:`,
            ms: `Selesaikan persamaan linear serentak { 2x + y = ${s1},  x - 2y = ${d1} } dan cari nilai x + y:`,
          },
          answer: `${x + y}`,
          explanationZh: `将①式乘 2 再与②式相加消去 y：5x = 2×${s1} + (${d1}) = ${5 * x}，得 x = ${x}；代回①得 y = ${y}，因此 x + y = ${x + y}。`,
          explanationEn: `2×Eq1 + Eq2 eliminates y: 5x = ${2 * s1} + (${d1}) = ${5 * x} ⇒ x = ${x}, y = ${y}, so x + y = ${x + y}.`,
          explanationI18n: {
            ja: `第 1 式を 2 倍して第 2 式とたすと 5x = ${5 * x} より x = ${x}、y = ${y} となるので、x + y = ${x + y} です。`,
            ko: `첫째 식에 2를 곱해 둘째 식과 더하면 5x = ${5 * x}에서 x = ${x}, y = ${y}이므로 x + y = ${x + y}입니다.`,
            ms: `2×Persamaan 1 + Persamaan 2 menghapuskan y: 5x = ${5 * x} ⇒ x = ${x}, y = ${y}, maka x + y = ${x + y}.`,
          },
          scaffolds: [
            {
              promptZh: `将 2x + y = ${s1} 两边乘 2 后与 x - 2y = ${d1} 相加，5x = ?`,
              promptEn: `Compute 2(${s1}) + (${d1}) to get 5x:`,
              promptI18n: {
                ja: `2 × ${s1} + (${d1}) を計算して 5x を求めなさい：`,
                ko: `2 × ${s1} + (${d1})을 계산하여 5x의 값을 구하시오:`,
                ms: `Hitung 2(${s1}) + (${d1}) untuk mendapat 5x:`,
              },
              hintZh: `${2 * s1} + (${d1})`,
              hintEn: `${2 * s1} + (${d1})`,
              expectedAnswer: `${5 * x}`,
            },
            {
              promptZh: `求出 x = ${x} 后代回求 y = ${y}，计算 x + y：`,
              promptEn: `With x = ${x} and y = ${y}, find x + y:`,
              promptI18n: {
                ja: `x = ${x}, y = ${y} から x + y を求めなさい：`,
                ko: `x = ${x}, y = ${y}일 때 x + y를 구하시오:`,
                ms: `Dengan x = ${x} dan y = ${y}, cari x + y:`,
              },
              hintZh: `${x} + ${y}`,
              hintEn: `${x} + ${y}`,
              expectedAnswer: `${x + y}`,
            },
          ],
          distractors: [
            { text: `${x}`, misconceptionTag: "misc_sys_sub_sign" },
            { text: unscaledTrap },
            { text: signTrap, misconceptionTag: "misc_sys_sub_sign" },
          ],
          misconceptionsByValue: {
            [`${x}`]: "misc_sys_sub_sign",
            [signTrap]: "misc_sys_sub_sign",
          },
        };
      } else {
        const x = dTier === "standard" ? rng.int(4, 8) : rng.int(3, 6);
        const y = rng.pick([1, 2, 5].filter((v) => v !== x && v !== x + 1 && 2 * v - x !== 3 * x));
        const s = x + y;
        const d = 2 * x - y;
        const signTrapStr = formatFrac(s - d, 3);
        core = {
          promptZh: `解二元一次方程组：{ x + y = ${s} ； 2x - y = ${d} }，求 x 的值：`,
          promptEn: `Solve the linear system { x + y = ${s},  2x - y = ${d} }. Find the value of x:`,
          promptI18n: {
            ja: `連立方程式 { x + y = ${s},  2x - y = ${d} } を解き、x の値を求めなさい：`,
            ko: `연립방정식 { x + y = ${s},  2x - y = ${d} }을 풀어 x의 값을 구하시오:`,
            ms: `Selesaikan persamaan linear serentak { x + y = ${s},  2x - y = ${d} }. Cari nilai x:`,
          },
          answer: `${x}`,
          explanationZh: `两式直接相加消去 +y 与 -y：3x = ${s} + (${d}) = ${3 * x}，故 x = ${x}。`,
          explanationEn: `Add the two equations to eliminate y: 3x = ${s + d} ⇒ x = ${x}.`,
          explanationI18n: {
            ja: `2 つの式をたして y を消去します：3x = ${s + d} より x = ${x} です。`,
            ko: `두 식을 더하여 y를 소거합니다: 3x = ${s + d}이므로 x = ${x}입니다.`,
            ms: `Tambahkan kedua-dua persamaan untuk menghapuskan y: 3x = ${s + d} ⇒ x = ${x}.`,
          },
          scaffolds: [
            {
              promptZh: `将两式左右两边直接相加消去 y，得到 3x 等于多少？`,
              promptEn: `Add both equations so +y and -y cancel; 3x = ?`,
              promptI18n: {
                ja: `2 つの式をたして +y と -y を消去すると、3x = ?`,
                ko: `두 식을 더하여 +y와 -y를 소거하면 3x = ?`,
                ms: `Tambahkan kedua-dua persamaan supaya +y dan -y terhapus; 3x = ?`,
              },
              hintZh: `${s} + (${d})`,
              hintEn: `${s} + (${d})`,
              expectedAnswer: `${3 * x}`,
            },
            {
              promptZh: `两边同除以 3，x = ?`,
              promptEn: `Divide by 3 to find x:`,
              promptI18n: {
                ja: `両辺を 3 でわって x を求めなさい：`,
                ko: `양변을 3으로 나누어 x를 구하시오:`,
                ms: `Bahagikan dengan 3 untuk mencari x:`,
              },
              hintZh: `${3 * x} ÷ 3`,
              hintEn: `${3 * x} / 3`,
              expectedAnswer: `${x}`,
            },
          ],
          distractors: [
            { text: signTrapStr, misconceptionTag: "misc_sys_sub_sign" },
            { text: `${y}` },
            { text: `${s + d}` },
          ],
          misconceptionsByValue: { [signTrapStr]: "misc_sys_sub_sign" },
        };
      }
      break;
    }

    // 11. Linear functions & slope (MEXT y = ax + b in ja + zero b === k collisions + challenge y-intercept)
    case "math_linear_func": {
      if (dTier === "challenge") {
        const k = rng.pick([-3, -2, 2, 3, 4]);
        const b = rng.pick([-5, -4, -1, 1, 5, 6].filter((v) => v !== k && v !== -k));
        const x1 = 2;
        const y1 = k * x1 + b;
        const x2 = 4;
        const y2 = k * x2 + b;
        const wrongSignB = y1 + k * x1;
        core = {
          promptZh: `已知一次函数 y = kx + b 的图像经过点 A(${x1}, ${y1}) 和点 B(${x2}, ${y2})，求它在 y 轴上的截距 b：`,
          promptEn: `A linear function y = kx + b passes through A(${x1}, ${y1}) and B(${x2}, ${y2}). Find its y-intercept b:`,
          promptI18n: {
            ja: `一次関数 y = ax + b のグラフが 2 点 A(${x1}, ${y1})、B(${x2}, ${y2}) を通るとき、切片 b の値を求めなさい：`,
            ko: `일차함수 y = ax + b의 그래프가 두 점 A(${x1}, ${y1}), B(${x2}, ${y2})를 지날 때, y절편 b의 값을 구하시오:`,
            ms: `Suatu fungsi linear y = mx + c melalui titik A(${x1}, ${y1}) dan B(${x2}, ${y2}). Cari pintasan-y (c):`,
          },
          answer: `${b}`,
          explanationZh: `先求斜率 k = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}；再将 A(${x1}, ${y1}) 代入 ${y1} = ${k}×${x1} + b，解得截距 b = ${b}。`,
          explanationEn: `First find slope k = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}. Substitute A(${x1}, ${y1}): ${y1} = ${k}(${x1}) + b ⇒ b = ${b}.`,
          explanationI18n: {
            ja: `まず傾き a = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k} を求め、点 A(${x1}, ${y1}) を代入すると ${y1} = ${k}×${x1} + b より切片 b = ${b} です。`,
            ko: `먼저 기울기 a = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}을 구하고, 점 A(${x1}, ${y1})을 대입하면 ${y1} = ${k}×${x1} + b에서 y절편 b = ${b}입니다.`,
            ms: `Mula-mula cari kecerunan m = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}. Gantikan A(${x1}, ${y1}): ${y1} = ${k}(${x1}) + c ⇒ c = ${b}.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：求直线的斜率 (${y2} - (${y1})) ÷ (${x2} - ${x1}) = ?`,
              promptEn: `Step 1: Find the slope (${y2} - (${y1})) / (${x2} - ${x1}):`,
              promptI18n: {
                ja: `ステップ 1：傾き a = (${y2} - (${y1})) ÷ (${x2} - ${x1}) を求めなさい：`,
                ko: `1단계: 기울기 a = (${y2} - (${y1})) ÷ (${x2} - ${x1})을 구하시오:`,
                ms: `Langkah 1: Cari kecerunan (${y2} - (${y1})) / (${x2} - ${x1}):`,
              },
              hintZh: `Δy ÷ Δx`,
              hintEn: `Δy / Δx`,
              expectedAnswer: `${k}`,
            },
            {
              promptZh: `第二步：利用 b = ${y1} - (${k})×${x1} 求截距 b：`,
              promptEn: `Step 2: Solve b = ${y1} - (${k}) × ${x1}:`,
              promptI18n: {
                ja: `ステップ 2：切片 b = ${y1} - (${k}) × ${x1} を求めなさい：`,
                ko: `2단계: y절편 b = ${y1} - (${k}) × ${x1}의 값을 구하시오:`,
                ms: `Langkah 2: Selesaikan pintasan-y = ${y1} - (${k}) × ${x1}:`,
              },
              hintZh: `${y1} - (${k * x1})`,
              hintEn: `${y1} - (${k * x1})`,
              expectedAnswer: `${b}`,
            },
          ],
          distractors: [
            { text: `${wrongSignB}`, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${k}`, misconceptionTag: "misc_slope_run_over_rise" },
            { text: `${-b}` },
          ],
          misconceptionsByValue: {
            [`${wrongSignB}`]: "misc_dist_neg_sign",
            [`${k}`]: "misc_slope_run_over_rise",
          },
        };
      } else {
        const k = rng.pick([-4, -3, -2, 2, 3, 4]);
        const b = rng.pick([-5, -3, -1, 1, 5].filter((v) => v !== k && v !== -k));
        const x1 = dTier === "standard" ? -1 : 1;
        const x2 = dTier === "standard" ? 2 : 3;
        const y1 = k * x1 + b;
        const y2 = k * x2 + b;
        const dx = x2 - x1;
        const runOverRise = formatFrac(dx, y2 - y1);
        core = {
          promptZh: `已知一次函数 y = kx + b 的图像经过点 A(${x1}, ${y1}) 和点 B(${x2}, ${y2})，求该直线的斜率 k：`,
          promptEn: `A linear function y = kx + b passes through A(${x1}, ${y1}) and B(${x2}, ${y2}). Find its slope k:`,
          promptI18n: {
            ja: `一次関数 y = ax + b のグラフが点 A(${x1}, ${y1}) と点 B(${x2}, ${y2}) を通ります。変化の割合（傾き a）を求めなさい：`,
            ko: `일차함수 y = ax + b의 그래프가 점 A(${x1}, ${y1})과 점 B(${x2}, ${y2})를 지납니다. 기울기 a를 구하시오:`,
            ms: `Suatu fungsi linear y = mx + c melalui titik A(${x1}, ${y1}) dan B(${x2}, ${y2}). Cari kecerunannya m:`,
          },
          answer: `${k}`,
          explanationZh: `斜率 k = Δy / Δx = (${y2} - (${y1})) / (${x2} - (${x1})) = ${y2 - y1} / ${dx} = ${k}（切勿把分子分母颠倒写成 Δx/Δy = ${runOverRise}）。`,
          explanationEn: `Slope k = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - (${x1})) = ${k}.`,
          explanationI18n: {
            ja: `傾き a = (y の増加量) / (x の増加量) = (${y2} - (${y1})) / (${x2} - (${x1})) = ${k} です。`,
            ko: `기울기 a = (y의 값의 증가량) / (x의 값의 증가량) = (${y2} - (${y1})) / (${x2} - (${x1})) = ${k}입니다.`,
            ms: `Kecerunan m = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - (${x1})) = ${k}.`,
          },
          scaffolds: [
            {
              promptZh: `先算纵坐标变化量 Δy = y₂ - y₁ = ${y2} - (${y1}) = ?`,
              promptEn: `Compute vertical change Δy = ${y2} - (${y1}):`,
              promptI18n: {
                ja: `y の増加量 Δy = ${y2} - (${y1}) を計算しなさい：`,
                ko: `y의 증가량 Δy = ${y2} - (${y1})의 값을 계산하시오:`,
                ms: `Hitung perubahan menegak Δy = ${y2} - (${y1}):`,
              },
              hintZh: `纵坐标相减`,
              hintEn: `y₂ - y₁`,
              expectedAnswer: `${y2 - y1}`,
            },
            {
              promptZh: `再除以横坐标变化量 Δx = ${dx}，斜率等于多少？`,
              promptEn: `Divide by Δx = ${dx} to get the slope:`,
              promptI18n: {
                ja: `x の増加量 ${dx} でわって傾き a を求めなさい：`,
                ko: `x의 증가량 ${koP(dx, "으로", "로")} 나누어 기울기 a를 구하시오:`,
                ms: `Bahagikan dengan Δx = ${dx} untuk mendapat kecerunan:`,
              },
              hintZh: `Δy ÷ ${dx}`,
              hintEn: `Δy / ${dx}`,
              expectedAnswer: `${k}`,
            },
          ],
          distractors: [
            { text: runOverRise, misconceptionTag: "misc_slope_run_over_rise" },
            { text: `${-k}`, misconceptionTag: "misc_slope_run_over_rise" },
            { text: `${b}` },
          ],
          misconceptionsByValue: { [runOverRise]: "misc_slope_run_over_rise" },
        };
      }
      break;
    }

    // 12. Special products & factoring (strict cross-locale parity — never leak formula in prompt!)
    case "math_special_products": {
      const m = rng.int(2, 6);
      if (template.itemType === "expression") {
        const aCoef = rng.pick([1, 2]);
        const isMinus = aCoef === 2;
        const exprAns = isMinus
          ? formatQuadraticExpr(4, -4 * m, m * m)
          : formatQuadraticExpr(1, 2 * m, m * m);
        const exprTrap = isMinus
          ? formatQuadraticExpr(4, 0, m * m)
          : formatQuadraticExpr(1, 0, m * m);
        const stemExpr = isMinus ? `(2x - ${m})²` : `(x + ${m})²`;
        const midCoef = isMinus ? -4 * m : 2 * m;
        core = {
          promptZh: `运用完全平方公式展开整式并合并为二次三项式：${stemExpr}`,
          promptEn: `Expand the perfect square expression into standard trinomial form: ${stemExpr}`,
          promptI18n: {
            ja: `乗法公式（平方の公式）を使って展開しなさい：${stemExpr}`,
            ko: `곱셈 공식(완전제곱식)을 이용하여 전개하시오: ${stemExpr}`,
            ms: `Kembangkan ungkapan kuasa dua sempurna kepada bentuk trinomial piawai: ${stemExpr}`,
          },
          answer: exprAns,
          explanationZh: `${stemExpr} 展开后必须包含中间交叉项 2ab：结果为 ${exprAns}（切忌漏掉一次项误写成 ${exprTrap}！）。`,
          explanationEn: `Expanding ${stemExpr} includes the middle cross-term 2ab, giving ${exprAns} (never drop the middle term to write ${exprTrap}!).`,
          explanationI18n: {
            ja: `${stemExpr} を展開すると中央の項 2ab が現れ、${exprAns} になります（${exprTrap} としないよう注意しましょう）。`,
            ko: `${stemExpr}을 전개하면 가운데 항 2ab가 포함되어 ${exprAns}이 됩니다 (${exprTrap}처럼 가운데 항을 빠뜨리지 마세요).`,
            ms: `Mengembangkan ${stemExpr} menghasilkan sebutan tengah 2ab, iaitu ${exprAns} (jangan tertinggal sebutan tengah seperti ${exprTrap}!).`,
          },
          scaffolds: [
            {
              promptZh: `展开 ${stemExpr} 时，中间一次项 x 的系数（含正负号）是多少？`,
              promptEn: `In expanding ${stemExpr}, what is the signed coefficient of x in the middle term?`,
              promptI18n: {
                ja: `${stemExpr} を展開したとき、x の項の係数（符号を含む）はいくつですか？`,
                ko: `${stemExpr}을 전개할 때 일차항 x의 계수(부호 포함)는 얼마입니까?`,
                ms: `Apabila mengembangkan ${stemExpr}, apakah pekali bertanda bagi sebutan x?`,
              },
              hintZh: isMinus ? `-2 × 2 × ${m}` : `2 × ${m}`,
              hintEn: isMinus ? `-2 × 2 × ${m}` : `2 × ${m}`,
              expectedAnswer: `${midCoef}`,
            },
            {
              promptZh: `写出完整展开后的二次三项式：`,
              promptEn: `Write the full expanded trinomial:`,
              promptI18n: {
                ja: `展開した二次三項式をすべて書きなさい：`,
                ko: `전개한 이차식을 모두 쓰시오:`,
                ms: `Tulis trinomial yang dikembangkan sepenuhnya:`,
              },
              hintZh: `二次三项式 ax^2 ± bx + c`,
              hintEn: `ax^2 ± bx + c`,
              expectedAnswer: exprAns,
            },
          ],
          distractors: [{ text: exprTrap, misconceptionTag: "misc_freshman_dream" }],
          misconceptionsByValue: { [exprTrap]: "misc_freshman_dream" },
        };
      } else if (dTier === "standard") {
        const base = rng.pick([50, 60, 70, 80, 100]);
        const delta = rng.int(2, 6);
        const p = base + delta;
        const q = base - delta;
        const ans = p * q;
        const wrongAdd = base * base + delta * delta;
        core = {
          promptZh: `运用平方差公式 (a + b)(a - b) = a² - b² 巧算：${p} × ${q} = ?`,
          promptEn: `Use the difference of squares identity (a + b)(a - b) = a² - b² to evaluate mentally: ${p} × ${q} = ?`,
          promptI18n: {
            ja: `乗法公式 (a + b)(a - b) = a² - b² を利用して工夫して計算しなさい：${p} × ${q} = ?`,
            ko: `합차 공식 (a + b)(a - b) = a² - b²을 이용하여 편리하게 계산하시오: ${p} × ${q} = ?`,
            ms: `Gunakan identiti beza kuasa dua (a + b)(a - b) = a² - b² untuk mengira: ${p} × ${q} = ?`,
          },
          answer: `${ans}`,
          explanationZh: `${p} × ${q} = (${base} + ${delta})(${base} - ${delta}) = ${base}² - ${delta}² = ${base * base} - ${delta * delta} = ${ans}。`,
          explanationEn: `${p} × ${q} = (${base} + ${delta})(${base} - ${delta}) = ${base}² - ${delta}² = ${base * base} - ${delta * delta} = ${ans}.`,
          explanationI18n: {
            ja: `${p} × ${q} = (${base} + ${delta})(${base} - ${delta}) = ${base}² - ${delta}² = ${base * base} - ${delta * delta} = ${ans} です。`,
            ko: `${p} × ${q} = (${base} + ${delta})(${base} - ${delta}) = ${base}² - ${delta}² = ${base * base} - ${delta * delta} = ${ans}입니다.`,
            ms: `${p} × ${q} = (${base} + ${delta})(${base} - ${delta}) = ${base}² - ${delta}² = ${base * base} - ${delta * delta} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `将 ${p} 和 ${q} 写成 (${base} + ${delta})(${base} - ${delta})，先算 ${base}² 等于多少？`,
              promptEn: `Rewrite as (${base} + ${delta})(${base} - ${delta}); first compute ${base}²:`,
              promptI18n: {
                ja: `(${base} + ${delta})(${base} - ${delta}) とみて、まず ${base}² を求めなさい：`,
                ko: `(${base} + ${delta})(${base} - ${delta})로 고쳐 먼저 ${base}²을 계산하시오:`,
                ms: `Tulis sebagai (${base} + ${delta})(${base} - ${delta}); mula-mula hitung ${base}²:`,
              },
              hintZh: `${base} × ${base}`,
              hintEn: `${base} × ${base}`,
              expectedAnswer: `${base * base}`,
            },
            {
              promptZh: `再减去 ${delta}² = ${delta * delta}，结果是多少？`,
              promptEn: `Now subtract ${delta}² = ${delta * delta}:`,
              promptI18n: {
                ja: `そこから ${delta}² = ${delta * delta} を引きなさい：`,
                ko: `거기서 ${delta}² = ${koP(delta * delta, "을", "를")} 빼시오:`,
                ms: `Sekarang tolakkan ${delta}² = ${delta * delta}:`,
              },
              hintZh: `${base * base} - ${delta * delta}`,
              hintEn: `${base * base} - ${delta * delta}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${wrongAdd}`, misconceptionTag: "misc_freshman_dream" },
            { text: `${base * base - delta}` },
            { text: `${base * base - 2 * delta}` },
          ],
          misconceptionsByValue: { [`${wrongAdd}`]: "misc_freshman_dream" },
        };
      } else {
        const x = rng.int(3, 6);
        const ans = (x + m) * (x + m);
        const freshmanTrap = x * x + m * m;
        core = {
          promptZh: `已知 x = ${x}，计算完全平方式 (x + ${m})² 的值（注意对比它与 x² + ${m}² 的区别）：`,
          promptEn: `Given x = ${x}, evaluate (x + ${m})² (be careful not to confuse it with x² + ${m}²):`,
          promptI18n: {
            ja: `x = ${x} のとき、(x + ${m})² の値を求めなさい（x² + ${m}² と混同しないよう注意）：`,
            ko: `x = ${x}일 때, 완전제곱식 (x + ${m})²의 값을 구하시오 (x² + ${m}²과 혼동하지 마시오):`,
            ms: `Diberi x = ${x}, nilaikan (x + ${m})² (berhati-hati supaya tidak mengelirukannya dengan x² + ${m}²):`,
          },
          answer: `${ans}`,
          explanationZh: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans}。若漏掉中间项 2ab 只算 x² + ${m}² 会误得 ${freshmanTrap}。`,
          explanationEn: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans} (whereas x² + ${m}² = ${freshmanTrap} misses 2·${x}·${m}).`,
          explanationI18n: {
            ja: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans} です（x² + ${m}² = ${freshmanTrap} では中央の項 2·${x}·${m} が抜けています）。`,
            ko: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans}입니다 (x² + ${m}² = ${freshmanTrap}은 가운데 항 2·${x}·${m}이 빠진 값입니다).`,
            ms: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans} (manakala x² + ${m}² = ${freshmanTrap} tertinggal sebutan tengah 2·${x}·${m}).`,
          },
          scaffolds: [
            {
              promptZh: `中间交叉项 2 × ${x} × ${m} 等于多少？`,
              promptEn: `Compute the middle cross-term 2 × ${x} × ${m}:`,
              promptI18n: {
                ja: `中央の項 2 × ${x} × ${m} を計算しなさい：`,
                ko: `가운데 항 2 × ${x} × ${koP(m, "을", "를")} 계산하시오:`,
                ms: `Hitung sebutan tengah 2 × ${x} × ${m}:`,
              },
              hintZh: `2ab 项`,
              hintEn: `2ab term`,
              hintI18n: { ja: `2ab の項`, ko: `2ab 항`, ms: `Sebutan 2ab` },
              expectedAnswer: `${2 * x * m}`,
            },
            {
              promptZh: `加上 ${x}² + ${m}² = ${freshmanTrap}，总和是多少？`,
              promptEn: `Add ${freshmanTrap} + ${2 * x * m}:`,
              promptI18n: {
                ja: `${freshmanTrap} + ${2 * x * m} を計算しなさい：`,
                ko: `${freshmanTrap} + ${koP(2 * x * m, "을", "를")} 계산하시오:`,
                ms: `Tambahkan ${freshmanTrap} + ${2 * x * m}:`,
              },
              hintZh: `完整完全平方值`,
              hintEn: `Total value`,
              hintI18n: { ja: `合計の値`, ko: `전체 값`, ms: `Nilai keseluruhan` },
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${freshmanTrap}`, misconceptionTag: "misc_freshman_dream" },
            { text: `${2 * (x + m)}` },
            { text: `${ans - m}` },
          ],
          misconceptionsByValue: { [`${freshmanTrap}`]: "misc_freshman_dream" },
        };
      }
      break;
    }

    // 13. Rational equations (including harmonic / parallel reciprocal form + domain check)
    case "math_rational_eq": {
      if (dTier === "challenge") {
        // Cross-multiplication rational equation: p / (x - a) = q / (x + b)
        // => p(x + b) = q(x - a) => (p - q)x = -qa - pb => choose q > p so (q - p)x = pb + qa
        const tuples = [
          [1, 3, 2, 4], // 1/(x-3) = 2/(x+4) => x+4 = 2x-6 => x = 10
          [2, 1, 3, 5], // 2/(x-1) = 3/(x+5) => 2x+10 = 3x-3 => x = 13
          [1, 2, 3, 4], // 1/(x-2) = 3/(x+4) => x+4 = 3x-6 => x = 5
          [2, 3, 3, 2], // 2/(x-3) = 3/(x+2) => 2x+4 = 3x-9 => x = 13
          [1, 4, 2, 3], // 1/(x-4) = 2/(x+3) => x+3 = 2x-8 => x = 11
          [3, 2, 4, 3], // 3/(x-2) = 4/(x+3) => 3x+9 = 4x-8 => x = 17
        ] as const;
        const [p, a, q, b] = rng.pick(tuples);
        const xAns = (p * b + q * a) / (q - p);
        const signTrap = formatFrac(q * a - p * b, q - p);
        const noCrossTrap = a + b;
        core = {
          promptZh: `解分式方程并检验分母不为零：${p}/(x - ${a}) = ${q}/(x + ${b})，求 x 的值：`,
          promptEn: `Solve the rational equation (checking for extraneous roots): ${p}/(x - ${a}) = ${q}/(x + ${b})`,
          promptI18n: {
            ja: `分母が 0 になる不適な解（無縁解）に注意して、分数方程式 ${p}/(x - ${a}) = ${q}/(x + ${b}) を解きなさい：`,
            ko: `분모가 0이 되는 무연근에 주의하여 분수방정식 ${p}/(x - ${a}) = ${q}/(x + ${b})을 푸시오:`,
            ms: `Selesaikan persamaan pecahan ${p}/(x - ${a}) = ${q}/(x + ${b}) (semak penyebut tidak sifar):`,
          },
          answer: `${xAns}`,
          explanationZh: `两边同乘最简公分母 (x - ${a})(x + ${b}) 得 ${p}(x + ${b}) = ${q}(x - ${a})，展开得 ${p}x + ${p * b} = ${q}x - ${q * a}，解得 x = ${xAns}。经检验 x ≠ ${a} 且 x ≠ -${b}，非增根。`,
          explanationEn: `Cross-multiplying gives ${p}(x + ${b}) = ${q}(x - ${a}) ⇒ ${p}x + ${p * b} = ${q}x - ${q * a} ⇒ x = ${xAns} (valid since x ≠ ${a}, -${b}).`,
          explanationI18n: {
            ja: `両辺に (x - ${a})(x + ${b}) をかけると ${p}(x + ${b}) = ${q}(x - ${a}) となり、x = ${xAns} です（x ≠ ${a}, -${b} より不適な解ではありません）。`,
            ko: `양변에 (x - ${a})(x + ${b})를 곱하면 ${p}(x + ${b}) = ${q}(x - ${a})에서 x = ${xAns}입니다 (x ≠ ${a}, -${b}이므로 무연근이 아닙니다).`,
            ms: `Darab silang memberikan ${p}(x + ${b}) = ${q}(x - ${a}) ⇒ x = ${xAns} (sah kerana x ≠ ${a}, -${b}).`,
          },
          scaffolds: [
            {
              promptZh: `交叉相乘去分母得 ${p}(x + ${b}) = ${q}(x - ${a})，展开后常数项移到同一边：${p * b} + ${q * a} = ?`,
              promptEn: `Cross-multiply to ${p}(x + ${b}) = ${q}(x - ${a}); combine constants ${p * b} + ${q * a}:`,
              promptI18n: {
                ja: `${p}(x + ${b}) = ${q}(x - ${a}) を展開し、定数項の和 ${p * b} + ${q * a} を求めなさい：`,
                ko: `${p}(x + ${b}) = ${q}(x - ${a})을 전개하여 상수항의 합 ${p * b} + ${koP(q * a, "을", "를")} 구하시오:`,
                ms: `Darab silang kepada ${p}(x + ${b}) = ${q}(x - ${a}); jumlahkan ${p * b} + ${q * a}:`,
              },
              hintZh: `${p * b} + ${q * a}`,
              hintEn: `${p * b} + ${q * a}`,
              expectedAnswer: `${p * b + q * a}`,
            },
            {
              promptZh: `由 ${q - p}x = ${p * b + q * a} 求出 x（并确认分母不为 0）：`,
              promptEn: `Solve ${q - p}x = ${p * b + q * a} for x:`,
              promptI18n: {
                ja: `${q - p}x = ${p * b + q * a} から x の値を求めなさい：`,
                ko: `${q - p}x = ${p * b + q * a}에서 x의 값을 구하시오:`,
                ms: `Selesaikan ${q - p}x = ${p * b + q * a} bagi x:`,
              },
              hintZh: `${p * b + q * a} ÷ ${q - p}`,
              hintEn: `${p * b + q * a} / ${q - p}`,
              expectedAnswer: `${xAns}`,
            },
          ],
          distractors: [
            { text: signTrap, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${noCrossTrap}`, misconceptionTag: "misc_rational_invert_sum" },
            { text: `${a}` },
          ],
          misconceptionsByValue: {
            [signTrap]: "misc_dist_neg_sign",
            [`${noCrossTrap}`]: "misc_rational_invert_sum",
          },
        };
      } else {
        const basicPairs = [
          [3, 6, 2],
          [4, 12, 3],
          [6, 12, 4],
          [5, 20, 4],
          [10, 15, 6],
        ] as const;
        const stdPairs = [
          [6, 30, 5],
          [8, 24, 6],
          [9, 18, 6],
          [12, 24, 8],
          [15, 30, 10],
          [12, 60, 10],
        ] as const;
        const [a, b, ans] = dTier === "standard" ? rng.pick(stdPairs) : rng.pick(basicPairs);
        const sumTrap = a + b;
        core = {
          promptZh: `解分式方程（工程效率 / 并联电阻同构母题）：1/x = 1/${a} + 1/${b}，求 x 的值：`,
          promptEn: `Solve the rational equation for x: 1/x = 1/${a} + 1/${b}`,
          promptI18n: {
            ja: `次の分数方程式を解き、x の値を求めなさい（分母 ≠ 0）：1/x = 1/${a} + 1/${b}`,
            ko: `다음 분수방정식을 풀어 x의 값을 구하시오: 1/x = 1/${a} + 1/${b}`,
            ms: `Selesaikan persamaan pecahan bagi x: 1/x = 1/${a} + 1/${b}`,
          },
          answer: `${ans}`,
          explanationZh: `先通分右边：1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}，两边取倒数得 x = ${ans}（且 x ≠ 0，非增根；切勿把 1/x 当成 x 直接算 ${a} + ${b} = ${sumTrap}！）。`,
          explanationEn: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}, so taking reciprocals gives x = ${ans}.`,
          explanationI18n: {
            ja: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans} なので、両辺の逆数をとると x = ${ans} です（x ≠ 0 より不適な解ではありません）。`,
            ko: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}이므로, 양변의 역수를 취하면 x = ${ans}입니다.`,
            ms: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}, maka dengan mengambil salingan, x = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `先计算右边分数之和 1/${a} + 1/${b}（化为最简分数）：`,
              promptEn: `Add the RHS fractions 1/${a} + 1/${b} in simplest form:`,
              promptI18n: {
                ja: `右辺の分数 1/${a} + 1/${b} を既約分数で計算しなさい：`,
                ko: `우변의 분수 1/${a} + 1/${b}을 기약분수로 계산하시오:`,
                ms: `Tambahkan pecahan di sebelah kanan 1/${a} + 1/${b}:`,
              },
              hintZh: `通分相加`,
              hintEn: `Common denominator`,
              hintI18n: { ja: `通分する`, ko: `통분하기`, ms: `Penyebut sepunya` },
              expectedAnswer: `1/${ans}`,
            },
            {
              promptZh: `既然 1/x = 1/${ans} 且 x ≠ 0，那么 x = ?`,
              promptEn: `Since 1/x = 1/${ans}, find x:`,
              promptI18n: {
                ja: `1/x = 1/${ans} より、x を求めなさい：`,
                ko: `1/x = 1/${ans}이므로 x를 구하시오:`,
                ms: `Oleh sebab 1/x = 1/${ans}, cari x:`,
              },
              hintZh: `两边同时取倒数`,
              hintEn: `Take the reciprocal`,
              hintI18n: { ja: `両辺の逆数をとる`, ko: `양변의 역수를 취하기`, ms: `Ambil salingan` },
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${sumTrap}`, misconceptionTag: "misc_rational_invert_sum" },
            { text: `1/${ans}`, misconceptionTag: "misc_rational_invert_sum" },
            { text: `${b - a}` },
          ],
          misconceptionsByValue: {
            [`${sumTrap}`]: "misc_rational_invert_sum",
            [`1/${ans}`]: "misc_rational_invert_sum",
          },
        };
      }
      break;
    }

    // 14. Radicals & Pythagorean theorem
    case "math_pythagoras": {
      const triples = [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [8, 15, 17],
        [9, 12, 15],
      ] as const;
      const [a, b, c] = rng.pick(triples);
      if (dTier === "challenge") {
        // Two-step challenge: given hypotenuse c and leg a, find the AREA of the right triangle!
        const area = (a * b) / 2;
        const wrongHypArea = (a * c) / 2;
        const forgetHalf = a * b;
        core = {
          promptZh: `在直角三角形中，已知斜边 c = ${c} cm，一条直角边 a = ${a} cm，求该直角三角形的面积（单位 cm²）：`,
          promptEn: `A right triangle has hypotenuse c = ${c} cm and one leg a = ${a} cm. Find its area (in cm²):`,
          promptI18n: {
            ja: `斜辺 c = ${c} cm、他の 1 辺 a = ${a} cm の直角三角形の面積（cm²）を求めなさい：`,
            ko: `빗변 c = ${c} cm, 한 직각변 a = ${a} cm인 직각삼각형의 넓이(cm²)를 구하시오:`,
            ms: `Sebuah segi tiga bersudut tegak mempunyai hipotenus c = ${c} cm dan satu sisi tegak a = ${a} cm. Cari luasnya (dalam cm²):`,
          },
          svgDiagram: svgRightTriangle(`a = ${a}`, `b = ?`, `c = ${c}`),
          answer: `${area}`,
          unit: "cm²",
          explanationZh: `第一步由勾股定理求另一条直角边 b = √(${c}² - ${a}²) = ${b} cm；第二步计算面积 S = ½ × a × b = ½ × ${a} × ${b} = ${area} cm²（切勿误把斜边当高算 ½ × ${a} × ${c} = ${wrongHypArea}）。`,
          explanationEn: `Step 1: Find the other leg b = √(${c}² - ${a}²) = ${b} cm. Step 2: Area = ½ × ${a} × ${b} = ${area} cm².`,
          explanationI18n: {
            ja: `まず三平方の定理より残りの辺 b = √(${c}² - ${a}²) = ${b} cm を求め、面積 ½ × ${a} × ${b} = ${area} cm² を計算します。`,
            ko: `먼저 피타고라스 정리로 다른 직각변 b = √(${c}² - ${a}²) = ${b} cm를 구한 뒤, 넓이 ½ × ${a} × ${b} = ${area} cm²를 구합니다.`,
            ms: `Langkah 1: Cari sisi tegak satu lagi b = √(${c}² - ${a}²) = ${b} cm. Langkah 2: Luas = ½ × ${a} × ${b} = ${area} cm².`,
          },
          scaffolds: [
            {
              promptZh: `第一步：用勾股定理求另一条直角边 b = √(${c}² - ${a}²) = ?`,
              promptEn: `Step 1: Find the unknown leg b = √(${c}² - ${a}²):`,
              promptI18n: {
                ja: `ステップ 1：残りの辺 b = √(${c}² - ${a}²) を求めなさい：`,
                ko: `1단계: 나머지 직각변 b = √(${c}² - ${a}²)의 길이를 구하시오:`,
                ms: `Langkah 1: Cari sisi b = √(${c}² - ${a}²):`,
              },
              hintZh: `√(${c * c} - ${a * a})`,
              hintEn: `√(${c * c} - ${a * a})`,
              expectedAnswer: `${b}`,
            },
            {
              promptZh: `第二步：用两条直角边求面积 ½ × ${a} × ${b} = ?`,
              promptEn: `Step 2: Compute area ½ × ${a} × ${b}:`,
              promptI18n: {
                ja: `ステップ 2：面積 ½ × ${a} × ${b} を計算しなさい：`,
                ko: `2단계: 넓이 ½ × ${a} × ${koP(b, "을", "를")} 계산하시오:`,
                ms: `Langkah 2: Hitung luas ½ × ${a} × ${b}:`,
              },
              hintZh: `(${a} × ${b}) ÷ 2`,
              hintEn: `(${a} × ${b}) / 2`,
              expectedAnswer: `${area}`,
            },
          ],
          distractors: [
            { text: `${wrongHypArea}`, misconceptionTag: "misc_pythag_always_add" },
            { text: `${forgetHalf}`, misconceptionTag: "misc_triangle_forget_half" },
            { text: `${a + b + c}` },
          ],
          misconceptionsByValue: {
            [`${wrongHypArea}`]: "misc_pythag_always_add",
            [`${forgetHalf}`]: "misc_triangle_forget_half",
          },
        };
      } else {
        const scale = dTier === "standard" ? 2 : 1;
        const sa = a * scale;
        const sb = b * scale;
        const sc = c * scale;
        const wrongAddSq = Math.round(Math.sqrt(sa * sa + sc * sc) * 10) / 10;
        core = {
          promptZh: `在直角三角形中，已知斜边 c = ${sc}，一条直角边 a = ${sa}，求另一条直角边 b 的长度：`,
          promptEn: `In a right triangle with hypotenuse c = ${sc} and leg a = ${sa}, find the other leg b:`,
          promptI18n: {
            ja: `斜辺 c = ${sc}、他の 1 辺 a = ${sa} の直角三角形で、残りの辺 b の長さを求めなさい：`,
            ko: `빗변 c = ${sc}, 한 직각변 a = ${sa}인 직각삼각형에서 나머지 한 변 b의 길이를 구하시오:`,
            ms: `Dalam sebuah segi tiga bersudut tegak dengan hipotenus c = ${sc} dan sisi a = ${sa}, cari sisi b yang satu lagi:`,
          },
          svgDiagram: svgRightTriangle(`a = ${sa}`, `b = ?`, `c = ${sc}`),
          answer: `${sb}`,
          explanationZh: `由 a² + b² = c²，求直角边需用减法：b = √(c² - a²) = √(${sc * sc} - ${sa * sa}) = √${sb * sb} = ${sb}（切勿无脑套加法算 c² + a² = ${sc * sc + sa * sa}）。`,
          explanationEn: `Since c = ${sc} is the hypotenuse, b = √(c² - a²) = √(${sc * sc} - ${sa * sa}) = ${sb}.`,
          explanationI18n: {
            ja: `c = ${sc} が斜辺なので、三平方の定理より b = √(c² - a²) = √(${sc * sc} - ${sa * sa}) = ${sb} です。`,
            ko: `c = ${koP(sc, "이", "가")} 빗변이므로 b = √(c² - a²) = √(${sc * sc} - ${sa * sa}) = ${sb}입니다.`,
            ms: `Oleh sebab c = ${sc} ialah hipotenus, b = √(c² - a²) = √(${sc * sc} - ${sa * sa}) = ${sb}.`,
          },
          scaffolds: [
            {
              promptZh: `已知斜边求直角边，先算 c² - a² = ${sc}² - ${sa}² 等于多少？`,
              promptEn: `Compute c² - a² = ${sc}² - ${sa}²:`,
              promptI18n: {
                ja: `c² - a² = ${sc}² - ${sa}² を計算しなさい：`,
                ko: `c² - a² = ${sc}² - ${sa}²의 값을 계산하시오:`,
                ms: `Hitung c² - a² = ${sc}² - ${sa}²:`,
              },
              hintZh: `${sc * sc} - ${sa * sa}`,
              hintEn: `${sc * sc} - ${sa * sa}`,
              expectedAnswer: `${sb * sb}`,
            },
            {
              promptZh: `对 ${sb * sb} 开算术平方根，直角边 b = ?`,
              promptEn: `Take the positive square root √${sb * sb}:`,
              promptI18n: {
                ja: `正の平方根 √${sb * sb} を求めなさい：`,
                ko: `양의 제곱근 √${koP(sb * sb, "을", "를")} 구하시오:`,
                ms: `Ambil punca kuasa dua positif √${sb * sb}:`,
              },
              hintZh: `正边长`,
              hintEn: `Positive root`,
              hintI18n: { ja: `正の平方根`, ko: `양의 제곱근`, ms: `Punca positif` },
              expectedAnswer: `${sb}`,
            },
          ],
          distractors: [
            { text: `√${sc * sc + sa * sa}`, misconceptionTag: "misc_pythag_always_add" },
            { text: `${sc - sa}` },
            { text: `${sb * sb}` },
          ],
          misconceptionsByValue: {
            [`${wrongAddSq}`]: "misc_pythag_always_add",
            [`${sb * sb}`]: "misc_pythag_always_add",
          },
        };
      }
      break;
    }

    // 15. Quadratic equations & completing the square (D = b^2 - 4ac in ja/ko for challenge!)
    case "math_quad_complete_sq": {
      if (dTier === "challenge") {
        // Discriminant / equal-roots parameter challenge: x^2 - 2hx + c = 0 has two equal real roots => D = (-2h)^2 - 4c = 0 => c = h^2
        const h = rng.int(3, 8);
        const bAbs = 2 * h;
        const ans = h * h;
        const linearTrap = bAbs;
        const halfOnlyTrap = h;
        core = {
          promptZh: `若关于 x 的一元二次方程 x² - ${bAbs}x + k = 0 有两个相等的实数根（判别式 Δ = 0），求常数 k 的值：`,
          promptEn: `If the quadratic equation x² - ${bAbs}x + k = 0 has two equal real roots (discriminant b² - 4ac = 0), find the constant k:`,
          promptI18n: {
            ja: `二次方程式 x² - ${bAbs}x + k = 0 が重解をもつ（判別式 D = b² - 4ac = 0 となる）とき、定数 k の値を求めなさい：`,
            ko: `이차방정식 x² - ${bAbs}x + k = 0이 중근을 가질 때(판별식 D = b² - 4ac = 0), 상수 k의 값을 구하시오:`,
            ms: `Jika persamaan kuadratik x² - ${bAbs}x + k = 0 mempunyai dua punca nyata yang sama (pembezalayan b² - 4ac = 0), cari nilai pemalar k:`,
          },
          answer: `${ans}`,
          explanationZh: `由判别式 b² - 4ac = (-${bAbs})² - 4×1×k = 0（或配方为 (x - ${h})² = 0），解得 k = (${bAbs}/2)² = ${h}² = ${ans}。`,
          explanationEn: `Setting discriminant (-${bAbs})² - 4(1)(k) = 0 (or completing the square (x - ${h})² = 0) gives k = ${h}² = ${ans}.`,
          explanationI18n: {
            ja: `判別式 D = (-${bAbs})² - 4×1×k = 0（または平方完成 (x - ${h})² = 0）より、k = ${h}² = ${ans} です。`,
            ko: `판별식 D = (-${bAbs})² - 4×1×k = 0 (또는 완전제곱식 (x - ${h})² = 0)에서 k = ${h}² = ${ans}입니다.`,
            ms: `Daripada pembezalayan (-${bAbs})² - 4(1)(k) = 0, diperoleh k = ${h}² = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `一次项系数一半的绝对值 ${bAbs} ÷ 2 等于多少？`,
              promptEn: `Take half of ${bAbs}:`,
              promptI18n: {
                ja: `x の係数の半分 ${bAbs} ÷ 2 はいくつですか？`,
                ko: `일차항 계수의 절반 ${bAbs} ÷ 2는 얼마입니까?`,
                ms: `Ambil separuh daripada ${bAbs}:`,
              },
              hintZh: `${bAbs} ÷ 2`,
              hintEn: `${bAbs} / 2`,
              expectedAnswer: `${h}`,
            },
            {
              promptZh: `将其平方得到常数项 k = ${h}² = ?`,
              promptEn: `Square ${h} to find k:`,
              promptI18n: {
                ja: `${h} を 2 乗して定数 k を求めなさい：`,
                ko: `${koP(h, "을", "를")} 제곱하여 상수 k를 구하시오:`,
                ms: `Kuasa duakan ${h} untuk mencari k:`,
              },
              hintZh: `${h} × ${h}`,
              hintEn: `${h} × ${h}`,
              expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${halfOnlyTrap}`, misconceptionTag: "misc_quad_drop_neg_root" },
            { text: `${linearTrap}` },
            { text: `${4 * ans}` },
          ],
          misconceptionsByValue: { [`${halfOnlyTrap}`]: "misc_quad_drop_neg_root" },
        };
      } else {
        const h = dTier === "standard" ? rng.int(2, 5) : rng.int(1, 3);
        const r = dTier === "standard" ? rng.int(3, 6) : rng.int(2, 4);
        const bCoef = -2 * h;
        const cCoef = h * h - r * r;
        const r1 = h + r;
        const r2 = h - r;
        const quadStr = formatQuadraticExpr(1, bCoef, cCoef);
        core = {
          promptZh: `用配方法或因式分解解一元二次方程：${quadStr} = 0（若有两根请用逗号隔开，如 a, b）：`,
          promptEn: `Solve the quadratic equation ${quadStr} = 0 (enter both roots separated by a comma):`,
          promptI18n: {
            ja: `二次方程式 ${quadStr} = 0 を解きなさい（2 つの解をコンマで区切って入力）：`,
            ko: `이차방정식 ${quadStr} = 0을 푸시오 (두 근을 쉼표로 구분하여 입력):`,
            ms: `Selesaikan persamaan kuadratik ${quadStr} = 0 (masukkan kedua-dua punca dipisahkan dengan koma):`,
          },
          answer: `${r1}, ${r2}`,
          unorderedMulti: true,
          explanationZh: `配方得 (x - ${h})² = ${r * r}，开平方注意正负双根：x - ${h} = ±${r}，解得 x₁ = ${r1}，x₂ = ${r2}（切勿漏掉负平方根只写 ${r1}！）。`,
          explanationEn: `Completing the square gives (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}.`,
          explanationI18n: {
            ja: `平方完成すると (x - ${h})² = ${r * r} より x - ${h} = ±${r} となるので、解は x = ${r1}, ${r2} です。`,
            ko: `완전제곱식으로 고치면 (x - ${h})² = ${r * r}에서 x - ${h} = ±${r}이므로 두 근은 ${r1}, ${r2}입니다.`,
            ms: `Dengan penyempurnaan kuasa dua, (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}.`,
          },
          scaffolds: [
            {
              promptZh: `配方后方程化为 (x - ${h})² = ?`,
              promptEn: `Complete the square: (x - ${h})² = ?`,
              promptI18n: {
                ja: `平方完成しなさい：(x - ${h})² = ?`,
                ko: `완전제곱식으로 고치시오: (x - ${h})² = ?`,
                ms: `Lengkapkan kuasa dua: (x - ${h})² = ?`,
              },
              hintZh: `移项并两边加 ${h}²`,
              hintEn: `Add ${h}² to ${-cCoef}`,
              hintI18n: {
                ja: `${-cCoef} に ${h}² を加える`,
                ko: `${-cCoef}에 ${h}²을 더하기`,
                ms: `Tambahkan ${h}² kepada ${-cCoef}`,
              },
              expectedAnswer: `${r * r}`,
            },
            {
              promptZh: `开方得 x - ${h} = ±${r}，写出两个根（逗号分隔）：`,
              promptEn: `Solve x - ${h} = ±${r} (comma-separated):`,
              promptI18n: {
                ja: `x - ${h} = ±${r} を解きなさい（コンマで区切る）：`,
                ko: `x - ${h} = ±${r}을 푸시오 (쉼표로 구분):`,
                ms: `Selesaikan x - ${h} = ±${r} (dipisahkan dengan koma):`,
              },
              hintZh: `${r1}, ${r2}`,
              hintEn: `${r1}, ${r2}`,
              expectedAnswer: `${r1}, ${r2}`,
            },
          ],
          distractors: [
            {
              text: `${r1}`,
              textEn: `Only ${r1}`,
              textI18n: { ja: `${r1} のみ`, ko: `${r1}만`, ms: `Hanya ${r1}` },
              misconceptionTag: "misc_quad_drop_neg_root",
            },
            { text: `${-r1}, ${-r2}` },
            { text: `${h + r * r}, ${h - r * r}` },
          ],
          misconceptionsByValue: { [`${r1}`]: "misc_quad_drop_neg_root" },
        };
      }
      break;
    }

    // 16. Quadratic parabola vertex (passes fixedParamC: a + zero k === h collisions + challenge extremum from standard form)
    case "math_quad_parabola": {
      if (dTier === "challenge") {
        // Standard form y = x^2 - 2hx + c => complete square to find minimum value k = c - h^2
        const h = rng.pick([2, 3, 4]);
        const k = rng.pick([-5, -3, -2, 1, 3, 5].filter((v) => v !== h && v !== -h));
        const bCoef = -2 * h;
        const cCoef = h * h + k;
        const stdQuad = formatQuadraticExpr(1, bCoef, cCoef);
        const kSuffix = k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`;
        const addSqTrap = cCoef + h * h;
        core = {
          promptZh: `将二次函数一般式 y = ${stdQuad} 配方为顶点式，求该函数图像的最小值 y_min：`,
          promptEn: `Convert the quadratic function y = ${stdQuad} to vertex form and find its minimum value y_min:`,
          promptI18n: {
            ja: `二次関数 y = ${stdQuad} を平方完成し、最小値を求めなさい：`,
            ko: `이차함수 y = ${stdQuad}을 완전제곱식으로 고쳐 최솟값을 구하시오:`,
            ms: `Tukarkan fungsi kuadratik y = ${stdQuad} kepada bentuk verteks dan cari nilai minimumnya:`,
          },
          latexFormula: `y = ${stdQuad}`,
          svgDiagram: svgParabola(h, k, true),
          answer: `${k}`,
          explanationZh: `配方得 y = (x - ${h})² ${kSuffix}，因为 (x - ${h})² ≥ 0，当 x = ${h} 时取得最小值 y_min = ${k}（勿误把顶点横坐标 ${h} 当作最小值，或加错 ${h}² 得 ${addSqTrap}）。`,
          explanationEn: `Completing the square gives y = (x - ${h})² ${kSuffix}. Since (x - ${h})² ≥ 0, the minimum value is ${k} at x = ${h}.`,
          explanationI18n: {
            ja: `平方完成すると y = (x - ${h})² ${kSuffix} となるので、x = ${h} のとき最小値 ${k} をとります。`,
            ko: `완전제곱식으로 고치면 y = (x - ${h})² ${kSuffix}이므로, x = ${h}일 때 최솟값은 ${k}입니다.`,
            ms: `Penyempurnaan kuasa dua memberikan y = (x - ${h})² ${kSuffix}, maka nilai minimum ialah ${k} apabila x = ${h}.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：对称轴横坐标 x = -b/(2a) = ${2 * h}/2 等于多少？`,
              promptEn: `Step 1: Find the vertex x-coordinate h = ${2 * h} / 2:`,
              promptI18n: {
                ja: `ステップ 1：頂点の x 座標 h = ${2 * h} ÷ 2 を求めなさい：`,
                ko: `1단계: 꼭짓점의 x좌표 h = ${2 * h} ÷ 2를 구하시오:`,
                ms: `Langkah 1: Cari koordinat-x verteks h = ${2 * h} / 2:`,
              },
              hintZh: `${2 * h} ÷ 2`,
              hintEn: `${2 * h} / 2`,
              expectedAnswer: `${h}`,
            },
            {
              promptZh: `第二步：代入 x = ${h} 计算最小值 ${cCoef} - ${h}² = ?`,
              promptEn: `Step 2: Compute minimum value k = ${cCoef} - ${h}²:`,
              promptI18n: {
                ja: `ステップ 2：最小値 k = ${cCoef} - ${h}² を計算しなさい：`,
                ko: `2단계: 최솟값 k = ${cCoef} - ${h}²을 계산하시오:`,
                ms: `Langkah 2: Hitung nilai minimum k = ${cCoef} - ${h}²:`,
              },
              hintZh: `${cCoef} - ${h * h}`,
              hintEn: `${cCoef} - ${h * h}`,
              expectedAnswer: `${k}`,
            },
          ],
          distractors: [
            { text: `${h}`, misconceptionTag: "misc_vertex_h_sign" },
            { text: `${addSqTrap}` },
            { text: `${cCoef}` },
          ],
          misconceptionsByValue: { [`${h}`]: "misc_vertex_h_sign" },
        };
      } else {
        const a = rng.pick([-2, -1, 1, 2]);
        const h = rng.pick([2, 3, 4, 5]);
        const k = rng.pick([-4, -3, -1, 1, 3, 4].filter((v) => v !== h && v !== -h && v !== 2 * h));
        const aPrefix = a === 1 ? "" : a === -1 ? "-" : `${a}`;
        const kSuffix = k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`;
        core = {
          promptZh: `已知二次函数顶点式 y = ${aPrefix}(x - ${h})² ${kSuffix}（图像见下），它的对称轴直线 x = ?（只需填数字）`,
          promptEn: `For the parabola y = ${aPrefix}(x - ${h})² ${kSuffix}, find the x-coordinate of its vertex (axis of symmetry x = ?):`,
          promptI18n: {
            ja: `放物線 y = ${aPrefix}(x - ${h})² ${kSuffix} の軸の方程式 x = ?（頂点の x 座標）を求めなさい：`,
            ko: `포물선 y = ${aPrefix}(x - ${h})² ${kSuffix}의 꼭짓점의 x좌표(축의 방정식 x = ?)를 구하시오:`,
            ms: `Bagi parabola y = ${aPrefix}(x - ${h})² ${kSuffix}, cari koordinat-x bagi verteks (paksi simetri x = ?):`,
          },
          latexFormula: `y = ${aPrefix}(x - ${h})^2 ${kSuffix}`,
          svgDiagram: svgParabola(h, k, a > 0),
          interactiveWidget: {
            kind: "function_probe",
            min: -4,
            max: 8,
            step: 1,
            initialValue: 0,
            fixedParamA: h,
            fixedParamB: k,
            fixedParamC: a,
            captionZh: `拖动 x 观察 y = ${aPrefix}(x - ${h})² ${kSuffix} 何时达到顶点极值`,
            captionEn: `Slide x to explore where y = ${aPrefix}(x - ${h})² ${kSuffix} reaches its vertex extremum`,
            captionI18n: {
              ja: `x を動かして y = ${aPrefix}(x - ${h})² ${kSuffix} が頂点になる位置を探してみましょう`,
              ko: `x를 움직여 y = ${aPrefix}(x - ${h})² ${kSuffix}이 꼭짓점에 도달하는 위치를 찾아보세요`,
              ms: `Gerakkan x untuk melihat kedudukan y = ${aPrefix}(x - ${h})² ${kSuffix} mencapai nilai ekstrem verteks`,
            },
            bindToAnswer: false,
          },
          answer: `${h}`,
          explanationZh: `令平方项 (x - ${h})² = 0 得顶点横坐标 x = ${h}，顶点为 (${h}, ${k})。注意括号内是“- ${h}”，对称轴是 x = +${h} 而非 -${h}！`,
          explanationEn: `Setting (x - ${h})² = 0 gives vertex x-coordinate h = ${h} (watch the sign inside (x - h)²!).`,
          explanationI18n: {
            ja: `(x - ${h})² = 0 とおくと頂点の x 座標は h = ${h} です（(x - h)² のかっこ内の符号に注意しましょう）。`,
            ko: `(x - ${h})² = 0으로 놓으면 꼭짓점의 x좌표는 h = ${h}입니다 ((x - h)² 괄호 안의 부호에 주의하세요).`,
            ms: `Dengan menetapkan (x - ${h})² = 0, koordinat-x verteks ialah h = ${h} (perhatikan tanda di dalam (x - h)²!).`,
          },
          scaffolds: [
            {
              promptZh: `括号内平方项 (x - ${h})² 的底数 x - ${h} 等于多少时，平方项取到 0？`,
              promptEn: `To make (x - ${h})² = 0, what must the expression (x - ${h}) equal?`,
              promptI18n: {
                ja: `(x - ${h})² = 0 にするには、かっこ内の x - ${h} がいくつになればよいですか？`,
                ko: `(x - ${h})² = 0이 되려면 괄호 안의 식 x - ${h}의 값은 얼마여야 합니까?`,
                ms: `Untuk menjadikan (x - ${h})² = 0, apakah nilai bagi (x - ${h})?`,
              },
              hintZh: `0 的平方等于 0`,
              hintEn: `0² = 0`,
              expectedAnswer: `0`,
            },
            {
              promptZh: `由 x - ${h} = 0 解出对称轴横坐标 x = ?`,
              promptEn: `Solve x - ${h} = 0 for x:`,
              promptI18n: {
                ja: `x - ${h} = 0 を解いて x の値を求めなさい：`,
                ko: `x - ${h} = 0을 풀어 x의 값을 구하시오:`,
                ms: `Selesaikan x - ${h} = 0 bagi x:`,
              },
              hintZh: `注意移项变号`,
              hintEn: `Add ${h} to both sides`,
              hintI18n: {
                ja: `両辺に ${h} を足します`,
                ko: `양변에 ${koP(h, "을", "를")} 더합니다`,
                ms: `Tambah ${h} pada kedua-dua belah`,
              },
              expectedAnswer: `${h}`,
            },
          ],
          distractors: [
            { text: `${-h}`, misconceptionTag: "misc_vertex_h_sign" },
            { text: `${k}` },
            { text: `${2 * h}` },
          ],
          misconceptionsByValue: { [`${-h}`]: "misc_vertex_h_sign" },
        };
      }
      break;
    }

    // 17. Right-triangle trigonometry (strictest a/b parity + requireSimplifiedFraction + ko 높이/밑변/빗변 + ms kos θ)
    case "math_trig_right": {
      const triples = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
      ] as const;
      const [opp, adj, hyp] = rng.pick(triples);
      if (dTier === "challenge") {
        // Two-step: ONLY give the two legs opp & adj (hypotenuse unknown!), ask for cos θ (kos θ in ms) as simplest fraction a/b
        const ans = formatFrac(adj, hyp);
        const sinTrap = formatFrac(opp, hyp);
        const tanTrap = formatFrac(opp, adj);
        core = {
          promptZh: `在 Rt△ABC 中，已知锐角 θ 的对边为 ${opp}、邻边为 ${adj}（斜边未知）。求 cos θ 的值（填最简分数 a/b）：`,
          promptEn: `In a right triangle, relative to acute angle θ, opposite = ${opp} and adjacent = ${adj}. First find the hypotenuse, then write cos θ as a simplest fraction a/b:`,
          promptI18n: {
            ja: `直角三角形において、鋭角 θ に対する対辺が ${opp}、隣辺が ${adj} です。斜辺の長さを求めた上で、cos θ の値を既約分数 a/b で答えなさい：`,
            ko: `직각삼각형에서 예각 θ에 대하여 높이(대변) = ${opp}, 밑변(이웃변) = ${adj}입니다. 빗변의 길이를 먼저 구한 뒤, cos θ의 값을 기약분수 a/b로 나타내시오:`,
            ms: `Dalam sebuah segi tiga bersudut tegak, merujuk kepada sudut tirus θ, sisi bertentangan = ${opp} dan sisi bersebelahan = ${adj}. Cari hipotenus dahulu, kemudian nyatakan kos θ (cos θ) sebagai pecahan termudah a/b:`,
          },
          svgDiagram: svgRightTriangle(`opp = ${opp}`, `adj = ${adj}`, `hyp = ?`, `θ`),
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `第一步由勾股定理得斜边 = √(${opp}² + ${adj}²) = ${hyp}；第二步余弦 cos θ = 邻边 / 斜边 = ${ans}。`,
          explanationEn: `Step 1: Hypotenuse = √(${opp}² + ${adj}²) = ${hyp}. Step 2: cos θ = Adjacent / Hypotenuse = ${ans}.`,
          explanationI18n: {
            ja: `三平方の定理より斜辺は √(${opp}² + ${adj}²) = ${hyp} となり、cos θ = 隣辺 / 斜辺 = ${ans} です。`,
            ko: `피타고라스 정리로 빗변 = √(${opp}² + ${adj}²) = ${hyp}이고, cos θ = 밑변 / 빗변 = ${ans}입니다.`,
            ms: `Hipotenus = √(${opp}² + ${adj}²) = ${hyp}, maka kos θ (cos θ) = Sisi bersebelahan / Hipotenus = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `第一步：由勾股定理求斜边 √(${opp}² + ${adj}²) = ?`,
              promptEn: `Step 1: Compute the hypotenuse √(${opp}² + ${adj}²):`,
              promptI18n: {
                ja: `ステップ 1：斜辺 √(${opp}² + ${adj}²) を求めなさい：`,
                ko: `1단계: 빗변의 길이 √(${opp}² + ${adj}²)를 구하시오:`,
                ms: `Langkah 1: Hitung hipotenus √(${opp}² + ${adj}²):`,
              },
              hintZh: `√(${opp * opp} + ${adj * adj})`,
              hintEn: `√(${opp * opp} + ${adj * adj})`,
              expectedAnswer: `${hyp}`,
            },
            {
              promptZh: `第二步：写出 cos θ = 邻边 / 斜边（最简分数 a/b）：`,
              promptEn: `Step 2: Write cos θ = adjacent / hypotenuse in simplest form a/b:`,
              promptI18n: {
                ja: `ステップ 2：cos θ = 隣辺 / 斜辺 を既約分数 a/b で書きなさい：`,
                ko: `2단계: cos θ = 밑변 / 빗변을 기약분수 a/b로 쓰시오:`,
                ms: `Langkah 2: Tulis kos θ = sisi bersebelahan / hipotenus sebagai pecahan termudah a/b:`,
              },
              hintZh: `${adj}/${hyp}`,
              hintEn: `${adj}/${hyp}`,
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: sinTrap, misconceptionTag: "misc_trig_swap_sin_cos" },
            { text: tanTrap, misconceptionTag: "misc_trig_swap_sin_cos" },
            { text: formatFrac(hyp, adj) },
          ],
          misconceptionsByValue: {
            [sinTrap]: "misc_trig_swap_sin_cos",
            [tanTrap]: "misc_trig_swap_sin_cos",
          },
        };
      } else {
        const scale = dTier === "standard" ? 2 : 1;
        const sOpp = opp * scale;
        const sAdj = adj * scale;
        const sHyp = hyp * scale;
        const ans = formatFrac(sOpp, sHyp);
        const cosTrap = formatFrac(sAdj, sHyp);
        const tanTrap = formatFrac(sOpp, sAdj);
        core = {
          promptZh: `如图在 Rt△ABC 中，锐角 θ 的对边为 ${sOpp}、邻边为 ${sAdj}、斜边为 ${sHyp}。求 sin θ 的值（填最简分数 a/b）：`,
          promptEn: `In the right triangle shown, relative to angle θ, opposite = ${sOpp}, adjacent = ${sAdj}, hypotenuse = ${sHyp}. Find sin θ (write as simplest fraction a/b):`,
          promptI18n: {
            ja: `図の直角三角形で、角 θ に対して対辺 = ${sOpp}、隣辺 = ${sAdj}、斜辺 = ${sHyp} です。sin θ の値を既約分数 a/b で求めなさい：`,
            ko: `그림의 직각삼각형에서 각 θ에 대하여 높이(대변) = ${sOpp}, 밑변(이웃변) = ${sAdj}, 빗변 = ${sHyp}입니다. sin θ의 값을 기약분수 a/b로 구하시오:`,
            ms: `Dalam segi tiga bersudut tegak yang ditunjukkan, merujuk kepada sudut θ, sisi bertentangan = ${sOpp}, sisi bersebelahan = ${sAdj}, hipotenus = ${sHyp}. Cari nilai sin θ (tulis sebagai pecahan termudah a/b):`,
          },
          svgDiagram: svgRightTriangle(`opp = ${sOpp}`, `adj = ${sAdj}`, `hyp = ${sHyp}`, `θ`),
          answer: ans,
          requireSimplifiedFraction: true,
          explanationZh: `正弦 sin θ = 对边 / 斜边 = ${sOpp}/${sHyp} = ${ans}（邻边/斜边 = ${cosTrap} 是 cos θ，对边/邻边 = ${tanTrap} 是 tan θ）。`,
          explanationEn: `sin θ = Opposite / Hypotenuse = ${sOpp}/${sHyp} = ${ans} (whereas cos θ = ${cosTrap}).`,
          explanationI18n: {
            ja: `sin θ = 対辺 / 斜辺 = ${sOpp}/${sHyp} = ${ans} です（一方、cos θ = ${cosTrap} です）。`,
            ko: `sin θ = 높이(대변) / 빗변 = ${sOpp}/${sHyp} = ${ans}입니다 (반면 cos θ = ${cosTrap}입니다).`,
            ms: `sin θ = Sisi bertentangan / Hipotenus = ${sOpp}/${sHyp} = ${ans} (manakala kos θ = ${cosTrap}).`,
          },
          scaffolds: [
            {
              promptZh: `确认 SOH 口诀：角 θ 正对的对边长度是多少？`,
              promptEn: `What is the length of the side opposite θ?`,
              promptI18n: {
                ja: `角 θ の向かい側にある対辺の長さはいくつですか？`,
                ko: `각 θ와 마주 보는 높이(대변)의 길이는 얼마입니까?`,
                ms: `Berapakah panjang sisi yang bertentangan dengan θ?`,
              },
              hintZh: `看图中角 θ 正对的直角边`,
              hintEn: `Side opposite θ`,
              hintI18n: { ja: `角 θ の向かい側の辺`, ko: `각 θ와 마주 보는 변`, ms: `Sisi bertentangan dengan θ` },
              expectedAnswer: `${sOpp}`,
            },
            {
              promptZh: `除以斜边 ${sHyp} 并约分为最简分数，sin θ = ?`,
              promptEn: `Divide by hypotenuse ${sHyp} and simplify to lowest terms a/b:`,
              promptI18n: {
                ja: `斜辺 ${sHyp} でわり、既約分数 a/b に約分しなさい：`,
                ko: `빗변 ${koP(sHyp, "으로", "로")} 나누어 기약분수 a/b로 나타내시오:`,
                ms: `Bahagikan dengan hipotenus ${sHyp} dan permudahkan kepada a/b:`,
              },
              hintZh: `${sOpp}/${sHyp} 约分`,
              hintEn: `Reduce ${sOpp}/${sHyp}`,
              hintI18n: {
                ja: `${sOpp}/${sHyp} を約分します`,
                ko: `${sOpp}/${sHyp}를 기약분수로 약분합니다`,
                ms: `Permudahkan ${sOpp}/${sHyp}`,
              },
              expectedAnswer: ans,
            },
          ],
          distractors: [
            { text: cosTrap, misconceptionTag: "misc_trig_swap_sin_cos" },
            { text: tanTrap, misconceptionTag: "misc_trig_swap_sin_cos" },
            { text: formatFrac(sHyp, sOpp) },
          ],
          misconceptionsByValue: {
            [cosTrap]: "misc_trig_swap_sin_cos",
            [tanTrap]: "misc_trig_swap_sin_cos",
          },
        };
      }
      break;
    }

    // 18. Calculus derivative & tangent slope (zero distractor collisions + negative-x challenge)
    case "math_derivative": {
      if (dTier === "challenge") {
        // Evaluate f'(x0) at negative x0 = -2 for f(x) = a x^3 - d x^2 + b x - c
        // f'(x) = 3a x^2 - 2d x + b; at x0 = -2, f'(-2) = 12a + 4d + b
        const a = rng.int(1, 2);
        const d = rng.int(1, 3);
        const b = rng.int(2, 5);
        const c = rng.int(3, 8);
        const slope = 12 * a + 4 * d + b;
        const negSqSignTrap = -12 * a + 4 * d + b; // treated (-2)^2 as -4
        const linearSignTrap = 12 * a - 4 * d + b; // treated -2d(-2) as -4d
        const keepConstTrap = slope - c;
        const aStr = a === 1 ? "" : `${a}`;
        const dStr = d === 1 ? "" : `${d}`;
        core = {
          promptZh: `求三次曲线 f(x) = ${aStr}x³ - ${dStr}x² + ${b}x - ${c} 在点 x = -2 处的切线斜率 f'(-2)：`,
          promptEn: `Find the tangent line slope f'(-2) to the curve f(x) = ${aStr}x³ - ${dStr}x² + ${b}x - ${c} at x = -2:`,
          promptI18n: {
            ja: `曲線 f(x) = ${aStr}x³ - ${dStr}x² + ${b}x - ${c} 上の x = -2 における接線の傾き f'(-2) を求めなさい：`,
            ko: `곡선 f(x) = ${aStr}x³ - ${dStr}x² + ${b}x - ${c} 위의 x = -2인 점에서의 접선의 기울기 f'(-2)를 구하시오:`,
            ms: `Cari kecerunan garis tangen f'(-2) kepada lengkung f(x) = ${aStr}x³ - ${dStr}x² + ${b}x - ${c} pada x = -2:`,
          },
          answer: `${slope}`,
          explanationZh: `求导得 f'(x) = ${3 * a}x² - ${2 * d}x + ${b}（常数项 -${c} 导数为 0）；代入 x = -2，注意 (-2)² = +4 且 -${2 * d}×(-2) = +${4 * d}，得 f'(-2) = ${12 * a} + ${4 * d} + ${b} = ${slope}。`,
          explanationEn: `f'(x) = ${3 * a}x² - ${2 * d}x + ${b}. At x = -2, (-2)² = 4 and -${2 * d}(-2) = +${4 * d}, giving f'(-2) = ${12 * a} + ${4 * d} + ${b} = ${slope}.`,
          explanationI18n: {
            ja: `微分すると f'(x) = ${3 * a}x² - ${2 * d}x + ${b} となり、x = -2 を代入すると ${12 * a} + ${4 * d} + ${b} = ${slope} です。`,
            ko: `미분하면 f'(x) = ${3 * a}x² - ${2 * d}x + ${b}이고, x = -2를 대입하면 ${12 * a} + ${4 * d} + ${b} = ${slope}입니다.`,
            ms: `f'(x) = ${3 * a}x² - ${2 * d}x + ${b}. Pada x = -2, f'(-2) = ${12 * a} + ${4 * d} + ${b} = ${slope}.`,
          },
          scaffolds: [
            {
              promptZh: `在导函数 f'(x) = ${3 * a}x² - ${2 * d}x + ${b} 中，代入 x = -2 时二次项 ${3 * a}×(-2)² 等于多少？`,
              promptEn: `In f'(x) = ${3 * a}x² - ${2 * d}x + ${b}, evaluate ${3 * a} × (-2)²:`,
              promptI18n: {
                ja: `導関数 f'(x) = ${3 * a}x² - ${2 * d}x + ${b} で、${3 * a} × (-2)² の値はいくつですか？`,
                ko: `도함수 f'(x) = ${3 * a}x² - ${2 * d}x + ${b}에서 ${3 * a} × (-2)²의 값은 얼마입니까?`,
                ms: `Dalam f'(x) = ${3 * a}x² - ${2 * d}x + ${b}, nilaikan ${3 * a} × (-2)²:`,
              },
              hintZh: `${3 * a} × 4`,
              hintEn: `${3 * a} × 4`,
              expectedAnswer: `${12 * a}`,
            },
            {
              promptZh: `再加上 -${2 * d}×(-2) + ${b} = ${4 * d + b}，求出 f'(-2)：`,
              promptEn: `Now add ${4 * d + b} to get f'(-2):`,
              promptI18n: {
                ja: `さらに ${4 * d + b} を加えて f'(-2) を求めなさい：`,
                ko: `여기에 ${koP(4 * d + b, "을", "를")} 더하여 f'(-2)를 구하시오:`,
                ms: `Sekarang tambahkan ${4 * d + b} untuk mendapat f'(-2):`,
              },
              hintZh: `${12 * a} + ${4 * d + b}`,
              hintEn: `${12 * a} + ${4 * d + b}`,
              expectedAnswer: `${slope}`,
            },
          ],
          distractors: [
            { text: `${negSqSignTrap}`, misconceptionTag: "misc_neg_square_sign" },
            { text: `${linearSignTrap}`, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${keepConstTrap}`, misconceptionTag: "misc_deriv_const_keep" },
          ],
          misconceptionsByValue: {
            [`${negSqSignTrap}`]: "misc_neg_square_sign",
            [`${linearSignTrap}`]: "misc_dist_neg_sign",
            [`${keepConstTrap}`]: "misc_deriv_const_keep",
          },
        };
      } else {
        const a = rng.int(1, 3);
        const b = rng.int(2, 5);
        const x0 = dTier === "standard" ? rng.pick([2, 3]) : rng.pick([2, 3]);
        // Pick c so f(x0) !== slope and constKeepTrap !== f(x0), guaranteeing zero collisions!
        const slope = 3 * a * x0 * x0 - b;
        const c = rng.pick([4, 5, 7, 8, 9].filter((v) => a * x0 * x0 * x0 - b * x0 + v !== slope));
        const constKeepTrap = slope + c;
        const noDerivPowerTrap = a * x0 * x0 - b;
        const signAddTrap = 3 * a * x0 * x0 + b;
        const aStr = a === 1 ? "" : `${a}`;
        core = {
          promptZh: `求曲线 f(x) = ${aStr}x³ - ${b}x + ${c} 在点 x = ${x0} 处的切线斜率 f'(${x0})：`,
          promptEn: `Find the tangent line slope f'(${x0}) to the curve f(x) = ${aStr}x³ - ${b}x + ${c} at x = ${x0}:`,
          promptI18n: {
            ja: `曲線 f(x) = ${aStr}x³ - ${b}x + ${c} の x = ${x0} における接線の傾き f'(${x0}) を求めなさい：`,
            ko: `곡선 f(x) = ${aStr}x³ - ${b}x + ${c} 위의 x = ${x0}인 점에서의 접선의 기울기 f'(${x0})를 구하시오:`,
            ms: `Cari kecerunan garis tangen f'(${x0}) kepada lengkung f(x) = ${aStr}x³ - ${b}x + ${c} pada x = ${x0}:`,
          },
          answer: `${slope}`,
          explanationZh: `由幂函数求导法则及常数导数为 0：f'(x) = ${3 * a}x² - ${b}；代入 x = ${x0} 得 f'(${x0}) = ${3 * a}×${x0 * x0} - ${b} = ${slope}（切勿保留常数项 +${c} 误得 ${constKeepTrap}）。`,
          explanationEn: `f'(x) = ${3 * a}x² - ${b} (derivative of constant ${c} is 0). At x = ${x0}, f'(${x0}) = ${slope}.`,
          explanationI18n: {
            ja: `f'(x) = ${3 * a}x² - ${b}（定数 ${c} を微分すると 0）なので、x = ${x0} のとき f'(${x0}) = ${slope} です。`,
            ko: `f'(x) = ${3 * a}x² - ${b} (상수 ${koP(c, "을", "를")} 미분하면 0)이므로, x = ${x0}일 때 f'(${x0}) = ${slope}입니다.`,
            ms: `f'(x) = ${3 * a}x² - ${b} (terbitan pemalar ${c} ialah 0). Pada x = ${x0}, f'(${x0}) = ${slope}.`,
          },
          scaffolds: [
            {
              promptZh: `常数项 +${c} 求导后等于多少？`,
              promptEn: `What is the derivative of the constant term +${c}?`,
              promptI18n: {
                ja: `定数項 +${c} を微分するといくつになりますか？`,
                ko: `상수항 +${koP(c, "을", "를")} 미분하면 얼마입니까?`,
                ms: `Apakah terbitan bagi sebutan pemalar +${c}?`,
              },
              hintZh: `水平线变化率为 0`,
              hintEn: `Constant has zero rate of change`,
              hintI18n: { ja: `定数の変化率は 0`, ko: `상수의 변화율은 0`, ms: `Pemalar mempunyai kadar perubahan sifar` },
              expectedAnswer: `0`,
            },
            {
              promptZh: `将 x = ${x0} 代入导函数 f'(x) = ${3 * a}x² - ${b}，计算斜率：`,
              promptEn: `Substitute x = ${x0} into f'(x) = ${3 * a}x² - ${b}:`,
              promptI18n: {
                ja: `導関数 f'(x) = ${3 * a}x² - ${b} に x = ${x0} を代入しなさい：`,
                ko: `도함수 f'(x) = ${3 * a}x² - ${b}에 x = ${koP(x0, "을", "를")} 대입하시오:`,
                ms: `Gantikan x = ${x0} ke dalam f'(x) = ${3 * a}x² - ${b}:`,
              },
              hintZh: `${3 * a}×${x0}² - ${b}`,
              hintEn: `${3 * a}×${x0}² - ${b}`,
              expectedAnswer: `${slope}`,
            },
          ],
          distractors: [
            { text: `${constKeepTrap}`, misconceptionTag: "misc_deriv_const_keep" },
            { text: `${noDerivPowerTrap}` },
            { text: `${signAddTrap}` },
          ],
          misconceptionsByValue: { [`${constKeepTrap}`]: "misc_deriv_const_keep" },
        };
      }
      break;
    }
    // 31–50: Delegate to Phase 2 All-Subject Expansion Generators
    default: {
      const phase2Core =
        generateStemCore(template.generatorKey, rng, dTier) ??
        generatePhase2Core(template.generatorKey, rng, dTier);
      if (phase2Core) {
        core = phase2Core;
      } else {
        throw new Error(`Missing generator implementation for key: ${template.generatorKey}`);
      }
      break;
    }
  }

  return finalizeInstance(rng, template, params.seed, variantIndex, core);
}
