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

/**
 * Deterministic 32-bit FNV-1a hash + Mulberry32 PRNG
 */
function hashSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class DeterministicRng {
  private state: number;
  constructor(seedText: string) {
    this.state = hashSeed(seedText) || 123456789;
  }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffle<T>(arr: readonly T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

function formatFrac(num: number, den: number): string {
  const g = gcd(num, den);
  const s = den < 0 ? -1 : 1;
  const n = (num * s) / g;
  const d = (den * s) / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

function getCurrency(regionCode: RegionCode): string {
  const found = REGIONS_DATA.find((r) => r.code === regionCode);
  return found?.notation.currencySymbol ?? "¥";
}

// ==================== CLEAN-ROOM INLINE SVG GENERATORS ====================

function svgBarModel(partsTotal: number, shadedParts: number, totalValue: number, currency: string): string {
  const w = 320;
  const boxW = Math.floor(240 / partsTotal);
  const rects = Array.from({ length: partsTotal }, (_, idx) => {
    const x = 30 + idx * boxW;
    const filled = idx < shadedParts;
    return `<rect x="${x}" y="34" width="${boxW}" height="28" fill="${
      filled ? "rgba(99,102,241,0.28)" : "rgba(148,163,184,0.12)"
    }" stroke="currentColor" stroke-width="1.5"/>`;
  }).join("");
  const shadedWidth = shadedParts * boxW;
  return `<svg viewBox="0 0 ${w} 96" class="w-full max-w-sm h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <text x="30" y="22" font-size="11" fill="currentColor">Total = ${currency}${totalValue} (${partsTotal} units)</text>
    ${rects}
    <path d="M 30 70 L ${30 + shadedWidth} 70" stroke="#6366f1" stroke-width="2"/>
    <text x="${30 + shadedWidth / 2}" y="86" text-anchor="middle" font-size="11" fill="#6366f1" font-weight="600">${shadedParts}/${partsTotal} = ?</text>
  </svg>`;
}

function svgRightTriangle(aLabel: string, bLabel: string, cLabel: string, angleLabel?: string): string {
  return `<svg viewBox="0 0 260 150" class="w-full max-w-xs h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <polygon points="45,120 205,120 45,28" fill="rgba(99,102,241,0.10)" stroke="currentColor" stroke-width="2"/>
    <polyline points="45,106 59,106 59,120" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="125" y="138" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">${bLabel}</text>
    <text x="24" y="78" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">${aLabel}</text>
    <text x="138" y="66" text-anchor="middle" font-size="12" fill="#6366f1" font-weight="700">${cLabel}</text>
    ${angleLabel ? `<text x="172" y="114" font-size="11" fill="#ec4899" font-weight="700">${angleLabel}</text>` : ""}
  </svg>`;
}

function svgTrapezoidOrTriangle(mode: "triangle" | "trapezoid", b1: number, b2: number, h: number): string {
  if (mode === "triangle") {
    return `<svg viewBox="0 0 260 135" class="w-full max-w-xs h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="35,110 225,110 115,25" fill="rgba(16,185,129,0.12)" stroke="currentColor" stroke-width="2"/>
      <line x1="115" y1="25" x2="115" y2="110" stroke="#10b981" stroke-width="1.6" stroke-dasharray="4 3"/>
      <text x="130" y="128" text-anchor="middle" font-size="12" fill="currentColor">b = ${b1} cm</text>
      <text x="142" y="74" font-size="12" fill="#10b981" font-weight="600">h = ${h} cm</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 260 135" class="w-full max-w-xs h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <polygon points="75,30 185,30 225,110 35,110" fill="rgba(16,185,129,0.12)" stroke="currentColor" stroke-width="2"/>
    <line x1="85" y1="30" x2="85" y2="110" stroke="#10b981" stroke-width="1.6" stroke-dasharray="4 3"/>
    <text x="130" y="22" text-anchor="middle" font-size="11" fill="currentColor">a = ${b1} cm</text>
    <text x="130" y="128" text-anchor="middle" font-size="11" fill="currentColor">b = ${b2} cm</text>
    <text x="112" y="74" font-size="11" fill="#10b981" font-weight="600">h = ${h} cm</text>
  </svg>`;
}

function svgParabola(h: number, k: number, opensUp: boolean): string {
  const vx = 130 + h * 12;
  const vy = 78 - k * 8;
  const path = opensUp
    ? `M ${vx - 55} ${vy - 52} Q ${vx} ${vy + 52} ${vx + 55} ${vy - 52}`
    : `M ${vx - 55} ${vy + 52} Q ${vx} ${vy - 52} ${vx + 55} ${vy + 52}`;
  return `<svg viewBox="0 0 260 150" class="w-full max-w-xs h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="78" x2="240" y2="78" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
    <line x1="130" y1="12" x2="130" y2="140" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
    <line x1="${vx}" y1="14" x2="${vx}" y2="138" stroke="#6366f1" stroke-dasharray="4 3" stroke-width="1.2"/>
    <path d="${path}" fill="none" stroke="#6366f1" stroke-width="2.4"/>
    <circle cx="${vx}" cy="${vy}" r="3.5" fill="#ec4899"/>
    <text x="${vx + 8}" y="${vy + (opensUp ? 14 : -8)}" font-size="11" fill="#ec4899" font-weight="600">V(${h}, ${k})</text>
  </svg>`;
}

function svgForceDiagram(massKg: number, pullN: number, frictionN: number): string {
  return `<svg viewBox="0 0 290 120" class="w-full max-w-sm h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="92" x2="270" y2="92" stroke="currentColor" stroke-width="2"/>
    <rect x="105" y="48" width="76" height="44" rx="5" fill="rgba(245,158,11,0.18)" stroke="currentColor" stroke-width="2"/>
    <text x="143" y="74" text-anchor="middle" font-size="12" fill="currentColor" font-weight="700">${massKg} kg</text>
    <line x1="181" y1="70" x2="248" y2="70" stroke="#10b981" stroke-width="2.5"/>
    <polygon points="248,65 258,70 248,75" fill="#10b981"/>
    <text x="220" y="58" text-anchor="middle" font-size="11" fill="#10b981" font-weight="700">F = ${pullN} N</text>
    <line x1="105" y1="70" x2="46" y2="70" stroke="#ef4444" stroke-width="2.5"/>
    <polygon points="46,65 36,70 46,75" fill="#ef4444"/>
    <text x="68" y="58" text-anchor="middle" font-size="11" fill="#ef4444" font-weight="700">f = ${frictionN} N</text>
  </svg>`;
}

function svgCircuit(mode: "series" | "parallel", r1Label: string, r2Label: string, sourceLabel: string): string {
  if (mode === "series") {
    return `<svg viewBox="0 0 290 130" class="w-full max-w-sm h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="26" width="220" height="78" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="72" y="18" width="54" height="16" fill="#1e293b" stroke="#6366f1" stroke-width="2"/>
      <text x="99" y="13" text-anchor="middle" font-size="11" fill="#6366f1" font-weight="700">${r1Label}</text>
      <rect x="164" y="18" width="54" height="16" fill="#1e293b" stroke="#6366f1" stroke-width="2"/>
      <text x="191" y="13" text-anchor="middle" font-size="11" fill="#6366f1" font-weight="700">${r2Label}</text>
      <circle cx="145" cy="104" r="13" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
      <text x="145" y="108" text-anchor="middle" font-size="10" fill="#f59e0b" font-weight="700">${sourceLabel}</text>
    </svg>`;
  }
  return `<svg viewBox="0 0 290 140" class="w-full max-w-sm h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="22" width="210" height="96" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="70" y1="66" x2="220" y2="66" stroke="currentColor" stroke-width="2"/>
    <line x1="70" y1="22" x2="70" y2="66" stroke="currentColor" stroke-width="2"/>
    <line x1="220" y1="22" x2="220" y2="66" stroke="currentColor" stroke-width="2"/>
    <rect x="115" y="14" width="60" height="16" fill="#1e293b" stroke="#6366f1" stroke-width="2"/>
    <text x="145" y="11" text-anchor="middle" font-size="11" fill="#6366f1" font-weight="700">${r1Label}</text>
    <rect x="115" y="58" width="60" height="16" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
    <text x="145" y="88" text-anchor="middle" font-size="11" fill="#10b981" font-weight="700">${r2Label}</text>
    <text x="145" y="132" text-anchor="middle" font-size="11" fill="#f59e0b" font-weight="700">U = ${sourceLabel}</text>
  </svg>`;
}

export interface RawGeneratedCore {
  promptZh: string;
  promptEn: string;
  latexFormula?: string;
  svgDiagram?: string;
  interactiveWidget?: InteractiveWidgetConfig;
  answer: string;
  answerEn?: string;
  acceptedEquivalents?: string[];
  unorderedMulti?: boolean;
  unit?: string;
  explanationZh: string;
  explanationEn: string;
  scaffolds: ScaffoldStep[];
  distractors: Array<{ text: string; textEn?: string; misconceptionTag?: string }>;
  misconceptionsByValue?: Record<string, string>;
}

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
    const uniqueDistractors: Array<{ text: string; textEn?: string; misconceptionTag?: string }> = [];
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
      uniqueDistractors.push({
        text: `${core.answer} (变式+${off})`,
        textEn: `${core.answerEn ?? core.answer} (alt +${off})`,
      });
    }

    const pool = rng.shuffle([
      { text: core.unit && !core.answer.includes(core.unit) ? `${core.answer} ${core.unit}` : core.answer, textEn: core.answerEn, isCorrect: true, misconceptionTag: undefined },
      ...uniqueDistractors.map((d) => ({
        text: core.unit && !d.text.includes(core.unit) && /^-?\d/.test(d.text) ? `${d.text} ${core.unit}` : d.text,
        textEn: d.textEn,
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
          answer: `${total}`,
          explanationZh: `根据被除数 = 商 × 除数 + 余数，得 ${q} × ${div} + ${r} = ${total}（且余数 ${r} < ${div}）。`,
          explanationEn: `Dividend = Quotient × Divisor + Remainder = ${q} × ${div} + ${r} = ${total}.`,
          scaffolds: [
            { promptZh: `先算整分出去的部分：${q} × ${div} 等于多少？`, promptEn: `First multiply ${q} × ${div}:`, hintZh: `计算 ${q} 个 ${div} 的积`, hintEn: `Multiply ${q} by ${div}`, expectedAnswer: `${div * q}` },
            { promptZh: `再加上剩余的 ${r}，原数是多少？`, promptEn: `Now add the remainder ${r}:`, hintZh: `${div * q} + ${r}`, hintEn: `${div * q} + ${r}`, expectedAnswer: `${total}` },
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
          answer: `${ans}`,
          explanationZh: `遵循先乘除后加减：先算 ${b} × ${c} = ${b * c}，再算 ${a} + ${b * c} = ${ans}。若直接从左往右算会误得 ${trap}。`,
          explanationEn: `Multiply before adding: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${ans}.`,
          scaffolds: [
            { promptZh: `加号和乘号同时出现，应先算哪一步的结果？写出 ${b} × ${c} 的值。`, promptEn: `Evaluate ${b} × ${c} first:`, hintZh: `先乘后加`, hintEn: `Multiply first`, expectedAnswer: `${b * c}` },
            { promptZh: `把 ${a} 与刚才的积相加，最终答案是？`, promptEn: `Add ${a} to that product:`, hintZh: `${a} + ${b * c}`, hintEn: `${a} + ${b * c}`, expectedAnswer: `${ans}` },
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
        answer: `${ansNum}`,
        explanationZh: `分母从 ${q} 变为 ${targetDen} 乘了 ${k} 倍，分子 ${p} 也必须同乘 ${k} 得 ${ansNum}（不能同加 ${targetDen - q} 误算成 ${additiveTrap}）。`,
        explanationEn: `Since the denominator is multiplied by ${k} (${q} × ${k} = ${targetDen}), multiply the numerator by ${k}: ${p} × ${k} = ${ansNum}.`,
        scaffolds: [
          { promptZh: `分母从 ${q} 扩大到 ${targetDen}，乘了多少倍？`, promptEn: `By what factor did ${q} scale to ${targetDen}?`, hintZh: `${targetDen} ÷ ${q}`, hintEn: `${targetDen} ÷ ${q}`, expectedAnswer: `${k}` },
          { promptZh: `分子 ${p} 同步乘以 ${k} 等于多少？`, promptEn: `Multiply numerator ${p} by ${k}:`, hintZh: `${p} × ${k}`, hintEn: `${p} × ${k}`, expectedAnswer: `${ansNum}` },
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
        answer: ans,
        explanationZh: `公分母为 ${lcd}：通分后分子相加，最简结果为 ${ans}。切忌将分子分母分别相加写成 ${wrongAddDenom}！`,
        explanationEn: `Using common denominator ${lcd}, convert both fractions and add numerators to get ${ans}.`,
        scaffolds: [
          { promptZh: `分母 ${d1} 和 ${d2} 的最小公倍数是多少？`, promptEn: `Find the LCM of ${d1} and ${d2}:`, hintZh: `找最小公分母`, hintEn: `Least common multiple`, expectedAnswer: `${lcd}` },
          { promptZh: `通分后两分子相加，写出最简分数结果：`, promptEn: `Add the converted fractions in simplest form:`, hintZh: `格式如 a/b`, hintEn: `Write as a/b`, expectedAnswer: ans },
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
        answer: ans,
        explanationZh: `除以一个非零分数等于乘它的倒数：(${a}/${b}) × (${d}/${c}) = ${ans}。注意保持被除数 ${a}/${b} 不变，只翻转除数 ${c}/${d}！`,
        explanationEn: `Multiply by the reciprocal of the divisor: (${a}/${b}) × (${d}/${c}) = ${ans}.`,
        scaffolds: [
          { promptZh: `除数 ${c}/${d} 的倒数是多少？`, promptEn: `What is the reciprocal of ${c}/${d}?`, hintZh: `交换分子与分母`, hintEn: `Flip numerator and denominator`, expectedAnswer: `${d}/${c}` },
          { promptZh: `计算 (${a}/${b}) × (${d}/${c}) 并约分为最简分数：`, promptEn: `Multiply (${a}/${b}) × (${d}/${c}) and simplify:`, hintZh: `分子乘分子，分母乘分母后约分`, hintEn: `Multiply across and reduce`, expectedAnswer: ans },
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
        svgDiagram: svgBarModel(parts, shaded, total, cur),
        answer: `${ans}`,
        explanationZh: `将总量 ${cur}${total} 平均分成 ${parts} 份，每 1 份代表 ${total} ÷ ${parts} = ${cur}${unitVal}；补贴占 ${shaded} 份，共 ${shaded} × ${unitVal} = ${cur}${ans}。`,
        explanationEn: `1 unit = ${total} ÷ ${parts} = ${unitVal}; ${shaded} units = ${shaded} × ${unitVal} = ${ans}.`,
        scaffolds: [
          { promptZh: `条形图平均分成 ${parts} 份等于 ${total}，先求 1 份代表多少？`, promptEn: `If ${parts} equal units = ${total}, find 1 unit:`, hintZh: `${total} ÷ ${parts}`, hintEn: `${total} ÷ ${parts}`, expectedAnswer: `${unitVal}` },
          { promptZh: `补贴占 ${shaded} 份，金额是多少？`, promptEn: `Now find ${shaded} units:`, hintZh: `${unitVal} × ${shaded}`, hintEn: `${unitVal} × ${shaded}`, expectedAnswer: `${ans}` },
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
          svgDiagram: svgTrapezoidOrTriangle("trapezoid", a, b, h),
          answer: `${area}`,
          unit: "cm²",
          explanationZh: `梯形面积 S = (a + b) × h ÷ 2 = (${a} + ${b}) × ${h} ÷ 2 = ${area} cm²（勿漏除以 2 误得 ${forgetHalf}）。`,
          explanationEn: `Area = (a + b) × h / 2 = (${a} + ${b}) × ${h} / 2 = ${area} cm².`,
          scaffolds: [
            { promptZh: `先算上底加下底之和 ${a} + ${b} = ?`, promptEn: `Sum the parallel bases ${a} + ${b}:`, hintZh: `上底 + 下底`, hintEn: `Add bases`, expectedAnswer: `${a + b}` },
            { promptZh: `乘以高 ${h} 再除以 2，梯形面积是多少？`, promptEn: `Multiply by ${h} and divide by 2:`, hintZh: `(${a + b} × ${h}) ÷ 2`, hintEn: `(${a + b} × ${h}) / 2`, expectedAnswer: `${area}` },
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
          svgDiagram: svgTrapezoidOrTriangle("triangle", b, 0, h),
          answer: `${area}`,
          unit: "cm²",
          explanationZh: `三角形是等底等高平行四边形的一半：S = ½ × ${b} × ${h} = ${area} cm²（漏乘 ½ 会误算成 ${forgetHalf}）。`,
          explanationEn: `Triangle area = ½ × base × height = ½ × ${b} × ${h} = ${area} cm².`,
          scaffolds: [
            { promptZh: `等底等高平行四边形的面积 b × h 是多少？`, promptEn: `Compute base × height (${b} × ${h}):`, hintZh: `${b} × ${h}`, hintEn: `${b} × ${h}`, expectedAnswer: `${forgetHalf}` },
            { promptZh: `三角形面积需要除以 2，结果是多少？`, promptEn: `Halve that area for the triangle:`, hintZh: `${forgetHalf} ÷ 2`, hintEn: `${forgetHalf} / 2`, expectedAnswer: `${area}` },
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
        latexFormula: `-${m}^2 + ${k}`,
        interactiveWidget: {
          kind: "number_line_slider",
          min: -25,
          max: 25,
          step: 1,
          initialValue: -(m * m),
          captionZh: `先在数轴上定位 -${m}² = -${m * m}，再向右平移 +${k} 步探索结果`,
          captionEn: `Locate -${m}² = -${m * m} on the number line, then shift right by +${k}`,
          bindToAnswer: template.itemType !== "choice",
        },
        answer: `${ans}`,
        explanationZh: `无括号时乘方优先级高于负号：-${m}² = -(${m} × ${m}) = -${m * m}，再加 ${k} 得 ${ans}。若把 -${m}² 误看作 (-${m})² = +${m * m} 会错得 ${signTrap}。`,
        explanationEn: `Exponentiation binds tighter than unary minus: -${m}² = -(${m * m}), so -${m * m} + ${k} = ${ans}.`,
        scaffolds: [
          { promptZh: `-${m}² 表示“${m} 的平方的相反数”，它的值是多少？`, promptEn: `What is the value of -${m}² (i.e. -(${m}²))?`, hintZh: `负号在平方外`, hintEn: `Negative of ${m * m}`, expectedAnswer: `${-(m * m)}` },
          { promptZh: `再加上 ${k}，结果是多少？`, promptEn: `Now add ${k}:`, hintZh: `-${m * m} + ${k}`, hintEn: `-${m * m} + ${k}`, expectedAnswer: `${ans}` },
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
          answer: exprAns,
          explanationZh: `括号前是“-”号，去括号时括号内每一项都要变号：${a}x + ${b} - ${c}x + ${d} = ${exprAns}。`,
          explanationEn: `Distribute the minus sign to EVERY term inside: ${a}x + ${b} - ${c}x + ${d} = ${exprAns}.`,
          scaffolds: [
            { promptZh: `去掉 -( ${c}x - ${d} ) 的括号后，常数项 -${d} 变成正还是负？写出带符号的数：`, promptEn: `When distributing -(${c}x - ${d}), what does -(-${d}) become?`, hintZh: `负负得正`, hintEn: `Minus times minus`, expectedAnswer: `${d}` },
            { promptZh: `合并同类项后写出最简整式：`, promptEn: `Combine like terms for the simplified expression:`, hintZh: `形如 kx + m`, hintEn: `Form kx + m`, expectedAnswer: exprAns },
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
          answer: `${valAns}`,
          explanationZh: `去括号变号得 ${coef}x + ${cst}；代入 x = ${xVal} 得 ${coef}×${xVal} + ${cst} = ${valAns}（若漏变 -${d} 的符号会错得 ${valWrong}）。`,
          explanationEn: `Simplifies to ${coef}x + ${cst}; at x = ${xVal}, value = ${valAns}.`,
          scaffolds: [
            { promptZh: `去括号合并常数项：${b} - (-${d}) 等于多少？`, promptEn: `Combine the constants ${b} - (-${d}):`, hintZh: `注意负负得正`, hintEn: `${b} + ${d}`, expectedAnswer: `${cst}` },
            { promptZh: `代入 x = ${xVal} 计算 ${coef}×${xVal} + ${cst}：`, promptEn: `Evaluate ${coef}×${xVal} + ${cst}:`, hintZh: `乘法后加常数`, hintEn: `Substitute x = ${xVal}`, expectedAnswer: `${valAns}` },
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
        answer: `${xAns}`,
        explanationZh: `方程两边每一项同乘 2 去分母：(x + ${a}) - 2 = ${2 * b}，解得 x = ${xAns}。注意常数项“-1”也必须乘 2，否则会漏乘错得 ${xTrap}！`,
        explanationEn: `Multiply EVERY term on both sides by 2: (x + ${a}) - 2 = ${2 * b} ⇒ x = ${xAns}.`,
        scaffolds: [
          { promptZh: `方程两边每一项同乘 2 后，右边的 ${b} 变成多少？`, promptEn: `Multiplying both sides by 2 turns the RHS ${b} into:`, hintZh: `${b} × 2`, hintEn: `${b} × 2`, expectedAnswer: `${2 * b}` },
          { promptZh: `左边变为 x + ${a} - 2 = ${2 * b}，解出 x = ?`, promptEn: `Solve x + ${a} - 2 = ${2 * b} for x:`, hintZh: `移项计算`, hintEn: `Isolate x`, expectedAnswer: `${xAns}` },
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
        answer: `${x}`,
        explanationZh: `两式直接相加消去 +y 与 -y：3x = ${s} + (${d}) = ${3 * x}，故 x = ${x}。`,
        explanationEn: `Add the two equations to eliminate y: 3x = ${s + d} ⇒ x = ${x}.`,
        scaffolds: [
          { promptZh: `将两式左右两边直接相加消去 y，得到 3x 等于多少？`, promptEn: `Add both equations so +y and -y cancel; 3x = ?`, hintZh: `${s} + (${d})`, hintEn: `${s} + (${d})`, expectedAnswer: `${3 * x}` },
          { promptZh: `两边同除以 3，x = ?`, promptEn: `Divide by 3 to find x:`, hintZh: `${3 * x} ÷ 3`, hintEn: `${3 * x} / 3`, expectedAnswer: `${x}` },
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
        answer: `${k}`,
        explanationZh: `斜率 k = Δy / Δx = (${y2} - (${y1})) / (${x2} - ${x1}) = ${y2 - y1} / 2 = ${k}（切勿把分子分母颠倒写成 Δx/Δy = ${runOverRise}）。`,
        explanationEn: `Slope k = (y₂ - y₁) / (x₂ - x₁) = (${y2} - (${y1})) / (${x2} - ${x1}) = ${k}.`,
        scaffolds: [
          { promptZh: `先算纵坐标变化量 Δy = y₂ - y₁ = ${y2} - (${y1}) = ?`, promptEn: `Compute vertical change Δy = ${y2} - (${y1}):`, hintZh: `纵坐标相减`, hintEn: `y₂ - y₁`, expectedAnswer: `${y2 - y1}` },
          { promptZh: `再除以横坐标变化量 Δx = ${x2} - ${x1} = 2，斜率 k = ?`, promptEn: `Divide by Δx = 2 to get slope k:`, hintZh: `Δy ÷ 2`, hintEn: `Δy / 2`, expectedAnswer: `${k}` },
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
          answer: exprAns,
          explanationZh: `(x + ${m})² = x² + 2·x·${m} + ${m}² = ${exprAns}。切忌漏掉中间交叉项 ${2 * m}x 误写成 ${exprTrap}！`,
          explanationEn: `(x + ${m})² = x² + ${2 * m}x + ${m * m}. Never drop the middle term ${2 * m}x!`,
          scaffolds: [
            { promptZh: `完全平方公式 (a+b)² = a² + 2ab + b² 中，交叉项 2·x·${m} 的系数是多少？`, promptEn: `What is the coefficient of x in the middle term 2·x·${m}?`, hintZh: `2 × ${m}`, hintEn: `2 × ${m}`, expectedAnswer: `${2 * m}` },
            { promptZh: `写出完整展开后的二次三项式：`, promptEn: `Write the full expanded trinomial:`, hintZh: `x^2 + ${2 * m}x + ${m * m}`, hintEn: `x^2 + ${2 * m}x + ${m * m}`, expectedAnswer: exprAns },
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
          answer: `${ans}`,
          explanationZh: `(x + ${m})² = x² + ${2 * m}x + ${m * m} = (${x + m})² = ${ans}。若漏掉中间项 2ab 只算 x² + ${m}² 会误得 ${freshmanTrap}。`,
          explanationEn: `(${x} + ${m})² = ${x + m}² = ${ans} (whereas x² + ${m}² = ${freshmanTrap} misses 2·${x}·${m}).`,
          scaffolds: [
            { promptZh: `中间交叉项 2 × ${x} × ${m} 等于多少？`, promptEn: `Compute the middle term 2 × ${x} × ${m}:`, hintZh: `2ab 项`, hintEn: `2ab term`, expectedAnswer: `${2 * x * m}` },
            { promptZh: `加上 ${x}² + ${m}² = ${freshmanTrap}，总和是多少？`, promptEn: `Add ${freshmanTrap} + ${2 * x * m}:`, hintZh: `完整完全平方值`, hintEn: `Total value`, expectedAnswer: `${ans}` },
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
        answer: `${ans}`,
        explanationZh: `先通分右边：1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}，两边取倒数得 x = ${ans}（切勿把 1/x 当成 x 直接算 ${a} + ${b} = ${sumTrap}！）。`,
        explanationEn: `1/${a} + 1/${b} = ${a + b}/${a * b} = 1/${ans}, so taking reciprocals gives x = ${ans}.`,
        scaffolds: [
          { promptZh: `先计算右边分数之和 1/${a} + 1/${b}（化为最简分数）：`, promptEn: `Add the RHS fractions 1/${a} + 1/${b}:`, hintZh: `通分相加`, hintEn: `Common denominator`, expectedAnswer: `1/${ans}` },
          { promptZh: `既然 1/x = 1/${ans} 且 x ≠ 0，那么 x = ?`, promptEn: `Since 1/x = 1/${ans}, find x:`, hintZh: `两边同时取倒数`, hintEn: `Take the reciprocal`, expectedAnswer: `${ans}` },
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
        svgDiagram: svgRightTriangle(`a = ${a}`, `b = ?`, `c = ${c}`),
        answer: `${b}`,
        explanationZh: `由 a² + b² = c²，求直角边需用减法：b = √(c² - a²) = √(${c * c} - ${a * a}) = √${b * b} = ${b}（切勿无脑套加法算 c² + a² = ${c * c + a * a}）。`,
        explanationEn: `Since c = ${c} is the hypotenuse, b = √(c² - a²) = √(${c * c} - ${a * a}) = ${b}.`,
        scaffolds: [
          { promptZh: `已知斜边求直角边，先算 c² - a² = ${c}² - ${a}² 等于多少？`, promptEn: `Compute c² - a² = ${c}² - ${a}²:`, hintZh: `${c * c} - ${a * a}`, hintEn: `${c * c} - ${a * a}`, expectedAnswer: `${b * b}` },
          { promptZh: `对 ${b * b} 开算术平方根，直角边 b = ?`, promptEn: `Take the positive square root √${b * b}:`, hintZh: `正边长`, hintEn: `Positive root`, expectedAnswer: `${b}` },
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
        answer: `${r1}, ${r2}`,
        unorderedMulti: true,
        explanationZh: `配方得 (x - ${h})² = ${r * r}，开平方注意正负双根：x - ${h} = ±${r}，解得 x₁ = ${r1}，x₂ = ${r2}（切勿漏掉负平方根只写 ${r1}！）。`,
        explanationEn: `Completing the square gives (x - ${h})² = ${r * r} ⇒ x - ${h} = ±${r} ⇒ x = ${r1}, ${r2}.`,
        scaffolds: [
          { promptZh: `配方后方程化为 (x - ${h})² = ?`, promptEn: `Complete the square: (x - ${h})² = ?`, hintZh: `移项并两边加 ${h}²`, hintEn: `Add ${h}² to ${-cCoef}`, expectedAnswer: `${r * r}` },
          { promptZh: `开方得 x - ${h} = ±${r}，写出两个根（逗号分隔）：`, promptEn: `Solve x - ${h} = ±${r} (comma-separated):`, hintZh: `${r1}, ${r2}`, hintEn: `${r1}, ${r2}`, expectedAnswer: `${r1}, ${r2}` },
        ],
        distractors: [
          { text: `${r1}`, textEn: `Only ${r1}`, misconceptionTag: "misc_quad_drop_neg_root" },
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
          bindToAnswer: false,
        },
        answer: `${h}`,
        explanationZh: `令平方项 (x - ${h})² = 0 得顶点横坐标 x = ${h}，顶点为 (${h}, ${k})。注意括号内是“- ${h}”，对称轴是 x = +${h} 而非 -${h}！`,
        explanationEn: `Setting (x - ${h})² = 0 gives vertex x-coordinate h = ${h} (watch the sign inside (x - h)²!).`,
        scaffolds: [
          { promptZh: `当 x 取什么值时，平方项 (x - ${h})² 恰好取最小值 0？`, promptEn: `What value of x makes (x - ${h})² = 0?`, hintZh: `解 x - ${h} = 0`, hintEn: `Solve x - ${h} = 0`, expectedAnswer: `${h}` },
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
        svgDiagram: svgRightTriangle(`opp = ${opp}`, `adj = ${adj}`, `hyp = ${hyp}`, `θ`),
        answer: ans,
        explanationZh: `正弦 sin θ = 对边 / 斜边 = ${ans}（邻边/斜边 = ${cosTrap} 是 cos θ，对边/邻边 = ${tanTrap} 是 tan θ）。`,
        explanationEn: `sin θ = Opposite / Hypotenuse = ${ans} (whereas cos θ = ${cosTrap}).`,
        scaffolds: [
          { promptZh: `确认 SOH 口诀：sin θ 的分子是角 θ 的哪条边长？`, promptEn: `What is the length of the side opposite θ?`, hintZh: `看图中角 θ 正对的直角边`, hintEn: `Side opposite θ`, expectedAnswer: `${opp}` },
          { promptZh: `除以斜边 ${hyp}，sin θ = ?`, promptEn: `Divide by hypotenuse ${hyp}:`, hintZh: `${opp}/${hyp}`, hintEn: `${opp}/${hyp}`, expectedAnswer: ans },
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
        answer: `${slope}`,
        explanationZh: `由幂函数求导法则及常数导数为 0：f'(x) = ${3 * a}x² - ${b}；代入 x = ${x0} 得 f'(${x0}) = ${3 * a}×${x0 * x0} - ${b} = ${slope}（切勿保留常数项 +${c} 误得 ${constKeepTrap}）。`,
        explanationEn: `f'(x) = ${3 * a}x² - ${b} (derivative of constant ${c} is 0). At x = ${x0}, f'(${x0}) = ${slope}.`,
        scaffolds: [
          { promptZh: `常数项 +${c} 求导后等于多少？`, promptEn: `What is the derivative of the constant term +${c}?`, hintZh: `水平线变化率为 0`, hintEn: `Constant has zero rate of change`, expectedAnswer: `0` },
          { promptZh: `将 x = ${x0} 代入导函数 f'(x) = ${3 * a}x² - ${b}，计算斜率：`, promptEn: `Substitute x = ${x0} into f'(x) = ${3 * a}x² - ${b}:`, hintZh: `${3 * a}×${x0}² - ${b}`, hintEn: `${3 * a}×${x0}² - ${b}`, expectedAnswer: `${slope}` },
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

    // 19. Physics: Density & SI units
    case "phy_density": {
      const rhoGcm3 = rng.pick([2.7, 7.8, 8.9, 2.5]);
      const volCm3 = rng.pick([10, 20, 40, 50]);
      const massG = Math.round(rhoGcm3 * volCm3);
      const ansKgM3 = Math.round(rhoGcm3 * 1000);
      const wrongDiv1000 = rhoGcm3 / 1000;
      core = {
        promptZh: `测得某均匀金属块质量 m = ${massG} g，体积 V = ${volCm3} cm³。求该金属的密度是多少 kg/m³？（提示：1 g/cm³ = 1000 kg/m³）`,
        promptEn: `A uniform metal block has mass m = ${massG} g and volume V = ${volCm3} cm³. Find its density in kg/m³:`,
        answer: `${ansKgM3}`,
        unit: "kg/m³",
        explanationZh: `先算 ρ = m / V = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³；再换算国际单位：${rhoGcm3} × 1000 = ${ansKgM3} kg/m³。`,
        explanationEn: `ρ = ${massG} / ${volCm3} = ${rhoGcm3} g/cm³ = ${ansKgM3} kg/m³.`,
        scaffolds: [
          { promptZh: `先求该金属以 g/cm³ 为单位的密度：${massG} ÷ ${volCm3} = ?`, promptEn: `First compute ρ in g/cm³ (${massG} ÷ ${volCm3}):`, hintZh: `m ÷ V`, hintEn: `m / V`, expectedAnswer: `${rhoGcm3}` },
          { promptZh: `1 g/cm³ = 1000 kg/m³，换算成 kg/m³ 是多少？`, promptEn: `Convert ${rhoGcm3} g/cm³ to kg/m³:`, hintZh: `乘以 1000`, hintEn: `Multiply by 1000`, expectedAnswer: `${ansKgM3}` },
        ],
        distractors: [
          { text: `${wrongDiv1000}`, misconceptionTag: "misc_density_halved" },
          { text: `${Math.round(ansKgM3 / 2)}`, misconceptionTag: "misc_density_halved" },
          { text: `${rhoGcm3}` },
        ],
        misconceptionsByValue: {
          [`${wrongDiv1000}`]: "misc_density_halved",
          [`${Math.round(ansKgM3 / 2)}`]: "misc_density_halved",
        },
      };
      break;
    }

    // 20. Physics: Average speed & motion graphs
    case "phy_motion_speed": {
      const pairs = [
        [2, 6, 3, 4], // v1=2, v2=6 -> harmonic=3, arith=4
        [3, 6, 4, 4.5], // v1=3, v2=6 -> harmonic=4, arith=4.5
        [4, 12, 6, 8], // v1=4, v2=12 -> harmonic=6, arith=8
        [6, 12, 8, 9], // v1=6, v2=12 -> harmonic=8, arith=9
      ] as const;
      const [v1, v2, vAvg, arithTrap] = rng.pick(pairs);
      const halfDist = v1 * v2; // Guarantees integer times!
      const t1 = halfDist / v1;
      const t2 = halfDist / v2;
      core = {
        promptZh: `一辆智能小车沿直线跑道测试：前 ${halfDist} m 以 v₁ = ${v1} m/s 匀速行驶，后 ${halfDist} m 以 v₂ = ${v2} m/s 匀速行驶。求全程 ${2 * halfDist} m 的平均速度（m/s）：`,
        promptEn: `A rover travels the first ${halfDist} m at v₁ = ${v1} m/s and the next ${halfDist} m at v₂ = ${v2} m/s. Find its average speed (m/s) over the entire ${2 * halfDist} m trip:`,
        answer: `${vAvg}`,
        unit: "m/s",
        explanationZh: `前段耗时 t₁ = ${halfDist}/${v1} = ${t1} s，后段耗时 t₂ = ${halfDist}/${v2} = ${t2} s；全程平均速度 v = 总路程 / 总时间 = ${2 * halfDist} / (${t1} + ${t2}) = ${vAvg} m/s（绝不能直接算 (${v1}+${v2})/2 = ${arithTrap} m/s！）。`,
        explanationEn: `t₁ = ${t1} s, t₂ = ${t2} s; Average speed = Total distance / Total time = ${2 * halfDist} / ${t1 + t2} = ${vAvg} m/s.`,
        scaffolds: [
          { promptZh: `分别算出两段耗时之和 t_总 = ${halfDist}÷${v1} + ${halfDist}÷${v2} 等于多少秒？`, promptEn: `Find total time t₁ + t₂ = ${halfDist}/${v1} + ${halfDist}/${v2} (in s):`, hintZh: `${t1} + ${t2}`, hintEn: `${t1} + ${t2}`, expectedAnswer: `${t1 + t2}` },
          { promptZh: `用总路程 ${2 * halfDist} m 除以总时间 ${t1 + t2} s，平均速度是？`, promptEn: `Divide total distance ${2 * halfDist} by total time ${t1 + t2}:`, hintZh: `s_总 ÷ t_总`, hintEn: `Total distance / Total time`, expectedAnswer: `${vAvg}` },
        ],
        distractors: [
          { text: `${arithTrap}`, misconceptionTag: "misc_avg_speed_mean" },
          { text: `${v1 + v2}` },
          { text: `${vAvg + 1}` },
        ],
        misconceptionsByValue: { [`${arithTrap}`]: "misc_avg_speed_mean" },
      };
      break;
    }

    // 21. Physics: Forces & Newton's F_net = ma
    case "phy_newton_fma": {
      const m = rng.int(2, 6);
      const a = rng.int(2, 5);
      const f = rng.int(3, 10);
      const pull = m * a + f;
      const ignoreFricTrap = formatFrac(pull, m);
      core = {
        promptZh: `如图所示，质量 m = ${m} kg 的物块受水平向右拉力 F = ${pull} N 和水平向左滑动摩擦力 f = ${f} N 作用，求物块的加速度 a（单位 m/s²）：`,
        promptEn: `A ${m} kg block experiences a rightward pull F = ${pull} N and leftward friction f = ${f} N. Find its acceleration a (in m/s²):`,
        svgDiagram: svgForceDiagram(m, pull, f),
        answer: `${a}`,
        unit: "m/s²",
        explanationZh: `先求合外力 F_合 = F - f = ${pull} - ${f} = ${m * a} N，再由牛顿第二定律 a = F_合 / m = ${m * a} / ${m} = ${a} m/s²（切勿忽略摩擦力直接算 F/m = ${ignoreFricTrap}）。`,
        explanationEn: `Net force F_net = ${pull} - ${f} = ${m * a} N; acceleration a = F_net / m = ${m * a} / ${m} = ${a} m/s².`,
        scaffolds: [
          { promptZh: `水平方向合力 F_合 = ${pull} - ${f} 等于多少 N？`, promptEn: `Compute net horizontal force F - f:`, hintZh: `反向力相减`, hintEn: `Subtract opposing friction`, expectedAnswer: `${m * a}` },
          { promptZh: `由 a = F_合 / m，除以质量 ${m} kg 得加速度 a = ?`, promptEn: `Divide net force by mass ${m} kg:`, hintZh: `${m * a} ÷ ${m}`, hintEn: `${m * a} / ${m}`, expectedAnswer: `${a}` },
        ],
        distractors: [
          { text: ignoreFricTrap, misconceptionTag: "misc_newton_ignore_friction" },
          { text: formatFrac(pull + f, m) },
          { text: `${m * a}` },
        ],
        misconceptionsByValue: { [ignoreFricTrap]: "misc_newton_ignore_friction" },
      };
      break;
    }

    // 22. Physics: Series & parallel circuit laws
    case "phy_circuits_laws": {
      const i1 = rng.pick([0.4, 0.6, 0.8, 1.2]);
      const i2 = rng.pick([0.3, 0.5, 0.7]);
      const uSource = rng.pick([3, 6, 9, 12]);
      if (dTier === "basic") {
        // Series current invariance!
        core = {
          promptZh: `如图串联电路中，电源电压为 ${uSource} V，R₁ = 10 Ω，R₂ = 20 Ω。若通过 R₁ 的电流为 ${i1} A，则流经 R₂ 的电流是多少 A？`,
          promptEn: `In the series circuit shown (R₁ = 10 Ω, R₂ = 20 Ω), if the current entering R₁ is ${i1} A, what is the current through R₂ (in A)?`,
          svgDiagram: svgCircuit("series", "R₁=10Ω", "R₂=20Ω", `${uSource}V`),
          answer: `${i1}`,
          unit: "A",
          explanationZh: `串联电路只有一条通路，电荷不堆积不消失，处处电流相等：I₂ = I₁ = ${i1} A（电流绝不会每过一个电阻就“消耗变小”！）。`,
          explanationEn: `In a single-loop series circuit, current is identical everywhere: I₂ = I₁ = ${i1} A.`,
          scaffolds: [
            { promptZh: `串联电路只有唯一路径，流过 R₁ 和 R₂ 的电流大小关系是？写出 I₂ 数值：`, promptEn: `In a series loop, I₂ equals I₁. Enter I₂:`, hintZh: `串联处处电流相等`, hintEn: `Same current everywhere`, expectedAnswer: `${i1}` },
          ],
          distractors: [
            { text: `${Math.round(i1 * 50) / 100}`, misconceptionTag: "misc_series_current_drop" },
            { text: `0`, misconceptionTag: "misc_series_current_drop" },
            { text: `${2 * i1}` },
          ],
          misconceptionsByValue: { [`${Math.round(i1 * 50) / 100}`]: "misc_series_current_drop" },
        };
      } else {
        const iTotal = Math.round((i1 + i2) * 10) / 10;
        core = {
          promptZh: `在并联电路中，干路总电流 I = ${iTotal} A，通过支路 R₁ 的电流 I₁ = ${i1} A，求通过另一支路 R₂ 的电流 I₂（单位 A）：`,
          promptEn: `In a parallel circuit, main-branch current is I = ${iTotal} A and branch R₁ carries I₁ = ${i1} A. Find branch current I₂ (in A):`,
          svgDiagram: svgCircuit("parallel", `I₁=${i1}A`, `I₂=?`, `${uSource}V`),
          answer: `${i2}`,
          unit: "A",
          explanationZh: `并联干路电流等于各支路电流之和 I = I₁ + I₂，故 I₂ = ${iTotal} - ${i1} = ${i2} A。`,
          explanationEn: `By parallel junction law I = I₁ + I₂, so I₂ = ${iTotal} - ${i1} = ${i2} A.`,
          scaffolds: [
            { promptZh: `根据并联分流 I = I₁ + I₂，计算 ${iTotal} - ${i1} = ?`, promptEn: `Subtract I₁ from total current I (${iTotal} - ${i1}):`, hintZh: `干路减支路`, hintEn: `I - I₁`, expectedAnswer: `${i2}` },
          ],
          distractors: [
            { text: `${iTotal}`, misconceptionTag: "misc_series_current_drop" },
            { text: `${Math.round((iTotal + i1) * 10) / 10}` },
            { text: `${i1}` },
          ],
          misconceptionsByValue: { [`${iTotal}`]: "misc_series_current_drop" },
        };
      }
      break;
    }

    // 23. Physics: Ohm's law & parallel equivalent resistance (Cross-subject link to Rational Equations!)
    case "phy_ohm_law": {
      const pairs = [
        [3, 6, 2],
        [4, 12, 3],
        [6, 12, 4],
        [10, 15, 6],
        [20, 30, 12],
      ] as const;
      const [r1, r2, rEq] = rng.pick(pairs);
      const u = rEq * rng.int(2, 4);
      const iTotal = u / rEq;
      if (dTier === "challenge") {
        core = {
          promptZh: `如图所示，电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 并联在 U = ${u} V 的恒压电源两端。求干路总电流 I 是多少 A？`,
          promptEn: `Resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel across a ${u} V source. Find the total main-branch current I (in A):`,
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `${u}V`),
          answer: `${iTotal}`,
          unit: "A",
          explanationZh: `由 1/R = 1/${r1} + 1/${r2} = 1/${rEq} 得并联总电阻 R = ${rEq} Ω；干路电流 I = U / R = ${u} / ${rEq} = ${iTotal} A（若把并联电阻错加成 ${r1 + r2} Ω 会严重算错！）。`,
          explanationEn: `Equivalent parallel resistance R = (${r1}×${r2})/(${r1}+${r2}) = ${rEq} Ω; total current I = ${u}/${rEq} = ${iTotal} A.`,
          scaffolds: [
            { promptZh: `先用 1/R = 1/${r1} + 1/${r2} 求出并联等效总电阻 R（Ω）：`, promptEn: `First find parallel equivalent resistance R (Ω):`, hintZh: `R = (${r1}×${r2}) ÷ (${r1}+${r2})`, hintEn: `Product over sum`, expectedAnswer: `${rEq}` },
            { promptZh: `再用欧姆定律 I = U / R = ${u} ÷ ${rEq} 求总电流（A）：`, promptEn: `Now compute I = ${u} / ${rEq} (in A):`, hintZh: `U ÷ R`, hintEn: `U / R`, expectedAnswer: `${iTotal}` },
          ],
          distractors: [
            { text: formatFrac(u, r1 + r2), misconceptionTag: "misc_ohm_parallel_add" },
            { text: `${rEq}` },
            { text: `${r1 + r2}`, misconceptionTag: "misc_ohm_parallel_add" },
          ],
          misconceptionsByValue: { [formatFrac(u, r1 + r2)]: "misc_ohm_parallel_add" },
        };
      } else {
        core = {
          promptZh: `如图将电阻 R₁ = ${r1} Ω 与 R₂ = ${r2} Ω 并联接入电路，求它们的并联等效总电阻 R（单位 Ω）：`,
          promptEn: `Two resistors R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel. Find their equivalent resistance R (in Ω):`,
          latexFormula: `\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} = \\frac{1}{${r1}} + \\frac{1}{${r2}}`,
          svgDiagram: svgCircuit("parallel", `R₁=${r1}Ω`, `R₂=${r2}Ω`, `U`),
          interactiveWidget: {
            kind: "ohm_parallel_lab",
            min: 2,
            max: 36,
            step: 1,
            initialValue: r2,
            fixedParamA: r1,
            captionZh: `固定支路 R₁=${r1}Ω，调节滑动变阻器 R₂ 至 ${r2}Ω 观测并联等效电阻`,
            captionEn: `Adjust R₂ to ${r2}Ω alongside R₁=${r1}Ω`,
            bindToAnswer: false,
          },
          answer: `${rEq}`,
          unit: "Ω",
          explanationZh: `1/R = 1/${r1} + 1/${r2} = 1/${rEq}，取倒数得 R = ${rEq} Ω（并联越并越宽、总电阻必小于最小支路 ${r1} Ω，绝不是相加得 ${r1 + r2} Ω！）。`,
          explanationEn: `1/R = 1/${r1} + 1/${r2} = 1/${rEq} ⇒ R = ${rEq} Ω.`,
          scaffolds: [
            { promptZh: `计算 1/${r1} + 1/${r2} 化简后的分数是？`, promptEn: `Simplify 1/${r1} + 1/${r2}:`, hintZh: `通分相加`, hintEn: `Add fractions`, expectedAnswer: `1/${rEq}` },
            { promptZh: `对 1/R = 1/${rEq} 两边取倒数，等效电阻 R = ?`, promptEn: `Invert to obtain R (in Ω):`, hintZh: `取倒数`, hintEn: `Reciprocal`, expectedAnswer: `${rEq}` },
          ],
          distractors: [
            { text: `${r1 + r2}`, misconceptionTag: "misc_ohm_parallel_add" },
            { text: `1/${rEq}`, misconceptionTag: "misc_ohm_parallel_add" },
            { text: `${r2 - r1}` },
          ],
          misconceptionsByValue: {
            [`${r1 + r2}`]: "misc_ohm_parallel_add",
            [`1/${rEq}`]: "misc_ohm_parallel_add",
          },
        };
      }
      break;
    }

    // 24. Physics: Work & Kinetic Energy E_k = 1/2 m v^2
    case "phy_work_energy": {
      const m = rng.pick([2, 4, 6]);
      const v = rng.int(3, 8);
      const ek = 0.5 * m * v * v;
      const linearTrap = 0.5 * m * v;
      core = {
        promptZh: `一个质量 m = ${m} kg 的滑块在光滑水平面上以速度 v = ${v} m/s 运动，它的动能 E_k 是多少焦耳（J）？`,
        promptEn: `A ${m} kg glider moves at speed v = ${v} m/s. Find its kinetic energy E_k in joules (J):`,
        answer: `${ek}`,
        unit: "J",
        explanationZh: `由动能公式 E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J（注意速度项必须平方，漏平方会错算成 ${linearTrap} J）。`,
        explanationEn: `E_k = ½mv² = 0.5 × ${m} × ${v}² = ${ek} J.`,
        scaffolds: [
          { promptZh: `先算速度的平方 v² = ${v}² = ?`, promptEn: `First compute v² = ${v}²:`, hintZh: `${v} × ${v}`, hintEn: `${v} × ${v}`, expectedAnswer: `${v * v}` },
          { promptZh: `代入 ½ × ${m} × ${v * v}，动能 E_k = ?`, promptEn: `Multiply ½ × ${m} × ${v * v}:`, hintZh: `单位 J`, hintEn: `In joules`, expectedAnswer: `${ek}` },
        ],
        distractors: [
          { text: `${linearTrap}`, misconceptionTag: "misc_ke_linear_v" },
          { text: `${m * v * v}` },
          { text: `${m * v}` },
        ],
        misconceptionsByValue: { [`${linearTrap}`]: "misc_ke_linear_v" },
      };
      break;
    }

    // 25. Chemistry: Stoichiometry & Conservation of Mass
    case "chem_balance_mass": {
      // 2H2 + O2 -> 2H2O (mass ratio 4 : 32 : 36 = 1 : 8 : 9)
      const k = rng.int(2, 9);
      const h2Mass = 1 * k;
      const o2Mass = 8 * k;
      const h2oMass = 9 * k;
      core = {
        promptZh: `根据质量守恒定律与化学方程式 2H₂ + O₂ = 2H₂O（质量比 1 : 8 : 9），${h2Mass} g 氢气与 ${o2Mass} g 氧气恰好完全反应，生成水的质量是多少 g？`,
        promptEn: `By conservation of mass in 2H₂ + O₂ → 2H₂O (mass ratio 1 : 8 : 9), if ${h2Mass} g of H₂ reacts completely with ${o2Mass} g of O₂, how many grams of H₂O are produced?`,
        answer: `${h2oMass}`,
        unit: "g",
        explanationZh: `恰好完全反应时，参加反应的各物质质量总和等于生成物质量总和：${h2Mass} g + ${o2Mass} g = ${h2oMass} g。`,
        explanationEn: `By conservation of mass when reactants are in exact stoichiometric ratio: ${h2Mass} + ${o2Mass} = ${h2oMass} g.`,
        scaffolds: [
          { promptZh: `参加反应的 H₂ 与 O₂ 总质量 ${h2Mass} + ${o2Mass} 是多少 g？`, promptEn: `Sum the exact reacting masses ${h2Mass} + ${o2Mass}:`, hintZh: `质量守恒定律`, hintEn: `Mass is conserved`, expectedAnswer: `${h2oMass}` },
        ],
        distractors: [
          { text: `${o2Mass - h2Mass}`, misconceptionTag: "misc_chem_alter_subscript" },
          { text: `${2 * h2oMass}`, misconceptionTag: "misc_chem_alter_subscript" },
          { text: `${o2Mass}` },
        ],
        misconceptionsByValue: { [`${2 * h2oMass}`]: "misc_chem_alter_subscript" },
      };
      break;
    }

    // 26. Biology: Mendelian Punnett square probability
    case "bio_punnett": {
      const mode = rng.pick(["hetero_hetero_rec", "hetero_hetero_dom", "test_cross"] as const);
      if (mode === "test_cross") {
        core = {
          promptZh: `在孟德尔豌豆杂交实验中，高茎杂合子（Aa）与矮茎隐性纯合子（aa）测交，子代出现矮茎（aa）的概率是多少（填百分数如 50%）？`,
          promptEn: `In a Mendelian test cross Aa × aa, what percentage of offspring are expected to be homozygous recessive (aa)?`,
          answer: `50%`,
          acceptedEquivalents: ["1/2", "0.5", "50"],
          explanationZh: `Aa 产生 A、a 配子各占 1/2，aa 只产生 a 配子，子代基因型 Aa : aa = 1 : 1，故 aa 占 50%（每次受精独立同分布）。`,
          explanationEn: `Punnett square for Aa × aa yields 50% Aa and 50% aa.`,
          scaffolds: [
            { promptZh: `亲本 Aa 产生隐性配子 a 的概率是几分之几？`, promptEn: `Probability that parent Aa contributes allele 'a':`, hintZh: `一半配子为 a`, hintEn: `1/2`, expectedAnswer: `1/2` },
            { promptZh: `与 aa 提供的 a（概率 1）结合，aa 占比化成百分数是？`, promptEn: `Express 1/2 as a percentage:`, hintZh: `50%`, hintEn: `50%`, expectedAnswer: `50%` },
          ],
          distractors: [
            { text: `25%`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `75%` },
            { text: `0%`, misconceptionTag: "misc_bio_gambler_fallacy" },
          ],
          misconceptionsByValue: { "25%": "misc_bio_gambler_fallacy", "0%": "misc_bio_gambler_fallacy" },
        };
      } else if (mode === "hetero_hetero_dom") {
        core = {
          promptZh: `两株杂合高茎豌豆（Aa × Aa）自交，子代展现显性高茎性状（AA 或 Aa）的概率是多少（填百分数如 75%）？`,
          promptEn: `In a monohybrid cross Aa × Aa, what percentage of offspring display the dominant phenotype (AA or Aa)?`,
          answer: `75%`,
          acceptedEquivalents: ["3/4", "0.75", "75"],
          explanationZh: `Aa × Aa 庞氏表四格为 1 AA : 2 Aa : 1 aa，显性性状（AA + Aa）占 3/4 = 75%。`,
          explanationEn: `Punnett square gives 1 AA : 2 Aa : 1 aa, so 3/4 = 75% show the dominant trait.`,
          scaffolds: [
            { promptZh: `2×2 庞氏表共 4 种等可能组合，其中含至少一个 A 的有几格？`, promptEn: `Out of 4 Punnett cells (AA, Aa, aA, aa), how many carry at least one A?`, hintZh: `AA, Aa, aA`, hintEn: `Count cells with A`, expectedAnswer: `3` },
            { promptZh: `3/4 写成百分数是多少？`, promptEn: `Convert 3/4 to a percentage:`, hintZh: `75%`, hintEn: `75%`, expectedAnswer: `75%` },
          ],
          distractors: [
            { text: `50%`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `25%` },
            { text: `100%` },
          ],
          misconceptionsByValue: { "50%": "misc_bio_gambler_fallacy" },
        };
      } else {
        core = {
          promptZh: `已知白化病为常染色体隐性遗传（aa）。一对表现正常的携带者夫妇（Aa × Aa）已生育一个白化病孩子，他们再生第二个孩子患白化病（aa）的概率是多少（填百分数）？`,
          promptEn: `Two carrier parents (Aa × Aa) already had one affected child (aa). What is the probability that their NEXT child will have genotype aa?`,
          answer: `25%`,
          acceptedEquivalents: ["1/4", "0.25", "25"],
          explanationZh: `每次独立生殖事件互不影响（克服赌徒谬误）！Aa × Aa 产生 aa 的概率恒为 1/2 × 1/2 = 1/4 = 25%，绝不是“已经有1个患病所以接下来3个必正常（0%）”！`,
          explanationEn: `Each birth is an independent event! Aa × Aa always has a 1/4 = 25% chance of aa.`,
          scaffolds: [
            { promptZh: `二胎基因组合受头胎结果影响吗？直接算 Aa × Aa 得到 aa 的概率分数：`, promptEn: `Since births are independent, what fraction of Aa × Aa is aa?`, hintZh: `1/2 × 1/2`, hintEn: `1/2 × 1/2`, expectedAnswer: `1/4` },
            { promptZh: `1/4 对应百分数是多少？`, promptEn: `Write 1/4 as a percentage:`, hintZh: `25%`, hintEn: `25%`, expectedAnswer: `25%` },
          ],
          distractors: [
            { text: `0%`, misconceptionTag: "misc_bio_gambler_fallacy" },
            { text: `50%` },
            { text: `75%` },
          ],
          misconceptionsByValue: { "0%": "misc_bio_gambler_fallacy", "0": "misc_bio_gambler_fallacy" },
        };
      }
      break;
    }

    // 27. English: Relative clauses (choice item)
    case "eng_relative_clause": {
      const scenarios = [
        {
          noun: "science museum",
          verbPhrase: "we visited last Friday",
          roleZh: "及物动词 visited 缺宾语",
          ans: "which",
          trap: "where",
        },
        {
          noun: "ancient city",
          verbPhrase: "the archaeologists discovered in 1986",
          roleZh: "及物动词 discovered 缺宾语",
          ans: "which",
          trap: "where",
        },
        {
          noun: "community library",
          verbPhrase: "our school built two years ago",
          roleZh: "及物动词 built 缺宾语",
          ans: "which",
          trap: "where",
        },
      ] as const;
      const sc = rng.pick(scenarios);
      core = {
        promptZh: `【定语从句句法诊断】选择正确的关系词填空：\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
        promptEn: `Choose the correct relative word to complete the sentence:\n"The ${sc.noun} ______ ${sc.verbPhrase} has an interactive robotics lab."`,
        answer: sc.ans,
        answerEn: sc.ans,
        explanationZh: `虽然先行词 "${sc.noun}" 表示地点，但将它代入从句后发现 "${sc.verbPhrase}" 中${sc.roleZh}（visit/discover/build sth.），关系词充当宾语，故必须用 which/that 而不能用关系副词 where！`,
        explanationEn: `Even though "${sc.noun}" is a place noun, it functions as the direct OBJECT of the transitive verb inside "${sc.verbPhrase}", requiring the relative pronoun "which" rather than "where".`,
        scaffolds: [
          { promptZh: `把先行词放回从句末尾："${sc.verbPhrase} [the ${sc.noun}]"，需要加介词 in/at 吗？（不需要说明缺宾语，应选关系代词 which）`, promptEn: `Does "${sc.verbPhrase}" need a preposition before "${sc.noun}"? No — it needs a direct object pronoun ("which").`, hintZh: `缺宾语选 which`, hintEn: `Direct object -> which`, expectedAnswer: sc.ans },
        ],
        distractors: [
          { text: sc.trap, textEn: sc.trap, misconceptionTag: "misc_eng_place_always_where" },
          { text: "who", textEn: "who" },
          { text: "when", textEn: "when" },
        ],
      };
      break;
    }

    // 28. Computing: Binary place-value & Boolean logic
    case "cs_binary": {
      const dec = rng.int(9, 29);
      const bin = dec.toString(2);
      // Trap: starting powers of 2 at 2^1 instead of 2^0 => 2 * dec!
      const shiftTrap = dec * 2;
      core = {
        promptZh: `将无符号二进制数 (${bin})₂ 转换为十进制整数：`,
        promptEn: `Convert the unsigned binary number (${bin})₂ to base-10 decimal:`,
        answer: `${dec}`,
        explanationZh: `从最右位（最低位 2⁰ = 1）向左按权展开相加，(${bin})₂ = ${dec}（注意最右边第一位权值是 2⁰ = 1 而非 2¹ = 2，否则会翻倍错算成 ${shiftTrap}）。`,
        explanationEn: `Expanding powers of 2 from right to left starting at 2⁰ = 1 gives (${bin})₂ = ${dec}.`,
        scaffolds: [
          { promptZh: `二进制最右边末位代表 2⁰ 还是 2¹？写出它的位权数值：`, promptEn: `What is the place weight of the rightmost bit (2⁰)?`, hintZh: `任何非零数的 0 次方`, hintEn: `2⁰ = 1`, expectedAnswer: `1` },
          { promptZh: `将所有为 1 的数位对应权值相加，十进制结果是？`, promptEn: `Sum the weights of all '1' bits in (${bin})₂:`, hintZh: `从右往左权值依次为 1, 2, 4, 8, 16`, hintEn: `Weights: 1, 2, 4, 8, 16`, expectedAnswer: `${dec}` },
        ],
        distractors: [
          { text: `${shiftTrap}`, misconceptionTag: "misc_cs_power_start_one" },
          { text: `${dec + 1}` },
          { text: `${dec - 2}` },
        ],
        misconceptionsByValue: { [`${shiftTrap}`]: "misc_cs_power_start_one" },
      };
      break;
    }

    // 29. Geography: Map scale & timezones
    case "geo_scale_time": {
      const mapCm = rng.int(3, 9);
      const scaleDenom = rng.pick([100000, 200000, 500000]); // 1 km = 100,000 cm
      const kmPerCm = scaleDenom / 100000;
      const ansKm = mapCm * kmPerCm;
      const zeroTrap = ansKm * 10;
      core = {
        promptZh: `在一幅比例尺为 1 : ${scaleDenom} 的区域地形图上，量得甲、乙两座气象站的图上直线距离为 ${mapCm} cm，求两站的实地水平距离是多少 km？（提示：1 km = 100,000 cm）`,
        promptEn: `On a topographic map with scale 1 : ${scaleDenom}, two stations are ${mapCm} cm apart. Find the actual ground distance in km (1 km = 100,000 cm):`,
        answer: `${ansKm}`,
        unit: "km",
        explanationZh: `实地距离 = ${mapCm} × ${scaleDenom} cm = ${mapCm * scaleDenom} cm；因为 1 km = 1000 m = 100,000 cm（去掉 5 个零），换算得 ${ansKm} km。`,
        explanationEn: `Ground distance = ${mapCm} × ${scaleDenom} cm = ${ansKm} km (dividing cm by 100,000).`,
        scaffolds: [
          { promptZh: `图上 1 cm 代表实地 ${scaleDenom} cm，换算成 km 是多少 km？`, promptEn: `How many km does 1 cm on a 1:${scaleDenom} map represent?`, hintZh: `${scaleDenom} ÷ 100000`, hintEn: `Divide by 100,000`, expectedAnswer: `${kmPerCm}` },
          { promptZh: `图上 ${mapCm} cm 对应实地多少 km？`, promptEn: `Multiply by ${mapCm} cm:`, hintZh: `${mapCm} × ${kmPerCm}`, hintEn: `${mapCm} × ${kmPerCm}`, expectedAnswer: `${ansKm}` },
        ],
        distractors: [
          { text: `${zeroTrap}`, misconceptionTag: "misc_geo_cm_km_zeros" },
          { text: `${ansKm / 10}`, misconceptionTag: "misc_geo_cm_km_zeros" },
          { text: `${mapCm + kmPerCm}` },
        ],
        misconceptionsByValue: {
          [`${zeroTrap}`]: "misc_geo_cm_km_zeros",
          [`${ansKm / 10}`]: "misc_geo_cm_km_zeros",
        },
      };
      break;
    }

    // 30. History: BCE/CE chronology (No Year 0!)
    case "his_chronology": {
      const bce = rng.pick([221, 202, 44, 509, 776]);
      const ce = rng.pick([2025, 2026, 618, 1066]);
      const ansYears = bce + ce - 1;
      const yearZeroTrap = bce + ce;
      core = {
        promptZh: `【历史纪年跨度】公历纪年没有“公元 0 年”（公元前 1 年紧接公元 1 年）。从公元前 ${bce} 年（${bce} BCE）到公元 ${ce} 年（${ce} CE）同月同日，一共相距多少周年？`,
        promptEn: `[Historical Chronology] Since the Gregorian/Julian calendar has NO Year 0 (1 BCE is followed immediately by 1 CE), how many full years elapsed from ${bce} BCE to the same date in ${ce} CE?`,
        answer: `${ansYears}`,
        explanationZh: `跨越公元元年时因不存在公元 0 年，周年跨度 = ${bce} + ${ce} - 1 = ${ansYears} 年（直接相加 ${bce} + ${ce} = ${yearZeroTrap} 会多算虚构的“公元 0 年”）。`,
        explanationEn: `Spanning 1 BCE → 1 CE requires subtracting 1 for the missing Year 0: ${bce} + ${ce} - 1 = ${ansYears} years.`,
        scaffolds: [
          { promptZh: `若按普通数轴算 ${bce} + ${ce} 是多少？`, promptEn: `First sum ${bce} + ${ce}:`, hintZh: `${bce} + ${ce}`, hintEn: `${bce} + ${ce}`, expectedAnswer: `${yearZeroTrap}` },
          { promptZh: `扣除不存在的“公元 0 年”（减 1），实际相隔多少年？`, promptEn: `Subtract 1 for the non-existent Year 0:`, hintZh: `${yearZeroTrap} - 1`, hintEn: `${yearZeroTrap} - 1`, expectedAnswer: `${ansYears}` },
        ],
        distractors: [
          { text: `${yearZeroTrap}`, misconceptionTag: "misc_his_year_zero" },
          { text: `${Math.abs(ce - bce)}` },
          { text: `${ansYears - 1}` },
        ],
        misconceptionsByValue: { [`${yearZeroTrap}`]: "misc_his_year_zero" },
      };
      break;
    }

    // 31–50: Delegate to Phase 2 All-Subject Expansion Generators
    default: {
      const phase2Core = generatePhase2Core(template.generatorKey, rng, dTier);
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
