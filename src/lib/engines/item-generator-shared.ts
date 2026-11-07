import type {
  InteractiveWidgetConfig,
  RegionCode,
  ScaffoldStep,
  TriLocaleText,
} from "@/types/taxonomy";
import { REGIONS_DATA } from "@/data/regions-and-subjects";

/**
 * Deterministic 32-bit FNV-1a hash + Mulberry32 PRNG
 */
export function hashSeed(input: string): number {
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

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x || 1;
}

export function formatFrac(num: number, den: number): string {
  const g = gcd(num, den);
  const s = den < 0 ? -1 : 1;
  const n = (num * s) / g;
  const d = (den * s) / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

/**
 * Formats linear algebraic expression `a*x + b` cleanly without `0x`, `1x`, `-1x`, or `+ -3`.
 */
export function formatLinearExpr(a: number, b: number, varName = "x"): string {
  if (a === 0) return `${b}`;
  const xPart = a === 1 ? varName : a === -1 ? `-${varName}` : `${a}${varName}`;
  if (b === 0) return xPart;
  return b > 0 ? `${xPart} + ${b}` : `${xPart} - ${Math.abs(b)}`;
}

/**
 * Formats quadratic expression `a*x^2 + b*x + c` cleanly.
 */
export function formatQuadraticExpr(a: number, b: number, c: number, varName = "x"): string {
  const parts: string[] = [];
  if (a !== 0) {
    parts.push(a === 1 ? `${varName}^2` : a === -1 ? `-${varName}^2` : `${a}${varName}^2`);
  }
  if (b !== 0) {
    const absB = Math.abs(b);
    const bTerm = absB === 1 ? varName : `${absB}${varName}`;
    if (parts.length === 0) {
      parts.push(b < 0 ? `-${bTerm}` : bTerm);
    } else {
      parts.push(b < 0 ? `- ${bTerm}` : `+ ${bTerm}`);
    }
  }
  if (c !== 0 || parts.length === 0) {
    if (parts.length === 0) {
      parts.push(`${c}`);
    } else {
      parts.push(c < 0 ? `- ${Math.abs(c)}` : `+ ${c}`);
    }
  }
  return parts.join(" ");
}

/**
 * Korean Sino-Korean / Hangul batchim detector for dynamic numbers & strings.
 * Eliminates awkward `을(를)`, `이(가)`, `과(와)`, `은(는)`, `으로(로)` parenthetical particles!
 *
 * Sino-Korean digit readings:
 *   0 영(ㅇ), 1 일(ㄹ), 2 이(-), 3 삼(ㅁ), 4 사(-), 5 오(-), 6 육(ㄱ), 7 칠(ㄹ), 8 팔(ㄹ), 9 구(-)
 */
export function hasKoreanBatchim(value: number | string): boolean {
  const s = String(value).trim().replace(/[$%°℃Ω\s)\]]+$/, "");
  if (!s) return false;
  const lastChar = s[s.length - 1]!;
  const code = lastChar.charCodeAt(0);

  // Hangul syllable block (U+AC00..U+D7A3)
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 !== 0;
  }

  // Arabic digits (last pronounced digit in Sino-Korean)
  if (/\d/.test(lastChar)) {
    // Check if number ends in multiple zeros like 10(십-ㅂ), 100(백-ㄱ), 1000(천-ㄴ), 10000(만-ㄴ) — ALL have batchim!
    const numMatch = s.match(/(\d+)(?:\.(\d+))?$/);
    if (numMatch) {
      if (numMatch[2]) {
        const lastDec = numMatch[2][numMatch[2].length - 1]!;
        return "013678".includes(lastDec);
      }
      const intStr = numMatch[1]!;
      const n = Number(intStr);
      if (n > 0 && n % 10 === 0) {
        // 10 십(ㅂ), 100 백(ㄱ), 1000 천(ㄴ), 10000 만(ㄴ), 억(ㄱ) -> all have batchim!
        return true;
      }
      return "013678".includes(lastChar);
    }
  }

  // Latin letters common in STEM variables: L, M, N, R have liquid/nasal batchim in Korean letter names (엘, 엠, 엔, 아르/알)
  if (/[LMNRlmnr]/.test(lastChar)) return true;
  return false;
}

function hasRieulBatchim(value: number | string): boolean {
  const s = String(value).trim().replace(/[$%°℃Ω\s)\]]+$/, "");
  if (!s) return false;
  const lastChar = s[s.length - 1]!;
  const code = lastChar.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 === 8; // ㄹ jongseong
  }
  if (/\d/.test(lastChar)) {
    const numMatch = s.match(/(\d+)(?:\.(\d+))?$/);
    if (numMatch && !numMatch[2] && Number(numMatch[1]) > 0 && Number(numMatch[1]) % 10 === 0) {
      return false; // 십, 백, 천, 만 do not end in ㄹ
    }
    return "178".includes(lastChar); // 일(1), 칠(7), 팔(8) end in ㄹ!
  }
  return /[LRlr]/.test(lastChar);
}

/** Appends value + exact Korean particle (e.g. `koP(12, "을", "를") -> "12를"`, `koP(10, "을", "를") -> "10을"`). */
export function koP(
  value: number | string,
  withBatchim: string,
  withoutBatchim: string
): string {
  if (withBatchim === "으로" && withoutBatchim === "로") {
    const useRo = !hasKoreanBatchim(value) || hasRieulBatchim(value);
    return `${value}${useRo ? "로" : "으로"}`;
  }
  return `${value}${hasKoreanBatchim(value) ? withBatchim : withoutBatchim}`;
}

export function getCurrency(regionCode: RegionCode): string {
  const found = REGIONS_DATA.find((r) => r.code === regionCode);
  return found?.notation.currencySymbol ?? "¥";
}

// ==================== CLEAN-ROOM INLINE SVG GENERATORS ====================

export function svgBarModel(partsTotal: number, shadedParts: number, totalValue: number, currency: string): string {
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

export function svgRightTriangle(aLabel: string, bLabel: string, cLabel: string, angleLabel?: string): string {
  return `<svg viewBox="0 0 260 150" class="w-full max-w-xs h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <polygon points="45,120 205,120 45,28" fill="rgba(99,102,241,0.10)" stroke="currentColor" stroke-width="2"/>
    <polyline points="45,106 59,106 59,120" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="125" y="138" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">${bLabel}</text>
    <text x="24" y="78" text-anchor="middle" font-size="12" fill="currentColor" font-weight="600">${aLabel}</text>
    <text x="138" y="66" text-anchor="middle" font-size="12" fill="#6366f1" font-weight="700">${cLabel}</text>
    ${angleLabel ? `<text x="172" y="114" font-size="11" fill="#ec4899" font-weight="700">${angleLabel}</text>` : ""}
  </svg>`;
}

export function svgTrapezoidOrTriangle(mode: "triangle" | "trapezoid", b1: number, b2: number, h: number): string {
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

/**
 * Renders parabola shape and axis of symmetry WITHOUT leaking vertex coordinates `(h, k)`!
 * Clamps vertex & arm span within `[22..238] x [18..132]` so no curve ever clips out of bounds.
 */
export function svgParabola(h: number, k: number, opensUp: boolean, showCoords = false): string {
  const vx = Math.max(68, Math.min(192, 130 + h * 11));
  const vy = Math.max(40, Math.min(110, 78 - k * 6));
  const armSpan = 48;
  const endY = opensUp ? Math.max(16, vy - 56) : Math.min(134, vy + 56);
  // For quadratic Bezier M (vx-w, endY) Q (vx, ctrlY) (vx+w, endY), midpoint at t=0.5 is 0.5*endY + 0.5*ctrlY = vy => ctrlY = 2*vy - endY!
  const ctrlY = 2 * vy - endY;
  const path = `M ${vx - armSpan} ${endY} Q ${vx} ${ctrlY} ${vx + armSpan} ${endY}`;
  const label = showCoords ? `V(${h}, ${k})` : "V";
  return `<svg viewBox="0 0 260 150" class="w-full max-w-xs h-auto text-slate-700 dark:text-slate-200" xmlns="http://www.w3.org/2000/svg">
    <line x1="20" y1="78" x2="240" y2="78" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
    <line x1="130" y1="12" x2="130" y2="140" stroke="currentColor" stroke-opacity="0.45" stroke-width="1.2"/>
    <line x1="${vx}" y1="14" x2="${vx}" y2="138" stroke="#6366f1" stroke-dasharray="4 3" stroke-width="1.2"/>
    <path d="${path}" fill="none" stroke="#6366f1" stroke-width="2.4"/>
    <circle cx="${vx}" cy="${vy}" r="3.5" fill="#ec4899"/>
    <text x="${vx + 8}" y="${vy + (opensUp ? 14 : -8)}" font-size="11" fill="#ec4899" font-weight="600">${label}</text>
  </svg>`;
}

export function svgForceDiagram(massKg: number, pullN: number, frictionN: number): string {
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

export function svgCircuit(mode: "series" | "parallel", r1Label: string, r2Label: string, sourceLabel: string): string {
  const formattedSource =
    sourceLabel.trim() === "U"
      ? "U (Source)"
      : sourceLabel.includes("=")
        ? sourceLabel
        : `U = ${sourceLabel}`;
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
    <text x="145" y="132" text-anchor="middle" font-size="11" fill="#f59e0b" font-weight="700">${formattedSource}</text>
  </svg>`;
}

export interface RawGeneratedCore {
  promptZh: string;
  promptEn: string;
  /** Native ja / ko / ms prompt (falls back to promptEn when a key is missing). */
  promptI18n?: TriLocaleText;
  latexFormula?: string;
  svgDiagram?: string;
  interactiveWidget?: InteractiveWidgetConfig;
  answer: string;
  answerEn?: string;
  /** Native ja / ko / ms text of the correct choice (only needed when answerEn is wordy). */
  answerI18n?: TriLocaleText;
  acceptedEquivalents?: string[];
  unorderedMulti?: boolean;
  requireSimplifiedFraction?: boolean;
  unit?: string;
  explanationZh: string;
  explanationEn: string;
  explanationI18n?: TriLocaleText;
  scaffolds: ScaffoldStep[];
  distractors: Array<{
    text: string;
    textEn?: string;
    textI18n?: TriLocaleText;
    misconceptionTag?: string;
  }>;
  misconceptionsByValue?: Record<string, string>;
}

/**
 * Generates mathematically/domain-clean fallback distractors WITHOUT ever printing "(变式+1)" / "(alt +1)"!
 * Preserves integers, decimals, fractions, or signed numbers cleanly.
 */
export function synthesizeCleanNumericDistractor(
  correctAnswer: string,
  seenLower: Set<string>,
  attemptIndex: number
): string | null {
  const trimmed = correctAnswer.trim();

  // 1. Fraction "p/q"
  const fracM = trimmed.match(/^([+-]?\d+)\/(\d+)$/);
  if (fracM) {
    const p = Number(fracM[1]);
    const q = Number(fracM[2]);
    const candidates = [
      formatFrac(p + 1, q),
      formatFrac(Math.max(1, Math.abs(p) - 1) * (p < 0 ? -1 : 1), q + 1),
      formatFrac(p + 2, q + 1),
      formatFrac(q, Math.max(2, Math.abs(p))),
      formatFrac(p + q, q * 2),
      formatFrac(p + attemptIndex + 1, q + attemptIndex),
    ];
    for (const c of candidates) {
      if (!seenLower.has(c.toLowerCase()) && c !== "0") return c;
    }
  }

  // 2. Unordered multi-root "r1, r2"
  const multiM = trimmed.match(/^([+-]?\d+)\s*,\s*([+-]?\d+)$/);
  if (multiM) {
    const r1 = Number(multiM[1]);
    const r2 = Number(multiM[2]);
    const pairs: Array<[number, number]> = [
      [-r1, -r2],
      [-r1, r2],
      [r1, -r2],
      [r1 + 1, r2 - 1],
      [r1 - 1, r2 + 1],
      [r1 + 2, r2],
    ];
    for (const [a, b] of pairs) {
      const s1 = `${a}, ${b}`;
      const s2 = `${b}, ${a}`;
      if (!seenLower.has(s1.toLowerCase()) && !seenLower.has(s2.toLowerCase())) {
        return s1;
      }
    }
  }

  // 3. Decimal or integer
  const numM = trimmed.match(/^([+-]?\d+)(?:\.(\d+))?(%)?$/);
  if (numM) {
    const val = Number(numM[1] + (numM[2] ? `.${numM[2]}` : ""));
    const decimals = numM[2]?.length ?? 0;
    const suffix = numM[3] ?? "";
    const step = decimals > 0 ? Math.pow(10, -decimals) * (decimals === 1 ? 2 : 5) : val >= 50 ? 5 : 1;
    const deltas = [step, -step, 2 * step, -2 * step, 3 * step, 4 * step, -3 * step, 5 * step];
    for (const d of deltas) {
      const nextVal = val + d;
      // Keep non-negative if original was positive and >= 0 (unless small signed number)
      if (val > 0 && nextVal <= 0) continue;
      const formatted = `${decimals > 0 ? nextVal.toFixed(decimals) : Math.round(nextVal)}${suffix}`;
      if (!seenLower.has(formatted.toLowerCase())) {
        return formatted;
      }
    }
  }

  return null;
}
