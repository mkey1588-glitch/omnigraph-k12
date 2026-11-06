"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
  className?: string;
  displayMode?: boolean;
}

/**
 * Renders pure LaTeX (when `displayMode` is true) OR mixed prose containing
 * `$$...$$` / `$...$` / `\(...\)` math segments via KaTeX, while safely
 * ignoring regional currency prefixes (`HK$`, `NT$`, `S$`, `US$`, `$120`).
 */
export function MathText({
  text,
  className = "",
  displayMode = false,
}: MathTextProps) {
  const htmlParts = useMemo(() => {
    if (!text) return [];

    if (displayMode) {
      try {
        return [
          {
            isMath: true,
            html: katex.renderToString(text, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            }),
          },
        ];
      } catch {
        return [{ isMath: false, html: text }];
      }
    }

    // Protect regional currencies (HK$120, NT$80, S$50, $40) before splitting math delimiters
    const CURRENCY_TOKEN = "\u0000CUR\u0000";
    const protectedText = text.replace(
      /(?:HK|NT|S|US)?\$(?=\d)/g,
      (m) => `${m.slice(0, -1)}${CURRENCY_TOKEN}`
    );

    // Match $$...$$, \[...\], \(...\), or inline $...$
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\n$]+?\$)/g;
    const segments: Array<{ isMath: boolean; html: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(protectedText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          isMath: false,
          html: protectedText
            .slice(lastIndex, match.index)
            .replaceAll(CURRENCY_TOKEN, "$"),
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
          html: katex.renderToString(inner.replaceAll(CURRENCY_TOKEN, "\\$"), {
            displayMode: isBlock,
            throwOnError: false,
            strict: false,
          }),
        });
      } catch {
        segments.push({
          isMath: false,
          html: token.replaceAll(CURRENCY_TOKEN, "$"),
        });
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < protectedText.length) {
      segments.push({
        isMath: false,
        html: protectedText.slice(lastIndex).replaceAll(CURRENCY_TOKEN, "$"),
      });
    }

    return segments;
  }, [text, displayMode]);

  return (
    <span className={className}>
      {htmlParts.map((part, idx) =>
        part.isMath ? (
          <span
            key={idx}
            dangerouslySetInnerHTML={{ __html: part.html }}
          />
        ) : (
          <React.Fragment key={idx}>{part.html}</React.Fragment>
        )
      )}
    </span>
  );
}
