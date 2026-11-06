"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Eye, EyeOff, RefreshCw } from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import {
  localizeChoice,
  localizeExplanation,
  localizeMisconceptionLabel,
  localizePrompt,
  localizeSvgDiagram,
} from "@/lib/i18n";
import { PRINT_COPY } from "@/lib/i18n/copy-educator-parent";
import type { GeneratedQuestionInstance } from "@/types/taxonomy";

function PrintableWorksheetContent() {
  const searchParams = useSearchParams();
  const {
    data,
    loading,
    locale,
    bilingual,
    regionCode,
    activeStudentId,
    pick,
    localizePlain,
    userName,
    regionName,
    getAlignment,
  } = usePlatform();

  const targetStudentId = searchParams.get("studentId") || activeStudentId;
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [seedTick, setSeedTick] = useState(1);
  const [twinItems, setTwinItems] = useState<
    Array<{
      topicId: string;
      misconceptionTag: string | null;
      misconceptionLabel: string | null;
      instance: GeneratedQuestionInstance;
    }>
  >([]);

  const student = data?.users.find((u) => u.id === targetStudentId);

  useEffect(() => {
    if (!data) return;
    const wqs = data.wrongQuestions.filter(
      (w) => w.studentId === targetStudentId && w.status !== "cleared"
    );

    let cancelled = false;
    async function loadFreshTwins() {
      const generated: Array<{
        topicId: string;
        misconceptionTag: string | null;
        misconceptionLabel: string | null;
        instance: GeneratedQuestionInstance;
      }> = [];

      for (let i = 0; i < wqs.length; i++) {
        const wq = wqs[i];
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "preview_question",
            topicId: wq.topicId,
            difficulty: "standard",
            regionCode,
            seed: `print_${targetStudentId}_${seedTick}_${i}`,
            variantIndex: seedTick + i,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          generated.push({
            topicId: wq.topicId,
            misconceptionTag: wq.misconceptionTag,
            misconceptionLabel: wq.misconceptionLabel,
            instance: json.instance as GeneratedQuestionInstance,
          });
        }
      }
      if (!cancelled) {
        setTwinItems(generated);
      }
    }

    void loadFreshTwins();
    return () => {
      cancelled = true;
    };
  }, [data, targetStudentId, regionCode, seedTick]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(PRINT_COPY.loading)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Screen-only Action Bar (hidden during @media print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <Link
          href="/parent"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{pick(PRINT_COPY.backToParent)}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSeedTick((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-indigo-300 hover:border-indigo-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{pick(PRINT_COPY.refreshTwinBtn)}</span>
          </button>

          <button
            onClick={() => setShowAnswerKey((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            {showAnswerKey ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />{" "}
                {pick(PRINT_COPY.hideAnswerKeyBtn)}
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />{" "}
                {pick(PRINT_COPY.showAnswerKeyBtn)}
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{pick(PRINT_COPY.printPdfBtn)}</span>
          </button>
        </div>
      </div>

      {/* Printable A4 Sheet */}
      <div className="print-sheet rounded-2xl border border-slate-700 bg-white p-8 text-slate-900 shadow-2xl space-y-6">
        <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              {pick(PRINT_COPY.eyebrow)}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
              {pick(PRINT_COPY.sheetTitle)}
            </h1>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div className="font-semibold">
              {PRINT_COPY.studentLine(
                student ? userName(student) : "",
                regionName(regionCode),
                regionCode,
                locale
              )}
            </div>
            <div>{pick(PRINT_COPY.suggestedTimeLine)}</div>
          </div>
        </div>

        {twinItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">
            {pick(PRINT_COPY.noPendingMistakes)}
          </p>
        ) : (
          <div className="space-y-5">
            {twinItems.map((item, idx) => {
              const topic = data.topics.find((t) => t.id === item.topicId);
              const aln = getAlignment(item.topicId);
              const miscLabel =
                item.misconceptionTag || item.misconceptionLabel
                  ? localizeMisconceptionLabel(
                      {
                        misconceptionTag: item.misconceptionTag,
                        misconceptionLabel: item.misconceptionLabel,
                      },
                      topic,
                      locale
                    )
                  : "";
              const svgHtml = localizeSvgDiagram(
                item.instance.svgDiagram,
                locale
              );

              return (
                <div
                  key={`${item.instance.instanceId}_${idx}`}
                  className="print-card rounded-xl border border-slate-300 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-900">
                      {PRINT_COPY.itemHeader(
                        idx + 1,
                        topic ? localizePlain(topic.title) : item.topicId,
                        aln?.standardCode ?? "",
                        locale
                      )}
                    </span>
                    {miscLabel && (
                      <span className="text-amber-800">
                        {PRINT_COPY.misconceptionReminder(miscLabel, locale)}
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-slate-900 whitespace-pre-line leading-relaxed">
                    <MathText
                      text={localizePrompt(item.instance, locale, bilingual)}
                    />
                  </div>

                  {item.instance.latexFormula && (
                    <div className="py-1 text-sm text-slate-900">
                      <MathText text={`$$${item.instance.latexFormula}$$`} />
                    </div>
                  )}

                  {svgHtml && (
                    <div
                      className="py-2 text-slate-900 max-w-xs"
                      dangerouslySetInnerHTML={{
                        __html: svgHtml,
                      }}
                    />
                  )}

                  {item.instance.choices && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-800 pt-1">
                      {item.instance.choices.map((ch) => (
                        <div key={ch.key} className="py-0.5">
                          <strong className="mr-1.5">{ch.key}.</strong>
                          <MathText
                            text={localizeChoice(ch, locale, bilingual)}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Blank Workspace Box for Handwriting */}
                  <div className="mt-2 h-20 rounded-lg border border-dashed border-slate-300 p-2 text-[11px] text-slate-400">
                    {PRINT_COPY.handwritingBoxLabel(item.instance.unit, locale)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggleable Parent Answer Key */}
        {showAnswerKey && twinItems.length > 0 && (
          <div className="border-t-2 border-dashed border-slate-400 pt-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              {pick(PRINT_COPY.answerKeyTitle)}
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              {twinItems.map((item, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-line">
                  <strong>
                    {PRINT_COPY.answerItemPrefix(
                      idx + 1,
                      item.instance.answer,
                      item.instance.unit,
                      locale
                    )}
                  </strong>{" "}
                  —{" "}
                  <MathText
                    text={localizeExplanation(item.instance, locale, bilingual)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentPrintPage() {
  const { pick } = usePlatform();
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          {pick(PRINT_COPY.loading)}
        </div>
      }
    >
      <PrintableWorksheetContent />
    </Suspense>
  );
}
