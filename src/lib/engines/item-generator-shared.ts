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

export function svgParabola(h: number, k: number, opensUp: boolean): string {
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
