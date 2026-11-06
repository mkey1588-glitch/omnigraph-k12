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
  gcd,
  getCurrency,
  hashSeed,
  svgBarModel,
  svgParabola,
  svgRightTriangle,
  svgTrapezoidOrTriangle,
  type RawGeneratedCore,
} from "./item-generator-shared";

export { DeterministicRng };
export type { RawGeneratedCore };


function finalizeInstance(
  rng: DeterministicRng,
  template: QuestionTemplateSeed,
  seed: string,
  variantIndex: number,
  core: RawGeneratedCore
): GeneratedQuestionInstance {
  const instanceId = `inst_${template.id}_${hashSeed(`${seed}:${variantIndex}`).toString(36)}`;

  let choices: GeneratedChoice[] | undefined;
  let finalAnswer = core.answer;

  if (template.itemType === "choice") {
    const uniqueDistractors: RawGeneratedCore["distractors"] = [];
    const seen = new Set<string>([core.answer.trim().toLowerCase()]);
    for (const d of core.distractors) {
      const k = d.text.trim().toLowerCase();
      if (!seen.has(k) && d.text.trim() !== "") {
        seen.add(k);
        uniqueDistractors.push(d);
      }
      if (uniqueDistractors.length === 3) break;
    }
    let fallbackOffset = 1;
    while (uniqueDistractors.length < 3) {
      const off = fallbackOffset++;
      const baseEn = core.answerEn ?? core.answer;
      uniqueDistractors.push({
        text: `${core.answer} (变式+${off})`,
        textEn: `${baseEn} (alt +${off})`,
        textI18n: {
          ja: `${core.answerI18n?.ja ?? baseEn}（別案 +${off}）`,
          ko: `${core.answerI18n?.ko ?? baseEn} (변형 +${off})`,
          ms: `${core.answerI18n?.ms ?? baseEn} (alternatif +${off})`,
        },
      });
    }

    const pool = rng.shuffle([
      { text: core.unit && !core.answer.includes(core.unit) ? `${core.answer} ${core.unit}` : core.answer, textEn: core.answerEn, textI18n: core.answerI18n, isCorrect: true, misconceptionTag: undefined },
      ...uniqueDistractors.map((d) => ({
        text: core.unit && !d.text.includes(core.unit) && /^-?\d/.test(d.text) ? `${d.text} ${core.unit}` : d.text,
        textEn: d.textEn,
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
    unit: core.unit,
    explanationZh: core.explanationZh,
    explanationEn: core.explanationEn,
    explanationI18n: core.explanationI18n,
    scaffolds: core.scaffolds,
    misconceptionsByValue: core.misconceptionsByValue,
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
            ko: `어떤 자연수를 ${div}(으)로 나누었더니 몫이 ${q}, 나머지가 ${r}이었습니다. 나누어지는 수를 구하시오.`,
            ms: `Apabila suatu integer positif dibahagi dengan ${div}, hasil bahaginya ialah ${q} dan bakinya ialah ${r}. Cari nombor yang dibahagi.`,
          },
          answer: `${total}`,
          explanationZh: `根据被除数 = 商 × 除数 + 余数，得 ${q} × ${div} + ${r} = ${total}（且余数 ${r} < ${div}）。`,
          explanationEn: `Dividend = Quotient × Divisor + Remainder = ${q} × ${div} + ${r} = ${total}.`,
          explanationI18n: {
            ja: `わられる数 = 商 × わる数 + 余り = ${q} × ${div} + ${r} = ${total}（余り ${r} < ${div}）。`,
            ko: `나누어지는 수 = 몫 × 나누는 수 + 나머지 = ${q} × ${div} + ${r} = ${total} (나머지 ${r} < ${div}).`,
            ms: `Nombor yang dibahagi = Hasil bahagi × Pembahagi + Baki = ${q} × ${div} + ${r} = ${total}.`,
          },
          scaffolds: [
            {
              promptZh: `先算整分出去的部分：${q} × ${div} 等于多少？`, promptEn: `First multiply ${q} × ${div}:`,
              promptI18n: { ja: `まず ${q} × ${div} を計算しなさい：`, ko: `먼저 ${q} × ${div}을(를) 계산하시오:`, ms: `Mula-mula darabkan ${q} × ${div}:` },
              hintZh: `计算 ${q} 个 ${div} 的积`, hintEn: `Multiply ${q} by ${div}`,
              hintI18n: { ja: `${q} に ${div} をかける`, ko: `${q}에 ${div}을(를) 곱하기`, ms: `Darabkan ${q} dengan ${div}` },
              expectedAnswer: `${div * q}`,
            },
            {
              promptZh: `再加上剩余的 ${r}，原数是多少？`, promptEn: `Now add the remainder ${r}:`,
              promptI18n: { ja: `次に余りの ${r} を加えなさい：`, ko: `이제 나머지 ${r}을(를) 더하시오:`, ms: `Sekarang tambahkan baki ${r}:` },
              hintZh: `${div * q} + ${r}`, hintEn: `${div * q} + ${r}`, expectedAnswer: `${total}`,
            },
          ],
          distractors: [
            { text: `${div * q - r}`, misconceptionTag: "misc_order_left_to_right" },
            { text: `${wrongR}` },
            { text: `${div * q}` },
          ],
          misconceptionsByValue: { [`${div * q - r}`]: "misc_order_left_to_right" },
        };
      } else {
        const a = rng.int(12, 36);
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
            ja: `たし算よりかけ算を先に計算します：${b} × ${c} = ${b * c}、次に ${a} + ${b * c} = ${ans}。`,
            ko: `덧셈보다 곱셈을 먼저 계산합니다: ${b} × ${c} = ${b * c}, 그다음 ${a} + ${b * c} = ${ans}.`,
            ms: `Darab dahulu sebelum tambah: ${b} × ${c} = ${b * c}, kemudian ${a} + ${b * c} = ${ans}.`,
          },
          scaffolds: [
            {
              promptZh: `加号和乘号同时出现，应先算哪一步的结果？写出 ${b} × ${c} 的值。`, promptEn: `Evaluate ${b} × ${c} first:`,
              promptI18n: { ja: `まず ${b} × ${c} を計算しなさい：`, ko: `먼저 ${b} × ${c}을(를) 계산하시오:`, ms: `Nilaikan ${b} × ${c} dahulu:` },
              hintZh: `先乘后加`, hintEn: `Multiply first`,
              hintI18n: { ja: `かけ算が先`, ko: `곱셈 먼저`, ms: `Darab dahulu` },
              expectedAnswer: `${b * c}`,
            },
            {
              promptZh: `把 ${a} 与刚才的积相加，最终答案是？`, promptEn: `Add ${a} to that product:`,
              promptI18n: { ja: `その積に ${a} を加えなさい：`, ko: `그 곱에 ${a}을(를) 더하시오:`, ms: `Tambahkan ${a} kepada hasil darab itu:` },
              hintZh: `${a} + ${b * c}`, hintEn: `${a} + ${b * c}`, expectedAnswer: `${ans}`,
            },
          ],
          distractors: [
            { text: `${trap}`, misconceptionTag: "misc_order_left_to_right" },
            { text: `${a * b + c}` },
            { text: `${ans + b}` },
          ],
          misconceptionsByValue: { [`${trap}`]: "misc_order_left_to_right" },
        };
      }
      break;
    }

    // 2. Fraction equivalence
    case "math_frac_equiv": {
      const pairs = [
        [2, 3],
        [3, 4],
        [3, 5],
        [4, 7],
        [5, 6],
      ] as const;
      const [p, q] = rng.pick(pairs);
      const k = rng.int(3, 7);
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
          ja: `分母に ${k} をかけている（${q} × ${k} = ${targetDen}）ので、分子にも ${k} をかけます：${p} × ${k} = ${ansNum}。`,
          ko: `분모에 ${k}을(를) 곱했으므로 (${q} × ${k} = ${targetDen}), 분자에도 ${k}을(를) 곱합니다: ${p} × ${k} = ${ansNum}.`,
          ms: `Oleh sebab penyebut didarab dengan ${k} (${q} × ${k} = ${targetDen}), darabkan pengangka dengan ${k}: ${p} × ${k} = ${ansNum}.`,
        },
        scaffolds: [
          {
            promptZh: `分母从 ${q} 扩大到 ${targetDen}，乘了多少倍？`, promptEn: `By what factor did ${q} scale to ${targetDen}?`,
            promptI18n: { ja: `${q} は何倍されて ${targetDen} になりましたか？`, ko: `${q}에 몇을 곱하면 ${targetDen}이(가) 됩니까?`, ms: `${q} didarab dengan faktor berapa untuk menjadi ${targetDen}?` },
            hintZh: `${targetDen} ÷ ${q}`, hintEn: `${targetDen} ÷ ${q}`, expectedAnswer: `${k}`,
          },
          {
            promptZh: `分子 ${p} 同步乘以 ${k} 等于多少？`, promptEn: `Multiply numerator ${p} by ${k}:`,
            promptI18n: { ja: `分子 ${p} に ${k} をかけなさい：`, ko: `분자 ${p}에 ${k}을(를) 곱하시오:`, ms: `Darabkan pengangka ${p} dengan ${k}:` },
            hintZh: `${p} × ${k}`, hintEn: `${p} × ${k}`, expectedAnswer: `${ansNum}`,
          },
        ],
        distractors: [
          { text: `${additiveTrap}`, misconceptionTag: "misc_frac_add_const" },
          { text: `${p}` },
          { text: `${ansNum + q}` },
        ],
        misconceptionsByValue: { [`${additiveTrap}`]: "misc_frac_add_const" },
      };
      break;
    }

    // 3. Fraction add/sub
    case "math_frac_add_sub": {
      const denPairs = [
        [1, 2, 1, 3],
        [1, 3, 1, 4],
        [2, 5, 1, 2],
        [3, 4, 1, 6],
        [2, 3, 1, 5],
      ] as const;
      const [n1, d1, n2, d2] = rng.pick(denPairs);
      const num = n1 * d2 + n2 * d1;
      const den = d1 * d2;
      const ans = formatFrac(num, den);
      const wrongAddDenom = formatFrac(n1 + n2, d1 + d2);
      const lcd = (d1 * d2) / gcd(d1, d2);
      core = {
        promptZh: `计算异分母分数加法（结果化为最简分数 a/b）：${n1}/${d1} + ${n2}/${d2} = ?`,
        promptEn: `Evaluate and simplify to lowest terms: ${n1}/${d1} + ${n2}/${d2} = ?`,
        promptI18n: {
          ja: `次の計算をし、既約分数で答えなさい：${n1}/${d1} + ${n2}/${d2} = ?`,
          ko: `다음을 계산하여 기약분수로 나타내시오: ${n1}/${d1} + ${n2}/${d2} = ?`,
          ms: `Nilaikan dan permudahkan kepada sebutan terendah: ${n1}/${d1} + ${n2}/${d2} = ?`,
        },
        answer: ans,
        explanationZh: `公分母为 ${lcd}：通分后分子相加，最简结果为 ${ans}。切忌将分子分母分别相加写成 ${wrongAddDenom}！`,
        explanationEn: `Using common denominator ${lcd}, convert both fractions and add numerators to get ${ans}.`,
        explanationI18n: {
          ja: `分母を ${lcd} にそろえて通分し、分子どうしをたすと ${ans} になります。`,
          ko: `공통분모 ${lcd}(으)로 통분한 뒤 분자끼리 더하면 ${ans}입니다.`,
          ms: `Dengan penyebut sepunya ${lcd}, tukarkan kedua-dua pecahan dan tambahkan pengangka untuk mendapat ${ans}.`,
        },
        scaffolds: [
          {
            promptZh: `分母 ${d1} 和 ${d2} 的最小公倍数是多少？`, promptEn: `Find the LCM of ${d1} and ${d2}:`,
            promptI18n: { ja: `${d1} と ${d2} の最小公倍数を求めなさい：`, ko: `${d1}과(와) ${d2}의 최소공배수를 구하시오:`, ms: `Cari GSTK bagi ${d1} dan ${d2}:` },
            hintZh: `找最小公分母`, hintEn: `Least common multiple`,
            hintI18n: { ja: `最小公倍数`, ko: `최소공배수`, ms: `Gandaan sepunya terkecil` },
            expectedAnswer: `${lcd}`,
          },
          {
            promptZh: `通分后两分子相加，写出最简分数结果：`, promptEn: `Add the converted fractions in simplest form:`,
            promptI18n: { ja: `通分した分数をたし、既約分数で答えなさい：`, ko: `통분한 분수를 더하여 기약분수로 나타내시오:`, ms: `Tambahkan pecahan yang telah ditukar dalam bentuk termudah:` },
            hintZh: `格式如 a/b`, hintEn: `Write as a/b`,
            hintI18n: { ja: `a/b の形で書く`, ko: `a/b 꼴로 쓰기`, ms: `Tulis sebagai a/b` },
            expectedAnswer: ans,
          },
        ],
        distractors: [
          { text: wrongAddDenom, misconceptionTag: "misc_frac_add_denom" },
          { text: formatFrac(n1 + n2, lcd) },
          { text: formatFrac(num + 1, den) },
        ],
        misconceptionsByValue: { [wrongAddDenom]: "misc_frac_add_denom" },
      };
      break;
    }

    // 4. Fraction mul/div
    case "math_frac_mul_div": {
      const a = rng.pick([2, 3, 4, 5]);
      const b = rng.pick([5, 7, 9]);
      const c = rng.pick([2, 3]);
      const d = rng.pick([4, 5, 8]);
      // Compute (a/b) ÷ (c/d) = (a*d)/(b*c)
      const ans = formatFrac(a * d, b * c);
      const wrongFlipDividend = formatFrac(b * c, a * d);
      const wrongNoFlip = formatFrac(a * c, b * d);
      core = {
        promptZh: `计算分数除法并化简：(${a}/${b}) ÷ (${c}/${d}) = ?`,
        promptEn: `Divide and simplify to lowest terms: (${a}/${b}) ÷ (${c}/${d}) = ?`,
        promptI18n: {
          ja: `次のわり算をし、既約分数で答えなさい：(${a}/${b}) ÷ (${c}/${d}) = ?`,
          ko: `다음 나눗셈을 계산하여 기약분수로 나타내시오: (${a}/${b}) ÷ (${c}/${d}) = ?`,
          ms: `Bahagikan dan permudahkan kepada sebutan terendah: (${a}/${b}) ÷ (${c}/${d}) = ?`,
        },
        answer: ans,
        explanationZh: `除以一个非零分数等于乘它的倒数：(${a}/${b}) × (${d}/${c}) = ${ans}。注意保持被除数 ${a}/${b} 不变，只翻转除数 ${c}/${d}！`,
        explanationEn: `Multiply by the reciprocal of the divisor: (${a}/${b}) × (${d}/${c}) = ${ans}.`,
        explanationI18n: {
          ja: `わる数の逆数をかけます：(${a}/${b}) × (${d}/${c}) = ${ans}。`,
          ko: `나누는 수의 역수를 곱합니다: (${a}/${b}) × (${d}/${c}) = ${ans}.`,
          ms: `Darabkan dengan salingan pembahagi: (${a}/${b}) × (${d}/${c}) = ${ans}.`,
        },
        scaffolds: [
          {
            promptZh: `除数 ${c}/${d} 的倒数是多少？`, promptEn: `What is the reciprocal of ${c}/${d}?`,
            promptI18n: { ja: `${c}/${d} の逆数は何ですか？`, ko: `${c}/${d}의 역수는 무엇입니까?`, ms: `Apakah salingan bagi ${c}/${d}?` },
            hintZh: `交换分子与分母`, hintEn: `Flip numerator and denominator`,
            hintI18n: { ja: `分子と分母を入れかえる`, ko: `분자와 분모를 바꾸기`, ms: `Tukar kedudukan pengangka dan penyebut` },
            expectedAnswer: `${d}/${c}`,
          },
          {
            promptZh: `计算 (${a}/${b}) × (${d}/${c}) 并约分为最简分数：`, promptEn: `Multiply (${a}/${b}) × (${d}/${c}) and simplify:`,
            promptI18n: { ja: `(${a}/${b}) × (${d}/${c}) を計算し、約分しなさい：`, ko: `(${a}/${b}) × (${d}/${c})을(를) 계산하고 약분하시오:`, ms: `Darabkan (${a}/${b}) × (${d}/${c}) dan permudahkan:` },
            hintZh: `分子乘分子，分母乘分母后约分`, hintEn: `Multiply across and reduce`,
            hintI18n: { ja: `分子どうし・分母どうしをかけて約分する`, ko: `분자끼리, 분모끼리 곱한 뒤 약분하기`, ms: `Darab pengangka dengan pengangka, penyebut dengan penyebut, kemudian permudahkan` },
            expectedAnswer: ans,
          },
        ],
        distractors: [
          { text: wrongFlipDividend, misconceptionTag: "misc_flip_dividend" },
          { text: wrongNoFlip, misconceptionTag: "misc_flip_dividend" },
          { text: formatFrac(a * d + 1, b * c) },
        ],
        misconceptionsByValue: {
          [wrongFlipDividend]: "misc_flip_dividend",
          [wrongNoFlip]: "misc_flip_dividend",
        },
      };
      break;
    }

    // 5. Ratio, percentage & Singapore Bar Model
    case "math_ratio_percent": {
      const parts = rng.pick([4, 5, 8]);
      const shaded = rng.int(1, parts - 1);
      const unitVal = rng.int(12, 35);
      const total = parts * unitVal;
      const ans = shaded * unitVal;
      const remainVal = (parts - shaded) * unitVal;
      core = {
        promptZh: `【条形建模与应用】一套科普绘本原价总额为 ${cur}${total}，科技馆研学补贴承担了其中的 ${shaded}/${parts}（见条形图）。补贴金额是多少（无需填货币符号）？`,
        promptEn: `[Bar Model & Ratio] A science book set costs ${cur}${total} in total. A STEM grant covers ${shaded}/${parts} of the cost (see bar model). How much does the grant cover?`,
        promptI18n: {
          ja: `【テープ図と割合】科学の本のセットは全部で ${cur}${total} です。STEM 助成金がその ${shaded}/${parts} を負担します（テープ図を参照）。助成金はいくらですか？`,
          ko: `[막대 모델과 비] 과학책 세트의 전체 가격은 ${cur}${total}입니다. STEM 지원금이 그중 ${shaded}/${parts}을(를) 부담합니다(막대 모델 참고). 지원금은 얼마입니까?`,
          ms: `[Model Bar & Nisbah] Satu set buku sains berharga ${cur}${total} kesemuanya. Geran STEM menanggung ${shaded}/${parts} daripada kos itu (lihat model bar). Berapakah jumlah yang ditanggung oleh geran itu?`,
        },
        svgDiagram: svgBarModel(parts, shaded, total, cur),
        answer: `${ans}`,
        explanationZh: `将总量 ${cur}${total} 平均分成 ${parts} 份，每 1 份代表 ${total} ÷ ${parts} = ${cur}${unitVal}；补贴占 ${shaded} 份，共 ${shaded} × ${unitVal} = ${cur}${ans}。`,
        explanationEn: `1 unit = ${total} ÷ ${parts} = ${unitVal}; ${shaded} units = ${shaded} × ${unitVal} = ${ans}.`,
        explanationI18n: {
          ja: `1 目もり分 = ${total} ÷ ${parts} = ${unitVal}；${shaded} 目もり分 = ${shaded} × ${unitVal} = ${ans}。`,
          ko: `1칸 = ${total} ÷ ${parts} = ${unitVal}; ${shaded}칸 = ${shaded} × ${unitVal} = ${ans}.`,
          ms: `1 unit = ${total} ÷ ${parts} = ${unitVal}; ${shaded} unit = ${shaded} × ${unitVal} = ${ans}.`,
        },
        scaffolds: [
          {
            promptZh: `条形图平均分成 ${parts} 份等于 ${total}，先求 1 份代表多少？`, promptEn: `If ${parts} equal units = ${total}, find 1 unit:`,
            promptI18n: { ja: `等しい ${parts} 目もり分が ${total} のとき、1 目もり分を求めなさい：`, ko: `똑같은 ${parts}칸이 ${total}일 때, 1칸의 값을 구하시오:`, ms: `Jika ${parts} unit yang sama = ${total}, cari nilai 1 unit:` },
            hintZh: `${total} ÷ ${parts}`, hintEn: `${total} ÷ ${parts}`, expectedAnswer: `${unitVal}`,
          },
          {
            promptZh: `补贴占 ${shaded} 份，金额是多少？`, promptEn: `Now find ${shaded} units:`,
            promptI18n: { ja: `次に ${shaded} 目もり分を求めなさい：`, ko: `이제 ${shaded}칸의 값을 구하시오:`, ms: `Sekarang cari nilai ${shaded} unit:` },
            hintZh: `${unitVal} × ${shaded}`, hintEn: `${unitVal} × ${shaded}`, expectedAnswer: `${ans}`,
          },
        ],
        distractors: [
          { text: `${remainVal}`, misconceptionTag: "misc_percent_wrong_base" },
          { text: `${Math.round((total * parts) / shaded)}`, misconceptionTag: "misc_percent_wrong_base" },
          { text: `${unitVal}` },
        ],
        misconceptionsByValue: { [`${remainVal}`]: "misc_percent_wrong_base" },
      };
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
            ja: `台形の面積 = (a + b) × h / 2 = (${a} + ${b}) × ${h} / 2 = ${area} cm²。`,
            ko: `사다리꼴의 넓이 = (a + b) × h / 2 = (${a} + ${b}) × ${h} / 2 = ${area} cm².`,
            ms: `Luas trapezium = (a + b) × h / 2 = (${a} + ${b}) × ${h} / 2 = ${area} cm².`,
          },
          scaffolds: [
            {
              promptZh: `先算上底加下底之和 ${a} + ${b} = ?`, promptEn: `Sum the parallel bases ${a} + ${b}:`,
              promptI18n: { ja: `上底と下底の和 ${a} + ${b} を求めなさい：`, ko: `윗변과 아랫변의 합 ${a} + ${b}을(를) 구하시오:`, ms: `Jumlahkan sisi selari ${a} + ${b}:` },
              hintZh: `上底 + 下底`, hintEn: `Add bases`,
              hintI18n: { ja: `上底 + 下底`, ko: `윗변 + 아랫변`, ms: `Tambah sisi selari` },
              expectedAnswer: `${a + b}`,
            },
            {
              promptZh: `乘以高 ${h} 再除以 2，梯形面积是多少？`, promptEn: `Multiply by ${h} and divide by 2:`,
              promptI18n: { ja: `${h} をかけて 2 でわりなさい：`, ko: `${h}을(를) 곱하고 2로 나누시오:`, ms: `Darab dengan ${h} dan bahagi dengan 2:` },
              hintZh: `(${a + b} × ${h}) ÷ 2`, hintEn: `(${a + b} × ${h}) / 2`, expectedAnswer: `${area}`,
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
        const b = rng.pick([6, 8, 10, 12, 14]);
        const h = rng.int(5, 11);
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
            ja: `三角形の面積 = ½ × 底辺 × 高さ = ½ × ${b} × ${h} = ${area} cm²。`,
            ko: `삼각형의 넓이 = ½ × 밑변 × 높이 = ½ × ${b} × ${h} = ${area} cm².`,
            ms: `Luas segi tiga = ½ × tapak × tinggi = ½ × ${b} × ${h} = ${area} cm².`,
          },
          scaffolds: [
            {
              promptZh: `等底等高平行四边形的面积 b × h 是多少？`, promptEn: `Compute base × height (${b} × ${h}):`,
              promptI18n: { ja: `底辺 × 高さ（${b} × ${h}）を計算しなさい：`, ko: `밑변 × 높이 (${b} × ${h})를 계산하시오:`, ms: `Hitung tapak × tinggi (${b} × ${h}):` },
              hintZh: `${b} × ${h}`, hintEn: `${b} × ${h}`, expectedAnswer: `${forgetHalf}`,
            },
            {
              promptZh: `三角形面积需要除以 2，结果是多少？`, promptEn: `Halve that area for the triangle:`,
              promptI18n: { ja: `三角形の面積は、その半分です。2 でわりなさい：`, ko: `삼각형의 넓이는 그 절반입니다. 2로 나누시오:`, ms: `Bahagi dua luas itu untuk mendapat luas segi tiga:` },
              hintZh: `${forgetHalf} ÷ 2`, hintEn: `${forgetHalf} / 2`, expectedAnswer: `${area}`,
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
      const m = rng.int(2, 5);
      const k = rng.int(3, 9);
      // Evaluate -m^2 + k (note: -m^2 = -(m^2), NOT (-m)^2 = +m^2!)
      const ans = -(m * m) + k;
      const signTrap = m * m + k;
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
          initialValue: -(m * m),
          captionZh: `先在数轴上定位 -${m}² = -${m * m}，再向右平移 +${k} 步探索结果`,
          captionEn: `Locate -${m}² = -${m * m} on the number line, then shift right by +${k}`,
          captionI18n: {
            ja: `数直線上で -${m}² = -${m * m} の位置を見つけ、右へ +${k} だけ移動しよう`,
            ko: `수직선 위에서 -${m}² = -${m * m}의 위치를 찾은 뒤, 오른쪽으로 +${k}만큼 이동해 보자`,
            ms: `Tentukan kedudukan -${m}² = -${m * m} pada garis nombor, kemudian gerak ke kanan sebanyak +${k}`,
          },
          bindToAnswer: template.itemType !== "choice",
        },
        answer: `${ans}`,
        explanationZh: `无括号时乘方优先级高于负号：-${m}² = -(${m} × ${m}) = -${m * m}，再加 ${k} 得 ${ans}。若把 -${m}² 误看作 (-${m})² = +${m * m} 会错得 ${signTrap}。`,
        explanationEn: `Exponentiation binds tighter than unary minus: -${m}² = -(${m * m}), so -${m * m} + ${k} = ${ans}.`,
        explanationI18n: {
          ja: `かっこがないとき、累乗は負の符号より先に計算します：-${m}² = -(${m * m}) なので、-${m * m} + ${k} = ${ans}。`,
          ko: `괄호가 없으면 거듭제곱을 음의 부호보다 먼저 계산합니다: -${m}² = -(${m * m})이므로 -${m * m} + ${k} = ${ans}.`,
          ms: `Kuasa diutamakan berbanding tanda negatif: -${m}² = -(${m * m}), maka -${m * m} + ${k} = ${ans}.`,
        },
        scaffolds: [
          {
            promptZh: `-${m}² 表示“${m} 的平方的相反数”，它的值是多少？`, promptEn: `What is the value of -${m}² (i.e. -(${m}²))?`,
            promptI18n: { ja: `-${m}²（つまり -(${m}²)）の値はいくつですか？`, ko: `-${m}² (즉, -(${m}²))의 값은 얼마입니까?`, ms: `Apakah nilai -${m}² (iaitu -(${m}²))?` },
            hintZh: `负号在平方外`, hintEn: `Negative of ${m * m}`,
            hintI18n: { ja: `${m * m} に負の符号をつけたもの`, ko: `${m * m}에 음의 부호를 붙인 수`, ms: `Negatif bagi ${m * m}` },
            expectedAnswer: `${-(m * m)}`,
          },
          {
            promptZh: `再加上 ${k}，结果是多少？`, promptEn: `Now add ${k}:`,
            promptI18n: { ja: `次に ${k} を加えなさい：`, ko: `이제 ${k}을(를) 더하시오:`, ms: `Sekarang tambahkan ${k}:` },
            hintZh: `-${m * m} + ${k}`, hintEn: `-${m * m} + ${k}`, expectedAnswer: `${ans}`,
          },
        ],
        distractors: [
          { text: `${signTrap}`, misconceptionTag: "misc_neg_square_sign" },
          { text: `${-2 * m + k}` },
          { text: `${-(m * m) - k}` },
        ],
        misconceptionsByValue: { [`${signTrap}`]: "misc_neg_square_sign" },
      };
      break;
    }

    // 8. Algebraic expressions
    case "math_alg_expressions": {
      const a = rng.int(4, 8);
      const b = rng.int(2, 5);
      const c = rng.int(2, 6);
      const d = rng.int(1, 5);
      // Simplify a*x + b - (c*x - d) = (a-c)x + (b+d)
      const coef = a - c;
      const cst = b + d;
      const wrongCst = b - d;
      if (template.itemType === "expression") {
        const exprAns = coef === 1 ? `x + ${cst}` : `${coef}x + ${cst}`;
        const exprWrong = coef === 1 ? `x + ${wrongCst}` : `${coef}x + ${wrongCst}`;
        core = {
          promptZh: `去括号并合并同类项化简代数式：(${a}x + ${b}) - (${c}x - ${d})`,
          promptEn: `Expand brackets and simplify the algebraic expression: (${a}x + ${b}) - (${c}x - ${d})`,
          promptI18n: {
            ja: `かっこをはずして、次の式を簡単にしなさい：(${a}x + ${b}) - (${c}x - ${d})`,
            ko: `괄호를 풀고 다음 식을 간단히 하시오: (${a}x + ${b}) - (${c}x - ${d})`,
            ms: `Kembangkan kurungan dan permudahkan ungkapan algebra: (${a}x + ${b}) - (${c}x - ${d})`,
          },
          answer: exprAns,
          explanationZh: `括号前是“-”号，去括号时括号内每一项都要变号：${a}x + ${b} - ${c}x + ${d} = ${exprAns}。`,
          explanationEn: `Distribute the minus sign to EVERY term inside: ${a}x + ${b} - ${c}x + ${d} = ${exprAns}.`,
          explanationI18n: {
            ja: `かっこの前の「-」は、かっこ内のすべての項の符号を変えます：${a}x + ${b} - ${c}x + ${d} = ${exprAns}。`,
            ko: `괄호 앞의 "-" 부호는 괄호 안의 모든 항의 부호를 바꿉니다: ${a}x + ${b} - ${c}x + ${d} = ${exprAns}.`,
            ms: `Agihkan tanda tolak kepada SETIAP sebutan di dalam kurungan: ${a}x + ${b} - ${c}x + ${d} = ${exprAns}.`,
          },
          scaffolds: [
            {
              promptZh: `去掉 -( ${c}x - ${d} ) 的括号后，常数项 -${d} 变成正还是负？写出带符号的数：`, promptEn: `When distributing -(${c}x - ${d}), what does -(-${d}) become?`,
              promptI18n: { ja: `-(${c}x - ${d}) のかっこをはずすと、-(-${d}) はいくつになりますか？`, ko: `-(${c}x - ${d})의 괄호를 풀 때, -(-${d})은(는) 얼마가 됩니까?`, ms: `Apabila mengagihkan -(${c}x - ${d}), -(-${d}) menjadi apa?` },
              hintZh: `负负得正`, hintEn: `Minus times minus`,
              hintI18n: { ja: `負 × 負 = 正`, ko: `음수 × 음수 = 양수`, ms: `Negatif darab negatif menjadi positif` },
              expectedAnswer: `${d}`,
            },
            {
              promptZh: `合并同类项后写出最简整式：`, promptEn: `Combine like terms for the simplified expression:`,
              promptI18n: { ja: `同類項をまとめて、簡単にした式を書きなさい：`, ko: `동류항끼리 정리하여 간단히 한 식을 쓰시오:`, ms: `Gabungkan sebutan serupa untuk mendapat ungkapan termudah:` },
              hintZh: `形如 kx + m`, hintEn: `Form kx + m`,
              hintI18n: { ja: `kx + m の形`, ko: `kx + m 꼴`, ms: `Bentuk kx + m` },
              expectedAnswer: exprAns,
            },
          ],
          distractors: [{ text: exprWrong, misconceptionTag: "misc_dist_neg_sign" }],
          misconceptionsByValue: { [exprWrong]: "misc_dist_neg_sign" },
        };
      } else {
        const xVal = rng.int(2, 4);
        const valAns = coef * xVal + cst;
        const valWrong = coef * xVal + wrongCst;
        core = {
          promptZh: `先化简整式 (${a}x + ${b}) - (${c}x - ${d})，再求当 x = ${xVal} 时代数式的值：`,
          promptEn: `Simplify (${a}x + ${b}) - (${c}x - ${d}) and evaluate at x = ${xVal}:`,
          promptI18n: {
            ja: `(${a}x + ${b}) - (${c}x - ${d}) を簡単にし、x = ${xVal} のときの式の値を求めなさい：`,
            ko: `(${a}x + ${b}) - (${c}x - ${d})을(를) 간단히 한 뒤, x = ${xVal}일 때의 식의 값을 구하시오:`,
            ms: `Permudahkan (${a}x + ${b}) - (${c}x - ${d}) dan nilaikan apabila x = ${xVal}:`,
          },
          answer: `${valAns}`,
          explanationZh: `去括号变号得 ${coef}x + ${cst}；代入 x = ${xVal} 得 ${coef}×${xVal} + ${cst} = ${valAns}（若漏变 -${d} 的符号会错得 ${valWrong}）。`,
          explanationEn: `Simplifies to ${coef}x + ${cst}; at x = ${xVal}, value = ${valAns}.`,
          explanationI18n: {
            ja: `簡単にすると ${coef}x + ${cst}；x = ${xVal} のとき、式の値は ${valAns}。`,
            ko: `간단히 하면 ${coef}x + ${cst}; x = ${xVal}일 때 식의 값은 ${valAns}.`,
            ms: `Dipermudahkan menjadi ${coef}x + ${cst}; apabila x = ${xVal}, nilainya = ${valAns}.`,
          },
          scaffolds: [
            {
              promptZh: `去括号合并常数项：${b} - (-${d}) 等于多少？`, promptEn: `Combine the constants ${b} - (-${d}):`,
              promptI18n: { ja: `定数項をまとめなさい：${b} - (-${d})`, ko: `상수항을 정리하시오: ${b} - (-${d})`, ms: `Gabungkan pemalar ${b} - (-${d}):` },
              hintZh: `注意负负得正`, hintEn: `${b} + ${d}`, expectedAnswer: `${cst}`,
            },
            {
              promptZh: `代入 x = ${xVal} 计算 ${coef}×${xVal} + ${cst}：`, promptEn: `Evaluate ${coef}×${xVal} + ${cst}:`,
              promptI18n: { ja: `${coef}×${xVal} + ${cst} を計算しなさい：`, ko: `${coef}×${xVal} + ${cst}을(를) 계산하시오:`, ms: `Nilaikan ${coef}×${xVal} + ${cst}:` },
              hintZh: `乘法后加常数`, hintEn: `Substitute x = ${xVal}`,
              hintI18n: { ja: `x = ${xVal} を代入する`, ko: `x = ${xVal}을(를) 대입하기`, ms: `Gantikan x = ${xVal}` },
              expectedAnswer: `${valAns}`,
            },
          ],
          distractors: [
            { text: `${valWrong}`, misconceptionTag: "misc_dist_neg_sign" },
            { text: `${(a + c) * xVal + cst}` },
            { text: `${valAns + d}` },
          ],
          misconceptionsByValue: { [`${valWrong}`]: "misc_dist_neg_sign" },
        };
      }
      break;
    }

    // 9. Linear equation in one variable
    case "math_linear_eq_one": {
      // (x + a)/2 - 1 = b  => x + a - 2 = 2b => x = 2b + 2 - a
      // Trap: forgetting to multiply "- 1" by 2 => x + a - 1 = 2b => x = 2b + 1 - a
      const a = rng.int(1, 5);
      const b = rng.int(2, 6);
      const xAns = 2 * b + 2 - a;
      const xTrap = 2 * b + 1 - a;
      core = {
        promptZh: `解含分母的一元一次方程，求 x 的值：(x + ${a}) / 2 - 1 = ${b}`,
        promptEn: `Solve the linear equation for x: (x + ${a}) / 2 - 1 = ${b}`,
        promptI18n: {
          ja: `次の一次方程式を解き、x の値を求めなさい：(x + ${a}) / 2 - 1 = ${b}`,
          ko: `다음 일차방정식을 풀어 x의 값을 구하시오: (x + ${a}) / 2 - 1 = ${b}`,
          ms: `Selesaikan persamaan linear bagi x: (x + ${a}) / 2 - 1 = ${b}`,
        },
        answer: `${xAns}`,
        explanationZh: `方程两边每一项同乘 2 去分母：(x + ${a}) - 2 = ${2 * b}，解得 x = ${xAns}。注意常数项“-1”也必须乘 2，否则会漏乘错得 ${xTrap}！`,
        explanationEn: `Multiply EVERY term on both sides by 2: (x + ${a}) - 2 = ${2 * b} ⇒ x = ${xAns}.`,
        explanationI18n: {
          ja: `両辺のすべての項に 2 をかけて分母をはらいます：(x + ${a}) - 2 = ${2 * b} ⇒ x = ${xAns}。`,
          ko: `양변의 모든 항에 2를 곱하여 분모를 없앱니다: (x + ${a}) - 2 = ${2 * b} ⇒ x = ${xAns}.`,
          ms: `Darabkan SETIAP sebutan pada kedua-dua belah dengan 2: (x + ${a}) - 2 = ${2 * b} ⇒ x = ${xAns}.`,
        },
        scaffolds: [
          {
            promptZh: `方程两边每一项同乘 2 后，右边的 ${b} 变成多少？`, promptEn: `Multiplying both sides by 2 turns the RHS ${b} into:`,
            promptI18n: { ja: `両辺に 2 をかけると、右辺の ${b} はいくつになりますか：`, ko: `양변에 2를 곱하면 우변의 ${b}은(는) 얼마가 됩니까:`, ms: `Apabila kedua-dua belah didarab dengan 2, ${b} di sebelah kanan menjadi:` },
            hintZh: `${b} × 2`, hintEn: `${b} × 2`, expectedAnswer: `${2 * b}`,
          },
          {
            promptZh: `左边变为 x + ${a} - 2 = ${2 * b}，解出 x = ?`, promptEn: `Solve x + ${a} - 2 = ${2 * b} for x:`,
            promptI18n: { ja: `x + ${a} - 2 = ${2 * b} を解いて x を求めなさい：`, ko: `x + ${a} - 2 = ${2 * b}을(를) 풀어 x를 구하시오:`, ms: `Selesaikan x + ${a} - 2 = ${2 * b} bagi x:` },
            hintZh: `移项计算`, hintEn: `Isolate x`,
            hintI18n: { ja: `移項して x だけを左辺に残す`, ko: `이항하여 x만 남기기`, ms: `Asingkan x` },
            expectedAnswer: `${xAns}`,
          },
        ],
        distractors: [
          { text: `${xTrap}`, misconceptionTag: "misc_eq_skip_const_lcd" },
          { text: `${b + 1 - a}` },
          { text: `${xAns + 2}` },
        ],
        misconceptionsByValue: { [`${xTrap}`]: "misc_eq_skip_const_lcd" },
      };
      break;
    }

    // 10. 2x2 Linear systems
    case "math_linear_systems": {
      const x = rng.int(2, 6);
      const y = rng.int(1, 5);
      // Eq1: x + y = s, Eq2: 2x - y = d  => 3x = s + d
      const s = x + y;
      const d = 2 * x - y;
      const signTrapX = (s - d) / 3;
      core = {
        promptZh: `解二元一次方程组：{ x + y = ${s} ； 2x - y = ${d} }，求 x 的值：`,
        promptEn: `Solve the linear system { x + y = ${s},  2x - y = ${d} }. Find the value of x:`,
        promptI18n: {
          ja: `連立方程式 { x + y = ${s},  2x - y = ${d} } を解き、x の値を求めなさい：`,
          ko: `연립방정식 { x + y = ${s},  2x - y = ${d} }을(를) 풀어 x의 값을 구하시오:`,
          ms: `Selesaikan persamaan linear serentak { x + y = ${s},  2x - y = ${d} }. Cari nilai x:`,
        },
        answer: `${x}`,
        explanationZh: `两式直接相加消去 +y 与 -y：3x = ${s} + (${d}) = ${3 * x}，故 x = ${x}。`,
        explanationEn: `Add the two equations to eliminate y: 3x = ${s + d} ⇒ x = ${x}.`,
        explanationI18n: {
          ja: `2 つの式をたして y を消去します：3x = ${s + d} ⇒ x = ${x}。`,
          ko: `두 식을 더하여 y를 소거합니다: 3x = ${s + d} ⇒ x = ${x}.`,
          ms: `Tambahkan kedua-dua persamaan untuk menghapuskan y: 3x = ${s + d} ⇒ x = ${x}.`,
        },
        scaffolds: [
          {
            promptZh: `将两式左右两边直接相加消去 y，得到 3x 等于多少？`, promptEn: `Add both equations so +y and -y cancel; 3x = ?`,
            promptI18n: { ja: `2 つの式をたして +y と -y を消去すると、3x = ?`, ko: `두 식을 더하여 +y와 -y를 소거하면 3x = ?`, ms: `Tambahkan kedua-dua persamaan supaya +y dan -y terhapus; 3x = ?` },
            hintZh: `${s} + (${d})`, hintEn: `${s} + (${d})`, expectedAnswer: `${3 * x}`,
          },
          {
            promptZh: `两边同除以 3，x = ?`, promptEn: `Divide by 3 to find x:`,
            promptI18n: { ja: `両辺を 3 でわって x を求めなさい：`, ko: `양변을 3으로 나누어 x를 구하시오:`, ms: `Bahagikan dengan 3 untuk mencari x:` },
            hintZh: `${3 * x} ÷ 3`, hintEn: `${3 * x} / 3`, expectedAnswer: `${x}`,
          },
        ],
        distractors: [
          { text: formatFrac(s - d, 3), misconceptionTag: "misc_sys_sub_sign" },
          { text: `${y}` },
          { text: `${x + 1}` },
        ],
        misconceptionsByValue: { [formatFrac(s - d, 3)]: "misc_sys_sub_sign", [`${signTrapX}`]: "misc_sys_sub_sign" },
      };
      break;
    }

    // 11. Linear functions & slope
    case "math_linear_func": {
      const k = rng.pick([-3, -2, 2, 3, 4]);
      const b = rng.int(-4, 5);
      const x1 = 1;
      const y1 = k * x1 + b;
      const x2 = 3;
      const y2 = k * x2 + b;
      const runOverRise = formatFrac(x2 - x1, y2 - y1);
      core = {
        promptZh: `已知一次函数 y = kx + b 的图像经过点 A(${x1}, ${y1}) 和点 B(${x2}, ${y2})，求该直线的斜率 k：`,
        promptEn: `A linear function y = kx + b passes through A(${x1}, ${y1}) and B(${x2}, ${y2}). Find its slope k:`,
        promptI18n: {
          ja: `一次関数 y = kx + b のグラフが点 A(${x1}, ${y1}) と点 B(${x2}, ${y2}) を通ります。傾き k を求めなさい：`,
          ko: `일차함수 y = kx + b의 그래프가 점 A(${x1}, ${y1})과 점 B(${x2}, ${y2})를 지납니다. 기울기 k를 구하시오:`,
          ms: `Suatu fungsi linear y = kx + b melalui A(${x1}, ${y1}) dan B(${x2}, ${y2}). Cari kecerunannya k:`,
        },
        answer: `${k}`,
        explanationZh: `斜率 k = Δy / Δx = (${y2} - (${y1})) / (${x2} - ${x1}) = ${y2 - y1} / 2 = ${k}（切勿把分子分母颠倒写成 Δx/Δy = ${runOverRise}）。`,
        explanationEn: `Slope k = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}.`,
        explanationI18n: {
          ja: `傾き k = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}。`,
          ko: `기울기 k = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}.`,
          ms: `Kecerunan k = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}.`,
        },
        scaffolds: [
          {
            promptZh: `先算纵坐标变化量 Δy = y₂ - y₁ = ${y2} - (${y1}) = ?`, promptEn: `Compute vertical change Δy = ${y2} - (${y1}):`,
            promptI18n: { ja: `y の増加量 Δy = ${y2} - (${y1}) を計算しなさい：`, ko: `y의 증가량 Δy = ${y2} - (${y1})을(를) 계산하시오:`, ms: `Hitung perubahan menegak Δy = ${y2} - (${y1}):` },
            hintZh: `纵坐标相减`, hintEn: `y₂ - y₁`, expectedAnswer: `${y2 - y1}`,
          },
          {
            promptZh: `再除以横坐标变化量 Δx = ${x2} - ${x1} = 2，斜率 k = ?`, promptEn: `Divide by Δx = 2 to get slope k:`,
            promptI18n: { ja: `Δx = 2 でわって傾き k を求めなさい：`, ko: `Δx = 2로 나누어 기울기 k를 구하시오:`, ms: `Bahagikan dengan Δx = 2 untuk mendapat kecerunan k:` },
            hintZh: `Δy ÷ 2`, hintEn: `Δy / 2`, expectedAnswer: `${k}`,
          },
        ],
        distractors: [
          { text: runOverRise, misconceptionTag: "misc_slope_run_over_rise" },
          { text: `${-k}`, misconceptionTag: "misc_slope_run_over_rise" },
          { text: `${b}` },
        ],
        misconceptionsByValue: { [runOverRise]: "misc_slope_run_over_rise" },
      };
      break;
    }

    // 12. Special products & factoring
    case "math_special_products": {
      const m = rng.int(2, 6);
      if (template.itemType === "expression") {
        const exprAns = `x^2 + ${2 * m}x + ${m * m}`;
        const exprTrap = `x^2 + ${m * m}`;
        core = {
          promptZh: `运用完全平方公式展开整式：(x + ${m})²`,
          promptEn: `Expand the perfect square expression: (x + ${m})²`,
          promptI18n: {
            ja: `乗法公式を使って展開しなさい：(x + ${m})²`,
            ko: `곱셈 공식을 이용하여 전개하시오: (x + ${m})²`,
            ms: `Kembangkan ungkapan kuasa dua sempurna: (x + ${m})²`,
          },
          answer: exprAns,
          explanationZh: `(x + ${m})² = x² + 2·x·${m} + ${m}² = ${exprAns}。切忌漏掉中间交叉项 ${2 * m}x 误写成 ${exprTrap}！`,
          explanationEn: `(x + ${m})² = x² + ${2 * m}x + ${m * m}. Never drop the middle term ${2 * m}x!`,
          explanationI18n: {
            ja: `(x + ${m})² = x² + ${2 * m}x + ${m * m}。真ん中の項 ${2 * m}x を絶対に落とさないこと！`,
            ko: `(x + ${m})² = x² + ${2 * m}x + ${m * m}. 가운데 항 ${2 * m}x를 절대 빠뜨리지 마시오!`,
            ms: `(x + ${m})² = x² + ${2 * m}x + ${m * m}. Jangan sekali-kali tertinggal sebutan tengah ${2 * m}x!`,
          },
          scaffolds: [
            {
              promptZh: `完全平方公式 (a+b)² = a² + 2ab + b² 中，交叉项 2·x·${m} 的系数是多少？`, promptEn: `What is the coefficient of x in the middle term 2·x·${m}?`,
              promptI18n: { ja: `真ん中の項 2·x·${m} の x の係数はいくつですか？`, ko: `가운데 항 2·x·${m}에서 x의 계수는 얼마입니까?`, ms: `Apakah pekali x dalam sebutan tengah 2·x·${m}?` },
              hintZh: `2 × ${m}`, hintEn: `2 × ${m}`, expectedAnswer: `${2 * m}`,
            },
            {
              promptZh: `写出完整展开后的二次三项式：`, promptEn: `Write the full expanded trinomial:`,
              promptI18n: { ja: `展開した式をすべて書きなさい：`, ko: `전개한 식을 모두 쓰시오:`, ms: `Tulis trinomial yang dikembangkan sepenuhnya:` },
              hintZh: `x^2 + ${2 * m}x + ${m * m}`, hintEn: `x^2 + ${2 * m}x + ${m * m}`, expectedAnswer: exprAns,
            },
          ],
          distractors: [{ text: exprTrap, misconceptionTag: "misc_freshman_dream" }],
          misconceptionsByValue: { [exprTrap]: "misc_freshman_dream" },
        };
      } else {
        const x = rng.int(3, 6);
        const ans = (x + m) * (x + m);
        const freshmanTrap = x * x + m * m;
        core = {
          promptZh: `已知 x = ${x}，利用完全平方结构计算 (x + ${m})² 的值（注意对比 x² + ${m}² 的区别）：`,
          promptEn: `Given x = ${x}, evaluate (x + ${m})² = x² + ${2 * m}x + ${m * m}:`,
          promptI18n: {
            ja: `x = ${x} のとき、(x + ${m})² = x² + ${2 * m}x + ${m * m} の値を求めなさい：`,
            ko: `x = ${x}일 때, (x + ${m})² = x² + ${2 * m}x + ${m * m}의 값을 구하시오:`,
            ms: `Diberi x = ${x}, nilaikan (x + ${m})² = x² + ${2 * m}x + ${m * m}:`,
          },
          answer: `${ans}`,
          explanationZh: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans}。若漏掉中间项 2ab 只算 x² + ${m}² 会误得 ${freshmanTrap}。`,
          explanationEn: `(${x} + ${m})² = ${x + m}² = ${ans} (whereas x² + ${m}² = ${freshmanTrap} misses 2·${x}·${m}).`,
          explanationI18n: {
            ja: `(${x} + ${m})² = ${x + m}² = ${ans}（x² + ${m}² = ${freshmanTrap} では 2·${x}·${m} が抜けています）。`,
            ko: `(${x} + ${m})² = ${x + m}² = ${ans} (x² + ${m}² = ${freshmanTrap}은(는) 2·${x}·${m}이(가) 빠진 값입니다).`,
            ms: `(${x} + ${m})² = ${x + m}² = ${ans} (manakala x² + ${m}² = ${freshmanTrap} tertinggal 2·${x}·${m}).`,
          },
          scaffolds: [
            {
              promptZh: `中间交叉项 2 × ${x} × ${m} 等于多少？`, promptEn: `Compute the middle term 2 × ${x} × ${m}:`,
              promptI18n: { ja: `真ん中の項 2 × ${x} × ${m} を計算しなさい：`, ko: `가운데 항 2 × ${x} × ${m}을(를) 계산하시오:`, ms: `Hitung sebutan tengah 2 × ${x} × ${m}:` },
              hintZh: `2ab 项`, hintEn: `2ab term`,
              hintI18n: { ja: `2ab の項`, ko: `2ab 항`, ms: `Sebutan 2ab` },
              expectedAnswer: `${2 * x * m}`,
            },
            {
              promptZh: `加上 ${x}² + ${m}² = ${freshmanTrap}，总和是多少？`, promptEn: `Add ${freshmanTrap} + ${2 * x * m}:`,
              promptI18n: { ja: `${freshmanTrap} + ${2 * x * m} を計算しなさい：`, ko: `${freshmanTrap} + ${2 * x * m}을(를) 계산하시오:`, ms: `Tambahkan ${freshmanTrap} + ${2 * x * m}:` },
              hintZh: `完整完全平方值`, hintEn: `Total value`,
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

    // 13. Rational equations (including harmonic / parallel reciprocal form!)
    case "math_rational_eq": {
      const pairs = [
        [3, 6, 2],
        [4, 12, 3],
        [6, 12, 4],
        [5, 20, 4],
        [10, 15, 6],
      ] as const;
      const [a, b, ans] = rng.pick(pairs);
      const sumTrap = a + b;
      core = {
        promptZh: `解分式方程（工程效率 / 并联电阻同构母题）：1/x = 1/${a} + 1/${b}，求 x 的值：`,
        promptEn: `Solve the rational equation for x: 1/x = 1/${a} + 1/${b}`,
        promptI18n: {
          ja: `次の分数方程式を解き、x の値を求めなさい：1/x = 1/${a} + 1/${b}`,
          ko: `다음 분수방정식을 풀어 x의 값을 구하시오: 1/x = 1/${a} + 1/${b}`,
          ms: `Selesaikan persamaan pecahan bagi x: 1/x = 1/${a} + 1/${b}`,
        },
        answer: `${ans}`,
        explanationZh: `先通分右边：1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}，两边取倒数得 x = ${ans}（切勿把 1/x 当成 x 直接算 ${a} + ${b} = ${sumTrap}！）。`,
        explanationEn: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}, so taking reciprocals gives x = ${ans}.`,
        explanationI18n: {
          ja: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans} なので、両辺の逆数をとって x = ${ans}。`,
          ko: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}이므로, 양변의 역수를 취하면 x = ${ans}.`,
          ms: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}, maka dengan mengambil salingan, x = ${ans}.`,
        },
        scaffolds: [
          {
            promptZh: `先计算右边分数之和 1/${a} + 1/${b}（化为最简分数）：`, promptEn: `Add the RHS fractions 1/${a} + 1/${b}:`,
            promptI18n: { ja: `右辺の分数 1/${a} + 1/${b} を計算しなさい：`, ko: `우변의 분수 1/${a} + 1/${b}을(를) 계산하시오:`, ms: `Tambahkan pecahan di sebelah kanan 1/${a} + 1/${b}:` },
            hintZh: `通分相加`, hintEn: `Common denominator`,
            hintI18n: { ja: `通分する`, ko: `통분하기`, ms: `Penyebut sepunya` },
            expectedAnswer: `1/${ans}`,
          },
          {
            promptZh: `既然 1/x = 1/${ans} 且 x ≠ 0，那么 x = ?`, promptEn: `Since 1/x = 1/${ans}, find x:`,
            promptI18n: { ja: `1/x = 1/${ans} より、x を求めなさい：`, ko: `1/x = 1/${ans}이므로 x를 구하시오:`, ms: `Oleh sebab 1/x = 1/${ans}, cari x:` },
            hintZh: `两边同时取倒数`, hintEn: `Take the reciprocal`,
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
      // Ask for unknown leg b given hypotenuse c and leg a -> tests misc_pythag_always_add!
      const wrongAddSq = Math.round(Math.sqrt(a * a + c * c) * 10) / 10;
      core = {
        promptZh: `在直角三角形中，已知斜边 c = ${c}，一条直角边 a = ${a}，求另一条直角边 b 的长度：`,
        promptEn: `In a right triangle with hypotenuse c = ${c} and leg a = ${a}, find the other leg b:`,
        promptI18n: {
          ja: `斜辺 c = ${c}、他の 1 辺 a = ${a} の直角三角形で、残りの辺 b の長さを求めなさい：`,
          ko: `빗변 c = ${c}, 한 변 a = ${a}인 직각삼각형에서 나머지 한 변 b의 길이를 구하시오:`,
          ms: `Dalam sebuah segi tiga bersudut tegak dengan hipotenus c = ${c} dan sisi a = ${a}, cari sisi b yang satu lagi:`,
        },
        svgDiagram: svgRightTriangle(`a = ${a}`, `b = ?`, `c = ${c}`),
        answer: `${b}`,
        explanationZh: `由 a² + b² = c²，求直角边需用减法：b = √(c² - a²) = √(${c * c} - ${a * a}) = √${b * b} = ${b}（切勿无脑套加法算 c² + a² = ${c * c + a * a}）。`,
        explanationEn: `Since c = ${c} is the hypotenuse, b = √(c² - a²) = √(${c * c} - ${a * a}) = ${b}.`,
        explanationI18n: {
          ja: `c = ${c} が斜辺なので、b = √(c² - a²) = √(${c * c} - ${a * a}) = ${b}。`,
          ko: `c = ${c}이(가) 빗변이므로 b = √(c² - a²) = √(${c * c} - ${a * a}) = ${b}.`,
          ms: `Oleh sebab c = ${c} ialah hipotenus, b = √(c² - a²) = √(${c * c} - ${a * a}) = ${b}.`,
        },
        scaffolds: [
          {
            promptZh: `已知斜边求直角边，先算 c² - a² = ${c}² - ${a}² 等于多少？`, promptEn: `Compute c² - a² = ${c}² - ${a}²:`,
            promptI18n: { ja: `c² - a² = ${c}² - ${a}² を計算しなさい：`, ko: `c² - a² = ${c}² - ${a}²을(를) 계산하시오:`, ms: `Hitung c² - a² = ${c}² - ${a}²:` },
            hintZh: `${c * c} - ${a * a}`, hintEn: `${c * c} - ${a * a}`, expectedAnswer: `${b * b}`,
          },
          {
            promptZh: `对 ${b * b} 开算术平方根，直角边 b = ?`, promptEn: `Take the positive square root √${b * b}:`,
            promptI18n: { ja: `正の平方根 √${b * b} を求めなさい：`, ko: `양의 제곱근 √${b * b}을(를) 구하시오:`, ms: `Ambil punca kuasa dua positif √${b * b}:` },
            hintZh: `正边长`, hintEn: `Positive root`,
            hintI18n: { ja: `正の平方根`, ko: `양의 제곱근`, ms: `Punca positif` },
            expectedAnswer: `${b}`,
          },
        ],
        distractors: [
          { text: `√${c * c + a * a}`, misconceptionTag: "misc_pythag_always_add" },
          { text: `${c - a}` },
          { text: `${b * b}` },
        ],
        misconceptionsByValue: {
          [`${wrongAddSq}`]: "misc_pythag_always_add",
          [`${b * b}`]: "misc_pythag_always_add",
        },
      };
      break;
    }

    // 15. Quadratic equations & completing the square
    case "math_quad_complete_sq": {
      const h = rng.int(1, 4);
      const r = rng.int(2, 5);
      // (x - h)^2 = r^2 => x1 = h + r, x2 = h - r
      // Expand: x^2 - 2hx + (h^2 - r^2) = 0
      const bCoef = -2 * h;
      const cCoef = h * h - r * r;
      const r1 = h + r;
      const r2 = h - r;
      const bStr = bCoef < 0 ? `- ${Math.abs(bCoef)}x` : `+ ${bCoef}x`;
      const cStr = cCoef < 0 ? `- ${Math.abs(cCoef)}` : `+ ${cCoef}`;
      core = {
        promptZh: `用配方法或因式分解解一元二次方程：x² ${bStr} ${cStr} = 0（若有两根请用逗号隔开，如 a, b）：`,
        promptEn: `Solve the quadratic equation x² ${bStr} ${cStr} = 0 (enter both roots separated by a comma):`,
        promptI18n: {
          ja: `二次方程式 x² ${bStr} ${cStr} = 0 を解きなさい（2 つの解をコンマで区切って入力）：`,
          ko: `이차방정식 x² ${bStr} ${cStr} = 0을 푸시오 (두 근을 쉼표로 구분하여 입력):`,
          ms: `Selesaikan persamaan kuadratik x² ${bStr} ${cStr} = 0 (masukkan kedua-dua punca dipisahkan dengan koma):`,
        },
        answer: `${r1}, ${r2}`,
        unorderedMulti: true,
        explanationZh: `配方得 (x - ${h})² = ${r * r}，开平方注意正负双根：x - ${h} = ±${r}，解得 x₁ = ${r1}，x₂ = ${r2}（切勿漏掉负平方根只写 ${r1}！）。`,
        explanationEn: `Completing the square gives (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}.`,
        explanationI18n: {
          ja: `平方完成すると (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}。`,
          ko: `완전제곱식으로 고치면 (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}.`,
          ms: `Dengan penyempurnaan kuasa dua, (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}.`,
        },
        scaffolds: [
          {
            promptZh: `配方后方程化为 (x - ${h})² = ?`, promptEn: `Complete the square: (x - ${h})² = ?`,
            promptI18n: { ja: `平方完成しなさい：(x - ${h})² = ?`, ko: `완전제곱식으로 고치시오: (x - ${h})² = ?`, ms: `Lengkapkan kuasa dua: (x - ${h})² = ?` },
            hintZh: `移项并两边加 ${h}²`, hintEn: `Add ${h}² to ${-cCoef}`,
            hintI18n: { ja: `${-cCoef} に ${h}² を加える`, ko: `${-cCoef}에 ${h}²을(를) 더하기`, ms: `Tambahkan ${h}² kepada ${-cCoef}` },
            expectedAnswer: `${r * r}`,
          },
          {
            promptZh: `开方得 x - ${h} = ±${r}，写出两个根（逗号分隔）：`, promptEn: `Solve x - ${h} = ±${r} (comma-separated):`,
            promptI18n: { ja: `x - ${h} = ±${r} を解きなさい（コンマで区切る）：`, ko: `x - ${h} = ±${r}을(를) 푸시오 (쉼표로 구분):`, ms: `Selesaikan x - ${h} = ±${r} (dipisahkan dengan koma):` },
            hintZh: `${r1}, ${r2}`, hintEn: `${r1}, ${r2}`, expectedAnswer: `${r1}, ${r2}`,
          },
        ],
        distractors: [
          {
            text: `${r1}`, textEn: `Only ${r1}`,
            textI18n: { ja: `${r1} のみ`, ko: `${r1}만`, ms: `Hanya ${r1}` },
            misconceptionTag: "misc_quad_drop_neg_root",
          },
          { text: `${-r1}, ${-r2}` },
          { text: `${h + r * r}, ${h - r * r}` },
        ],
        misconceptionsByValue: { [`${r1}`]: "misc_quad_drop_neg_root" },
      };
      break;
    }

    // 16. Quadratic parabola vertex
    case "math_quad_parabola": {
      const a = rng.pick([-2, -1, 1, 2]);
      const h = rng.pick([2, 3, 4, 5]);
      const k = rng.int(-3, 4);
      const aPrefix = a === 1 ? "" : a === -1 ? "-" : `${a}`;
      const kSuffix = k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`;
      core = {
        promptZh: `已知二次函数顶点式 y = ${aPrefix}(x - ${h})² ${kSuffix}（图像见下），它的对称轴直线 x = ?（只需填数字）`,
        promptEn: `For the parabola y = ${aPrefix}(x - ${h})² ${kSuffix}, find the x-coordinate of its vertex / axis of symmetry x = ?`,
        promptI18n: {
          ja: `放物線 y = ${aPrefix}(x - ${h})² ${kSuffix} の頂点の x 座標（軸の方程式 x = ?）を求めなさい：`,
          ko: `포물선 y = ${aPrefix}(x - ${h})² ${kSuffix}의 꼭짓점의 x좌표(축의 방정식 x = ?)를 구하시오:`,
          ms: `Bagi parabola y = ${aPrefix}(x - ${h})² ${kSuffix}, cari koordinat-x bagi verteks / paksi simetri x = ?`,
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
          captionZh: `拖动 x 观察 (x - ${h})² + (${k}) 何时达到极值点`,
          captionEn: `Slide x to find where (x - ${h})² reaches 0`,
          captionI18n: {
            ja: `x を動かして、(x - ${h})² が 0 になる位置を探そう`,
            ko: `x를 움직여 (x - ${h})²이 0이 되는 위치를 찾아보자`,
            ms: `Gerakkan x untuk mencari kedudukan (x - ${h})² mencapai 0`,
          },
          bindToAnswer: false,
        },
        answer: `${h}`,
        explanationZh: `令平方项 (x - ${h})² = 0 得顶点横坐标 x = ${h}，顶点为 (${h}, ${k})。注意括号内是“- ${h}”，对称轴是 x = +${h} 而非 -${h}！`,
        explanationEn: `Setting (x - ${h})² = 0 gives vertex x-coordinate h = ${h} (watch the sign inside (x - h)²!).`,
        explanationI18n: {
          ja: `(x - ${h})² = 0 とおくと、頂点の x 座標は h = ${h}（(x - h)² のかっこ内の符号に注意！）。`,
          ko: `(x - ${h})² = 0으로 놓으면 꼭짓점의 x좌표는 h = ${h} ((x - h)² 괄호 안의 부호에 주의!).`,
          ms: `Dengan menetapkan (x - ${h})² = 0, koordinat-x verteks ialah h = ${h} (perhatikan tanda di dalam (x - h)²!).`,
        },
        scaffolds: [
          {
            promptZh: `当 x 取什么值时，平方项 (x - ${h})² 恰好取最小值 0？`, promptEn: `What value of x makes (x - ${h})² = 0?`,
            promptI18n: { ja: `(x - ${h})² = 0 となる x の値はいくつですか？`, ko: `(x - ${h})² = 0이 되는 x의 값은 얼마입니까?`, ms: `Apakah nilai x yang menjadikan (x - ${h})² = 0?` },
            hintZh: `解 x - ${h} = 0`, hintEn: `Solve x - ${h} = 0`,
            hintI18n: { ja: `x - ${h} = 0 を解く`, ko: `x - ${h} = 0을 풀기`, ms: `Selesaikan x - ${h} = 0` },
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
      break;
    }

    // 17. Right-triangle trigonometry
    case "math_trig_right": {
      const triples = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
      ] as const;
      const [opp, adj, hyp] = rng.pick(triples);
      const ans = formatFrac(opp, hyp);
      const cosTrap = formatFrac(adj, hyp);
      const tanTrap = formatFrac(opp, adj);
      core = {
        promptZh: `如图在 Rt△ABC 中，锐角 θ 的对边为 ${opp}、邻边为 ${adj}、斜边为 ${hyp}。求 sin θ 的值（最简分数 a/b）：`,
        promptEn: `In the right triangle shown, relative to angle θ, opposite = ${opp}, adjacent = ${adj}, hypotenuse = ${hyp}. Find sin θ:`,
        promptI18n: {
          ja: `図の直角三角形で、角 θ に対して対辺 = ${opp}、隣辺 = ${adj}、斜辺 = ${hyp} です。sin θ の値を求めなさい：`,
          ko: `그림의 직각삼각형에서 각 θ에 대하여 대변 = ${opp}, 이웃변 = ${adj}, 빗변 = ${hyp}입니다. sin θ의 값을 구하시오:`,
          ms: `Dalam segi tiga bersudut tegak yang ditunjukkan, merujuk kepada sudut θ, sisi bertentangan = ${opp}, sisi bersebelahan = ${adj}, hipotenus = ${hyp}. Cari sin θ:`,
        },
        svgDiagram: svgRightTriangle(`opp = ${opp}`, `adj = ${adj}`, `hyp = ${hyp}`, `θ`),
        answer: ans,
        explanationZh: `正弦 sin θ = 对边 / 斜边 = ${ans}（邻边/斜边 = ${cosTrap} 是 cos θ，对边/邻边 = ${tanTrap} 是 tan θ）。`,
        explanationEn: `sin θ = Opposite / Hypotenuse = ${ans} (whereas cos θ = ${cosTrap}).`,
        explanationI18n: {
          ja: `sin θ = 対辺 / 斜辺 = ${ans}（一方、cos θ = ${cosTrap}）。`,
          ko: `sin θ = 대변 / 빗변 = ${ans} (반면 cos θ = ${cosTrap}).`,
          ms: `sin θ = Sisi bertentangan / Hipotenus = ${ans} (manakala cos θ = ${cosTrap}).`,
        },
        scaffolds: [
          {
            promptZh: `确认 SOH 口诀：sin θ 的分子是角 θ 的哪条边长？`, promptEn: `What is the length of the side opposite θ?`,
            promptI18n: { ja: `角 θ の対辺の長さはいくつですか？`, ko: `각 θ의 대변의 길이는 얼마입니까?`, ms: `Berapakah panjang sisi yang bertentangan dengan θ?` },
            hintZh: `看图中角 θ 正对的直角边`, hintEn: `Side opposite θ`,
            hintI18n: { ja: `角 θ の向かい側の辺`, ko: `각 θ와 마주 보는 변`, ms: `Sisi bertentangan dengan θ` },
            expectedAnswer: `${opp}`,
          },
          {
            promptZh: `除以斜边 ${hyp}，sin θ = ?`, promptEn: `Divide by hypotenuse ${hyp}:`,
            promptI18n: { ja: `斜辺 ${hyp} でわりなさい：`, ko: `빗변 ${hyp}(으)로 나누시오:`, ms: `Bahagikan dengan hipotenus ${hyp}:` },
            hintZh: `${opp}/${hyp}`, hintEn: `${opp}/${hyp}`, expectedAnswer: ans,
          },
        ],
        distractors: [
          { text: cosTrap, misconceptionTag: "misc_trig_swap_sin_cos" },
          { text: tanTrap, misconceptionTag: "misc_trig_swap_sin_cos" },
          { text: formatFrac(hyp, opp) },
        ],
        misconceptionsByValue: {
          [cosTrap]: "misc_trig_swap_sin_cos",
          [tanTrap]: "misc_trig_swap_sin_cos",
        },
      };
      break;
    }

    // 18. Calculus derivative & tangent slope
    case "math_derivative": {
      const a = rng.int(1, 3);
      const b = rng.int(2, 5);
      const c = rng.int(3, 9);
      const x0 = rng.int(1, 3);
      // f(x) = a*x^3 - b*x + c => f'(x) = 3a*x^2 - b
      const slope = 3 * a * x0 * x0 - b;
      const constKeepTrap = slope + c;
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
          ja: `f'(x) = ${3 * a}x² - ${b}（定数 ${c} を微分すると 0）。x = ${x0} のとき、f'(${x0}) = ${slope}。`,
          ko: `f'(x) = ${3 * a}x² - ${b} (상수 ${c}을(를) 미분하면 0). x = ${x0}일 때 f'(${x0}) = ${slope}.`,
          ms: `f'(x) = ${3 * a}x² - ${b} (terbitan pemalar ${c} ialah 0). Pada x = ${x0}, f'(${x0}) = ${slope}.`,
        },
        scaffolds: [
          {
            promptZh: `常数项 +${c} 求导后等于多少？`, promptEn: `What is the derivative of the constant term +${c}?`,
            promptI18n: { ja: `定数項 +${c} を微分するといくつですか？`, ko: `상수항 +${c}을(를) 미분하면 얼마입니까?`, ms: `Apakah terbitan bagi sebutan pemalar +${c}?` },
            hintZh: `水平线变化率为 0`, hintEn: `Constant has zero rate of change`,
            hintI18n: { ja: `定数の変化率は 0`, ko: `상수의 변화율은 0`, ms: `Pemalar mempunyai kadar perubahan sifar` },
            expectedAnswer: `0`,
          },
          {
            promptZh: `将 x = ${x0} 代入导函数 f'(x) = ${3 * a}x² - ${b}，计算斜率：`, promptEn: `Substitute x = ${x0} into f'(x) = ${3 * a}x² - ${b}:`,
            promptI18n: { ja: `導関数 f'(x) = ${3 * a}x² - ${b} に x = ${x0} を代入しなさい：`, ko: `도함수 f'(x) = ${3 * a}x² - ${b}에 x = ${x0}을(를) 대입하시오:`, ms: `Gantikan x = ${x0} ke dalam f'(x) = ${3 * a}x² - ${b}:` },
            hintZh: `${3 * a}×${x0}² - ${b}`, hintEn: `${3 * a}×${x0}² - ${b}`, expectedAnswer: `${slope}`,
          },
        ],
        distractors: [
          { text: `${constKeepTrap}`, misconceptionTag: "misc_deriv_const_keep" },
          { text: `${a * x0 * x0 * x0 - b * x0 + c}` },
          { text: `${3 * a * x0 * x0 + b}` },
        ],
        misconceptionsByValue: { [`${constKeepTrap}`]: "misc_deriv_const_keep" },
      };
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
