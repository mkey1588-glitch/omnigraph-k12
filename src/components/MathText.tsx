"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
  displayMode?: boolean;
}

export interface TokenizedMathSegment {
  isMath: boolean;
  displayMode?: boolean;
  raw: string;
  html?: string;
}

const CURRENCY_TOKEN = "\u0000CUR\u0000";

/**
 * Tokenizes mixed prose + LaTeX (`$$...$$`, `\[...\]`, `\(...\)`, `$...$`) while safely
 * preserving escaped `\$`, prefixed currencies (`HK$`, `NT$`, `S$`, `US$`), and bare US dollar
 * amounts (`$85`, `$10 base`, `$3/km`) without corrupting digit-leading math (`$0$`, `$13\text{ g}$`, `$24^\circ\text{C}$`).
 */
export function tokenizeMathText(text: string, displayMode = false): TokenizedMathSegment[] {
  if (!text) return [];

  if (displayMode) {
    // Strip outer $...$ or $$...$$ if caller passed delimited formula into displayMode
    const trimmed = text.trim();
    const unwrapped =
      trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length > 4
        ? trimmed.slice(2, -2)
        : trimmed.startsWith("$") && trimmed.endsWith("$") && trimmed.length > 2 && !trimmed.slice(1, -1).includes("$")
          ? trimmed.slice(1, -1)
          : text;
    try {
      return [
        {
          isMath: true,
          displayMode: true,
          raw: unwrapped,
          html: katex.renderToString(unwrapped, {
            displayMode: true,
            throwOnError: false,
            strict: false,
          }),
        },
      ];
    } catch {
      return [{ isMath: false, raw: text }];
    }
  }

  // 1. Protect explicit `\$` escapes and regional currency prefixes (`HK$`, `NT$`, `S$`, `US$`)
  let protectedText = text
    .replace(/\\\$/g, CURRENCY_TOKEN)
    .replace(/(?:HK|NT|S|US)\$(?=\d)/g, (m) => `${m.slice(0, -1)}${CURRENCY_TOKEN}`);

  // 2. Protect bare US dollar prices like "$85", "$32, and", "$10 base", "$3/km":
  //    Only triggers when `$<digits>` is NOT closed by `$` and NOT followed by math operators/commands (`\`, `^`, `_`, `+`, `-`, `*`, `/ `, `=`, `<`, `>`).
  protectedText = protectedText.replace(
    /\$(?=\d+(?:,\d{3})*(?:\.\d{1,2})?(?:\/[A-Za-z]+|(?:[.,;:!?)\]，。；：！？、（）]?(?:\s+|$))(?!\s*[\d+\-*/=<>\\^_$])))/g,
    CURRENCY_TOKEN
  );

  // 3. Match block/inline LaTeX spans
  const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\n$]+?\$)/g;
  const segments: TokenizedMathSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(protectedText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        isMath: false,
        raw: protectedText.slice(lastIndex, match.index).replaceAll(CURRENCY_TOKEN, "$"),
      });
    }

    const token = match[0];
    const isBlock = token.startsWith("$$") || token.startsWith("\\[");
    const inner =
      token.startsWith("$$") || token.startsWith("\\[") || token.startsWith("\\(")
        ? token.slice(2, -2)
        : token.slice(1, -1);

    try {
      segments.push({
        isMath: true,
        displayMode: isBlock,
        raw: inner.replaceAll(CURRENCY_TOKEN, "$"),
        html: katex.renderToString(inner.replaceAll(CURRENCY_TOKEN, "\\$"), {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
        }),
      });
    } catch {
      segments.push({
        isMath: false,
        raw: token.replaceAll(CURRENCY_TOKEN, "$"),
      });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < protectedText.length) {
    segments.push({
      isMath: false,
      raw: protectedText.slice(lastIndex).replaceAll(CURRENCY_TOKEN, "$"),
    });
  }

  return segments;
}

/**
 * Renders lightweight inline Markdown (`**bold**`, `` `code` ``) and preserves line breaks / leading indentation
 * inside plain-text segments without touching math nodes.
 */
function renderFormattedProse(raw: string, keyPrefix: string): React.ReactNode {
  const lines = raw.split("\n");
  return lines.map((line, lineIdx) => {
    const leadingMatch = line.match(/^( +)/);
    const normalizedLine = leadingMatch
      ? "\u00A0".repeat(leadingMatch[1].length) + line.slice(leadingMatch[1].length)
      : line;

    const inlineNodes: React.ReactNode[] = [];
    const inlineRe = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let tokIdx = 0;

    while ((m = inlineRe.exec(normalizedLine)) !== null) {
      if (m.index > last) {
        inlineNodes.push(normalizedLine.slice(last, m.index));
      }
      const tok = m[0];
      if (tok.startsWith("`") && tok.endsWith("`")) {
        inlineNodes.push(
          <code
            key={`${keyPrefix}-c-${lineIdx}-${tokIdx++}`}
            className="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[0.92em] text-amber-200 border border-slate-700/70"
          >
            {tok.slice(1, -1)}
          </code>
        );
      } else if (tok.startsWith("**") && tok.endsWith("**")) {
        inlineNodes.push(
          <strong key={`${keyPrefix}-b-${lineIdx}-${tokIdx++}`} className="font-semibold text-white">
            {tok.slice(2, -2)}
          </strong>
        );
      }
      last = inlineRe.lastIndex;
    }

    if (last < normalizedLine.length) {
      inlineNodes.push(normalizedLine.slice(last));
    }

    return (
      <React.Fragment key={`${keyPrefix}-ln-${lineIdx}`}>
        {lineIdx > 0 && <br />}
        {inlineNodes}
      </React.Fragment>
    );
  });
}

export function MathText({
  text,
  className = "",
  displayMode = false,
}: MathTextProps) {
  const segments = useMemo(() => tokenizeMathText(text, displayMode), [text, displayMode]);

  return (
    <span className={className}>
      {segments.map((seg, idx) =>
        seg.isMath && seg.html ? (
          <span
            key={idx}
            dangerouslySetInnerHTML={{ __html: seg.html }}
          />
        ) : (
          <React.Fragment key={idx}>
            {renderFormattedProse(seg.raw, `seg-${idx}`)}
          </React.Fragment>
        )
      )}
    </span>
  );
}
