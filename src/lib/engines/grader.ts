import type { GeneratedQuestionInstance } from "@/types/taxonomy";

export interface RationalValue {
  num: bigint;
  den: bigint;
}

function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0n ? 1n : x;
}

export function reduceRational(num: bigint, den: bigint): RationalValue | null {
  if (den === 0n) return null;
  const sign = den < 0n ? -1n : 1n;
  const sNum = num * sign;
  const sDen = den * sign;
  const g = gcdBigInt(sNum, sDen);
  return { num: sNum / g, den: sDen / g };
}

/**
 * Canonical Unicode & symbol normalization (NFKC + math operators)
 */
export function normalizeAnswerText(raw: string): string {
  return raw
    .normalize("NFKC")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/，/g, ",")
    .replace(/；/g, ";")
    .replace(/：/g, ":")
    .replace(/％/g, "%")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\s+/g, " ");
}

/**
 * Strip optional trailing physical/math unit if present (e.g. "2700 kg/m^3" -> "2700")
 */
function stripKnownUnit(input: string, expectedUnit?: string): string {
  let s = input.trim();
  if (expectedUnit) {
    const normUnit = normalizeAnswerText(expectedUnit);
    if (normUnit && s.toLowerCase().endsWith(normUnit.toLowerCase())) {
      s = s.slice(0, s.length - normUnit.length).trim();
    }
  }
  // Also strip common trailing units if preceded by a number
  s = s.replace(
    /^([+-]?\d+(?:[./]\d+)?)\s*(?:cm\^2|cm\^3|m\^2|m\^3|kg\/m\^3|g\/cm\^3|m\/s\^2|m\/s|km\/h|km|cm|mm|kg|g|n|j|w|v|a|Ω|ohm|°|deg)$/i,
    "$1"
  );
  return s.trim();
}

/**
 * Parse exact rational number from integer, decimal, percentage, fraction, mixed fraction, or ratio.
 * Examples:
 *   "0.5" -> 1/2
 *   "50%" -> 1/2
 *   "2/4" -> 1/2
 *   "1 1/2" -> 3/2
 *   "1/3" -> 1/3 (NOT equal to "0.333" = 333/1000!)
 */
export function parseRational(raw: string): RationalValue | null {
  let s = normalizeAnswerText(raw);
  if (!s) return null;

  // Strip variable assignment prefix like "x = 5" or "y = -2"
  s = s.replace(/^[a-zA-Z]\s*=\s*/, "").trim();

  let isPercent = false;
  if (s.endsWith("%")) {
    isPercent = true;
    s = s.slice(0, -1).trim();
  }

  // Mixed fraction e.g. "-1 2/3" or "2 1/4"
  const mixedMatch = s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixedMatch) {
    const whole = BigInt(mixedMatch[1]);
    const partNum = BigInt(mixedMatch[2]);
    const partDen = BigInt(mixedMatch[3]);
    if (partDen === 0n) return null;
    const sign = whole < 0n || mixedMatch[1].startsWith("-") ? -1n : 1n;
    const absWhole = whole < 0n ? -whole : whole;
    const totalNum = sign * (absWhole * partDen + partNum);
    return reduceRational(totalNum, isPercent ? partDen * 100n : partDen);
  }

  // Simple fraction or ratio e.g. "-6/8" or "3:4"
  const fracMatch = s.match(/^([+-]?\d+(?:\.\d+)?)\s*[/:]\s*([+-]?\d+(?:\.\d+)?)$/);
  if (fracMatch) {
    const left = parseDecimalToRational(fracMatch[1]);
    const right = parseDecimalToRational(fracMatch[2]);
    if (!left || !right || right.num === 0n) return null;
    const num = left.num * right.den;
    const den = left.den * right.num * (isPercent ? 100n : 1n);
    return reduceRational(num, den);
  }

  const dec = parseDecimalToRational(s);
  if (!dec) return null;
  return reduceRational(dec.num, isPercent ? dec.den * 100n : dec.den);
}

function parseDecimalToRational(s: string): RationalValue | null {
  const m = s.trim().match(/^([+-])?(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  const sign = m[1] === "-" ? -1n : 1n;
  const intPart = m[2];
  const fracPart = m[3] ?? "";
  const scale = 10n ** BigInt(fracPart.length);
  const combined = BigInt(intPart + fracPart) * sign;
  return reduceRational(combined, scale);
}

export function areRationalsEqual(a: RationalValue | null, b: RationalValue | null): boolean {
  if (!a || !b) return false;
  return a.num === b.num && a.den === b.den;
}

// ==================== SAFE ALGEBRAIC EXPRESSION EVALUATOR ====================

type Token =
  | { type: "num"; value: number }
  | { type: "var"; name: string }
  | { type: "op"; op: "+" | "-" | "*" | "/" | "^" }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenizeExpression(expr: string): Token[] | null {
  const norm = normalizeAnswerText(expr).replace(/^[a-zA-Z]\s*=\s*/, "");
  const rawTokens: Token[] = [];
  let i = 0;
  while (i < norm.length) {
    const ch = norm[i];
    if (ch === " ") {
      i++;
      continue;
    }
    if (/\d|\./.test(ch)) {
      let j = i;
      while (j < norm.length && /[\d.]/.test(norm[j])) j++;
      const num = Number(norm.slice(i, j));
      if (Number.isNaN(num)) return null;
      rawTokens.push({ type: "num", value: num });
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      rawTokens.push({ type: "var", name: ch.toLowerCase() });
      i++;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "^") {
      rawTokens.push({ type: "op", op: ch });
      i++;
      continue;
    }
    if (ch === "(" || ch === "[") {
      rawTokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (ch === ")" || ch === "]") {
      rawTokens.push({ type: "rparen" });
      i++;
      continue;
    }
    return null;
  }

  // Insert implicit multiplication: e.g. 2x -> 2*x, (x+1)(x-1) -> (x+1)*(x-1), 3(x+2) -> 3*(x+2), xy -> x*y
  const out: Token[] = [];
  for (let k = 0; k < rawTokens.length; k++) {
    const prev = out[out.length - 1];
    const curr = rawTokens[k];
    if (
      prev &&
      (prev.type === "num" || prev.type === "var" || prev.type === "rparen") &&
      (curr.type === "var" || curr.type === "lparen" || (prev.type === "rparen" && curr.type === "num"))
    ) {
      out.push({ type: "op", op: "*" });
    }
    out.push(curr);
  }
  return out;
}

function evaluateTokens(tokens: Token[], env: Record<string, number>): number | null {
  let pos = 0;

  function parseAddSub(): number | null {
    let left = parseMulDiv();
    if (left === null) return null;
    while (pos < tokens.length) {
      const t = tokens[pos];
      if (t.type === "op" && (t.op === "+" || t.op === "-")) {
        pos++;
        const right = parseMulDiv();
        if (right === null) return null;
        left = t.op === "+" ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseMulDiv(): number | null {
    let left = parseUnary();
    if (left === null) return null;
    while (pos < tokens.length) {
      const t = tokens[pos];
      if (t.type === "op" && (t.op === "*" || t.op === "/")) {
        pos++;
        const right = parseUnary();
        if (right === null) return null;
        if (t.op === "/" && Math.abs(right) < 1e-12) return null;
        left = t.op === "*" ? left * right : left / right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): number | null {
    const t = tokens[pos];
    if (t && t.type === "op" && (t.op === "+" || t.op === "-")) {
      pos++;
      const val = parseUnary();
      if (val === null) return null;
      return t.op === "-" ? -val : val;
    }
    return parsePower();
  }

  function parsePower(): number | null {
    const base = parsePrimary();
    if (base === null) return null;
    const t = tokens[pos];
    if (t && t.type === "op" && t.op === "^") {
      pos++;
      const exp = parseUnary();
      if (exp === null) return null;
      return Math.pow(base, exp);
    }
    return base;
  }

  function parsePrimary(): number | null {
    const t = tokens[pos];
    if (!t) return null;
    if (t.type === "num") {
      pos++;
      return t.value;
    }
    if (t.type === "var") {
      pos++;
      return env[t.name] ?? 2.37;
    }
    if (t.type === "lparen") {
      pos++;
      const inner = parseAddSub();
      if (inner === null) return null;
      if (!tokens[pos] || tokens[pos].type !== "rparen") return null;
      pos++;
      return inner;
    }
    return null;
  }

  const res = parseAddSub();
  if (res === null || pos !== tokens.length || !Number.isFinite(res)) return null;
  return res;
}

const SAMPLE_ASSIGNMENTS: Array<Record<string, number>> = [
  { x: 1.7, y: -2.3, a: 3.1, b: -1.4, m: 2.2, n: 0.9, t: 1.5 },
  { x: -2.9, y: 1.6, a: -1.8, b: 2.7, m: -0.7, n: 3.3, t: 2.8 },
  { x: 0.65, y: 3.4, a: 1.25, b: 4.1, m: 1.9, n: -2.1, t: -1.3 },
  { x: 4.2, y: -0.8, a: -2.5, b: -3.2, m: 3.6, n: 1.4, t: 0.45 },
];

export function areAlgebraicExpressionsEquivalent(exprA: string, exprB: string): boolean {
  const tokA = tokenizeExpression(exprA);
  const tokB = tokenizeExpression(exprB);
  if (!tokA || !tokB || tokA.length === 0 || tokB.length === 0) return false;

  let validComparisons = 0;
  for (const env of SAMPLE_ASSIGNMENTS) {
    const valA = evaluateTokens(tokA, env);
    const valB = evaluateTokens(tokB, env);
    if (valA === null || valB === null) continue;
    validComparisons++;
    if (Math.abs(valA - valB) > 1e-7) {
      return false;
    }
  }
  return validComparisons >= 3;
}

export interface GradeResult {
  isCorrect: boolean;
  normalizedAnswer: string;
  detectedMisconception?: string;
}

function splitUnorderedParts(s: string): string[] {
  return s
    .replace(/\b(?:or|and)\b/gi, ",")
    .replace(/或|和/g, ",")
    .split(/[,;]/)
    .map((p) => p.replace(/^[a-zA-Z]\d?\s*=\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Grade any student answer against a GeneratedQuestionInstance and pinpoint cognitive misconceptions!
 */
export function gradeQuestionResponse(
  instance: GeneratedQuestionInstance,
  rawUserAnswer: string
): GradeResult {
  const normalized = normalizeAnswerText(rawUserAnswer);
  if (!normalized) {
    return { isCorrect: false, normalizedAnswer: "" };
  }

  // 1. Multiple Choice
  if (instance.itemType === "choice" && instance.choices) {
    const upper = normalized.toUpperCase();
    const matchedChoice = instance.choices.find(
      (c) =>
        c.key === upper ||
        normalizeAnswerText(c.text).toLowerCase() === normalized.toLowerCase() ||
        (c.textEn && normalizeAnswerText(c.textEn).toLowerCase() === normalized.toLowerCase())
    );
    const isCorrect =
      matchedChoice?.key === instance.answer.toUpperCase() ||
      upper === instance.answer.toUpperCase();

    return {
      isCorrect,
      normalizedAnswer: matchedChoice?.key ?? normalized,
      detectedMisconception: isCorrect ? undefined : matchedChoice?.misconceptionTag,
    };
  }

  const stripped = stripKnownUnit(normalized, instance.unit);

  // Helper to check misconception lookup table on wrong numeric/expression values
  const matchMisconceptionValue = (candidate: string): string | undefined => {
    if (!instance.misconceptionsByValue) return undefined;
    const candRat = parseRational(candidate);
    for (const [wrongVal, tag] of Object.entries(instance.misconceptionsByValue)) {
      if (normalizeAnswerText(wrongVal).toLowerCase() === candidate.toLowerCase()) {
        return tag;
      }
      const wrongRat = parseRational(wrongVal);
      if (candRat && wrongRat && areRationalsEqual(candRat, wrongRat)) {
        return tag;
      }
      if (areAlgebraicExpressionsEquivalent(candidate, wrongVal)) {
        return tag;
      }
    }
    return undefined;
  };

  // 2. Unordered multi-root answers (e.g., quadratic roots "5, -1" === "-1, 5")
  if (instance.unorderedMulti) {
    const expectedParts = splitUnorderedParts(instance.answer);
    const userParts = splitUnorderedParts(stripped);

    if (userParts.length === expectedParts.length) {
      const used = new Set<number>();
      let allMatched = true;
      for (const up of userParts) {
        const upRat = parseRational(up);
        const idx = expectedParts.findIndex((ep, i) => {
          if (used.has(i)) return false;
          const epRat = parseRational(ep);
          if (upRat && epRat) return areRationalsEqual(upRat, epRat);
          return normalizeAnswerText(ep).toLowerCase() === up.toLowerCase();
        });
        if (idx === -1) {
          allMatched = false;
          break;
        }
        used.add(idx);
      }
      if (allMatched) {
        return { isCorrect: true, normalizedAnswer: stripped };
      }
    }

    return {
      isCorrect: false,
      normalizedAnswer: stripped,
      detectedMisconception: matchMisconceptionValue(stripped),
    };
  }

  // 3. Exact Rational / Numeric comparison + acceptedEquivalents
  const candidates = [instance.answer, ...(instance.acceptedEquivalents ?? [])];
  const userRat = parseRational(stripped);

  for (const exp of candidates) {
    const expClean = stripKnownUnit(normalizeAnswerText(exp), instance.unit);
    if (expClean.toLowerCase() === stripped.toLowerCase()) {
      return { isCorrect: true, normalizedAnswer: stripped };
    }
    const expRat = parseRational(expClean);
    if (userRat && expRat && areRationalsEqual(userRat, expRat)) {
      return { isCorrect: true, normalizedAnswer: stripped };
    }
    if (
      instance.itemType === "expression" &&
      areAlgebraicExpressionsEquivalent(stripped, expClean)
    ) {
      return { isCorrect: true, normalizedAnswer: stripped };
    }
  }

  return {
    isCorrect: false,
    normalizedAnswer: stripped,
    detectedMisconception: matchMisconceptionValue(stripped),
  };
}
