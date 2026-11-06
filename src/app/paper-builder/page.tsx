"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  Sparkles,
  CheckSquare,
  ShieldAlert,
  FileCheck2,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import {
  localizeChoice,
  localizeExplanation,
  localizePrompt,
  localizeSvgDiagram,
} from "@/lib/i18n";
import {
  getCognitiveTypeLabel,
  getDifficultyLabel,
} from "@/lib/i18n/ui-common";
import { PAPER_COPY } from "@/lib/i18n/copy-educator-parent";
import type { SubjectId } from "@/types/taxonomy";
import type { SmartExamBundle } from "@/lib/engines/smart-capture-and-paper";

export default function PaperBuilderPage() {
  const {
    data,
    loading,
    locale,
    bilingual,
    regionCode,
    setRegionCode,
    pick,
    localizePlain,
    regionName,
    getAlignment,
  } = usePlatform();

  const [subjectId, setSubjectId] = useState<SubjectId>("math");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState<number>(8);
  const [basicPct, setBasicPct] = useState<number>(30);
  const [standardPct, setStandardPct] = useState<number>(50);
  const [challengePct, setChallengePct] = useState<number>(20);
  const [includeCustom, setIncludeCustom] = useState<boolean>(true);
  const [paperTitle, setPaperTitle] = useState<string>("");
  const [lastSeed, setLastSeed] = useState<string>("initial_demo_paper_2026");

  const [generating, setGenerating] = useState(false);
  const [bundle, setBundle] = useState<SmartExamBundle | null>(null);
  const [activeTab, setActiveTab] = useState<
    "blueprint" | "paperA" | "paperB" | "answerKey"
  >("blueprint");

  const subjectTopics = useMemo(
    () =>
      (data?.topics ?? [])
        .filter((t) => t.subjectId === subjectId)
        .sort((a, b) => a.baselineGrade - b.baselineGrade),
    [data, subjectId]
  );

  // Pre-select up to 5 representative topics whenever subject changes
  useEffect(() => {
    if (subjectTopics.length > 0) {
      setSelectedTopicIds(
        subjectTopics
          .slice(0, Math.min(5, subjectTopics.length))
          .map((t) => t.id)
      );
    }
  }, [subjectTopics]);

  const generatePapers = useCallback(
    async (customSeed?: string) => {
      const seedToUse =
        customSeed || `exam_${regionCode}_${subjectId}_${Date.now()}`;
      setLastSeed(seedToUse);
      setGenerating(true);
      try {
        const res = await fetch("/api/paper", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paperTitle,
            regionCode,
            locale,
            subjectId,
            topicIds: selectedTopicIds,
            totalItems,
            includeCustom,
            paperSeed: seedToUse,
            ratio: { basicPct, standardPct, challengePct },
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setBundle(json.bundle as SmartExamBundle);
        }
      } finally {
        setGenerating(false);
      }
    },
    [
      paperTitle,
      regionCode,
      locale,
      subjectId,
      selectedTopicIds,
      totalItems,
      includeCustom,
      basicPct,
      standardPct,
      challengePct,
    ]
  );

  useEffect(() => {
    if (data && selectedTopicIds.length > 0 && !bundle) {
      void generatePapers("initial_demo_paper_2026");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedTopicIds.length]);

  // Re-sync bundle metadata cleanly when locale or regionCode changes
  useEffect(() => {
    if (data && selectedTopicIds.length > 0 && bundle) {
      void generatePapers(lastSeed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, regionCode]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(PAPER_COPY.loading)}
      </div>
    );
  }

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resolveTopicTitle = (topicId: string, fallback: string) => {
    const found = data.topics.find((t) => t.id === topicId);
    return found ? localizePlain(found.title) : fallback;
  };

  const resolvedBundleTitle = bundle
    ? paperTitle.trim() || PAPER_COPY.defaultBundleTitle(bundle.regionCode, locale)
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header (Hidden on A4 Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
            <span>{pick(PAPER_COPY.headerTitle)}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {pick(PAPER_COPY.headerSubtitleBefore)}
            <strong>{pick(PAPER_COPY.headerSubtitleBold)}</strong>
            {pick(PAPER_COPY.headerSubtitleAfter)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
        >
          <Printer className="h-4 w-4" />
          <span>{pick(PAPER_COPY.printBtn)}</span>
        </button>
      </div>

      {/* Config Panel (Hidden on Print) */}
      <div className="no-print grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">
            {pick(PAPER_COPY.step1Title)}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {pick(PAPER_COPY.regionLabel)}
              </label>
              <select
                value={regionCode}
                onChange={(e) =>
                  setRegionCode(e.target.value as typeof regionCode)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {data.regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.code} · {regionName(r.code)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {pick(PAPER_COPY.subjectLabel)}
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {localizePlain(s.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {pick(PAPER_COPY.totalItemsLabel)}
              </label>
              <input
                type="number"
                min={4}
                max={20}
                value={totalItems}
                onChange={(e) => setTotalItems(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {pick(PAPER_COPY.customTitleLabel)}
              </label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder={PAPER_COPY.paperTitlePlaceholder(
                  regionCode,
                  locale
                )}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Difficulty Ratio Sliders */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-300">
              <span>{pick(PAPER_COPY.ratioHeader)}</span>
              <span className="font-mono text-indigo-300">
                {PAPER_COPY.ratioSummary(
                  basicPct,
                  standardPct,
                  challengePct,
                  locale
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-emerald-300">
                  {getDifficultyLabel("basic", locale)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={10}
                  value={basicPct}
                  onChange={(e) => setBasicPct(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-indigo-300">
                  {getDifficultyLabel("standard", locale)}
                </span>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={10}
                  value={standardPct}
                  onChange={(e) => setStandardPct(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-amber-300">
                  {getDifficultyLabel("challenge", locale)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={10}
                  value={challengePct}
                  onChange={(e) => setChallengePct(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCustom}
              onChange={(e) => setIncludeCustom(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{pick(PAPER_COPY.includeCustomLabel)}</span>
          </label>

          <button
            type="button"
            onClick={() => void generatePapers()}
            disabled={generating || selectedTopicIds.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {generating
                ? pick(PAPER_COPY.generatingBtn)
                : pick(PAPER_COPY.generateBtn)}
            </span>
          </button>
        </div>

        {/* Chapter / Topic Multi-Select */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>
                {PAPER_COPY.step2Title(
                  regionCode,
                  selectedTopicIds.length,
                  subjectTopics.length,
                  locale
                )}
              </span>
            </h2>
            <div className="flex gap-2 text-xs shrink-0">
              <button
                type="button"
                onClick={() =>
                  setSelectedTopicIds(subjectTopics.map((t) => t.id))
                }
                className="text-indigo-300 hover:underline"
              >
                {pick(PAPER_COPY.selectAllBtn)}
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedTopicIds(
                    subjectTopics.slice(0, 3).map((t) => t.id)
                  )
                }
                className="text-slate-400 hover:underline"
              >
                {pick(PAPER_COPY.selectTop3Btn)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
            {subjectTopics.map((t) => {
              const aln = getAlignment(t.id);
              const checked = selectedTopicIds.includes(t.id);
              return (
                <label
                  key={t.id}
                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs cursor-pointer transition ${
                    checked
                      ? "border-indigo-500/60 bg-indigo-950/30 text-white"
                      : "border-slate-800 bg-slate-950/60 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(t.id)}
                    className="mt-0.5 accent-indigo-500"
                  />
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-100">
                      {localizePlain(t.title)}
                    </div>
                    <div className="text-[11px] text-indigo-300 font-mono">
                      {aln?.localStageLabel} · {aln?.standardCode}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {aln?.localChapterTitle}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generated Exam Bundle Tabs & Printable Sheet */}
      {bundle && (
        <div className="space-y-4">
          {/* Tab Switcher */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-2">
            <div className="flex flex-wrap gap-1 text-xs">
              {(
                [
                  { id: "blueprint", label: pick(PAPER_COPY.tabBlueprint) },
                  { id: "paperA", label: pick(PAPER_COPY.tabPaperA) },
                  { id: "paperB", label: pick(PAPER_COPY.tabPaperB) },
                  { id: "answerKey", label: pick(PAPER_COPY.tabAnswerKey) },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2 font-bold transition ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="px-3 text-xs text-slate-400 font-mono">
              {PAPER_COPY.bundleSummaryPrefix(
                bundle.totalPoints,
                bundle.totalItems,
                locale
              )}
              <strong className="text-emerald-300">{bundle.averageBeta}</strong>
            </div>
          </div>

          {/* TAB 1: Two-Way Specification Matrix */}
          {activeTab === "blueprint" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 print:border-slate-300 print:bg-white print:text-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 print:border-slate-300 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white print:text-slate-900">
                    {PAPER_COPY.blueprintTitle(resolvedBundleTitle, locale)}
                  </h3>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {PAPER_COPY.blueprintSubtitle(
                      regionName(bundle.regionCode),
                      bundle.regionCode,
                      bundle.totalPoints,
                      locale
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 print:text-emerald-700">
                  <ShieldAlert className="h-3.5 w-3.5" />{" "}
                  {pick(PAPER_COPY.zeroDuplicateBadge)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700">
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colItemNo)}</th>
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colTopic)}</th>
                      <th className="py-2.5 px-2">
                        {PAPER_COPY.colStdCode(bundle.regionCode, locale)}
                      </th>
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colChapter)}</th>
                      <th className="py-2.5 px-2">
                        {pick(PAPER_COPY.colCognitive)}
                      </th>
                      <th className="py-2.5 px-2">
                        {pick(PAPER_COPY.colDifficulty)}
                      </th>
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colIrtBeta)}</th>
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colPoints)}</th>
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colAnsA)}</th>
                      <th className="py-2.5 px-2">{pick(PAPER_COPY.colAnsB)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 print:divide-slate-200">
                    {bundle.blueprint.map((row) => {
                      const rowAln = getAlignment(
                        row.topicId,
                        bundle.regionCode
                      );
                      return (
                        <tr
                          key={row.itemNumber}
                          className="text-slate-200 print:text-slate-900"
                        >
                          <td className="py-2.5 px-2 font-mono font-bold">
                            #{row.itemNumber}
                          </td>
                          <td className="py-2.5 px-2 font-semibold">
                            {resolveTopicTitle(row.topicId, row.topicTitle)}
                            {row.sourceType === "school_custom" && (
                              <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300 print:text-amber-700">
                                {pick(PAPER_COPY.schoolCustomBadge)}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-indigo-300 print:text-indigo-700">
                            {row.standardCode}
                          </td>
                          <td className="py-2.5 px-2 text-slate-400 print:text-slate-600">
                            {rowAln?.localChapterTitle ?? row.localChapterTitle}
                          </td>
                          <td className="py-2.5 px-2 text-[11px]">
                            {getCognitiveTypeLabel(row.cognitiveType, locale)}
                          </td>
                          <td className="py-2.5 px-2">
                            <span
                              className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                row.difficulty === "basic"
                                  ? "bg-emerald-500/15 text-emerald-300 print:text-emerald-700"
                                  : row.difficulty === "standard"
                                    ? "bg-indigo-500/15 text-indigo-300 print:text-indigo-700"
                                    : "bg-amber-500/15 text-amber-300 print:text-amber-700"
                              }`}
                            >
                              {getDifficultyLabel(row.difficulty, locale)}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-mono">
                            {row.calibratedBeta}
                          </td>
                          <td className="py-2.5 px-2 font-bold">
                            {PAPER_COPY.pointsValue(row.points, locale)}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-emerald-300 print:text-emerald-700">
                            {row.answerA}
                          </td>
                          <td className="py-2.5 px-2 font-mono text-violet-300 print:text-violet-700">
                            {row.answerB}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2 & TAB 3: Printable Paper A or Paper B */}
          {(activeTab === "paperA" || activeTab === "paperB") && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-8 print:border-none print:bg-white print:text-black space-y-6">
              <div className="text-center border-b border-slate-700 print:border-slate-400 pb-4 space-y-2">
                <div className="inline-block rounded-md border border-indigo-500/40 px-3 py-0.5 text-xs font-bold text-indigo-300 print:border-black print:text-black">
                  {activeTab === "paperA"
                    ? pick(PAPER_COPY.paperABadge)
                    : pick(PAPER_COPY.paperBBadge)}
                </div>
                <h2 className="text-xl font-bold text-white print:text-black">
                  {resolvedBundleTitle}
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-700 whitespace-pre-wrap">
                  {PAPER_COPY.studentInfoLine(bundle.totalPoints, locale)}
                </p>
              </div>

              <div className="space-y-6">
                {(activeTab === "paperA" ? bundle.paperA : bundle.paperB).map(
                  (item) => {
                    const svgHtml = localizeSvgDiagram(
                      item.instance.svgDiagram,
                      locale
                    );
                    return (
                      <div
                        key={item.itemNumber}
                        className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-400 print:text-slate-600">
                          <span className="font-bold text-indigo-300 print:text-black">
                            {PAPER_COPY.paperItemHeading(
                              item.itemNumber,
                              item.points,
                              item.standardCode,
                              resolveTopicTitle(item.topicId, item.topicTitle),
                              locale
                            )}
                          </span>
                          {item.sourceType === "school_custom" && (
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-300 print:text-black">
                              {pick(PAPER_COPY.schoolCustomBadge)}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-medium text-white print:text-black whitespace-pre-line leading-relaxed">
                          <MathText
                            text={localizePrompt(
                              item.instance,
                              locale,
                              bilingual
                            )}
                          />
                        </div>

                        {item.instance.latexFormula && (
                          <div className="py-1 text-sm text-indigo-200 print:text-black">
                            <MathText
                              text={`$$${item.instance.latexFormula}$$`}
                            />
                          </div>
                        )}

                        {svgHtml && (
                          <div
                            className="max-w-xs py-2"
                            dangerouslySetInnerHTML={{
                              __html: svgHtml,
                            }}
                          />
                        )}

                        {item.instance.choices ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 print:text-black pt-1">
                            {item.instance.choices.map((ch) => (
                              <div key={ch.key} className="py-1">
                                <strong className="mr-1.5">{ch.key}.</strong>
                                <MathText
                                  text={localizeChoice(ch, locale, bilingual)}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="pt-2 text-xs text-slate-400 print:text-slate-700">
                            {PAPER_COPY.answerBlankLine(
                              item.instance.unit,
                              locale
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Teacher Answer Key & Detailed Solutions */}
          {activeTab === "answerKey" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-6 print:bg-white print:text-black space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileCheck2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white print:text-black">
                  {pick(PAPER_COPY.answerKeyHeader)}
                </h3>
              </div>

              <div className="space-y-4">
                {bundle.paperA.map((itemA, idx) => {
                  const itemB = bundle.paperB[idx];
                  return (
                    <div
                      key={itemA.itemNumber}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 print:border-slate-300 print:bg-white space-y-2 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-white print:text-black">
                        <span>
                          {PAPER_COPY.paperItemHeading(
                            itemA.itemNumber,
                            itemA.points,
                            itemA.standardCode,
                            resolveTopicTitle(itemA.topicId, itemA.topicTitle),
                            locale
                          )}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/15 p-3 space-y-1">
                          <div className="font-bold text-emerald-300 print:text-black">
                            {pick(PAPER_COPY.paperAKeyLabel)}
                            <code>{itemA.instance.answer}</code>
                          </div>
                          <div className="text-slate-300 print:text-slate-700 leading-relaxed whitespace-pre-line">
                            <MathText
                              text={localizeExplanation(
                                itemA.instance,
                                locale,
                                bilingual
                              )}
                            />
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-500/25 bg-violet-950/15 p-3 space-y-1">
                          <div className="font-bold text-violet-300 print:text-black">
                            {pick(PAPER_COPY.paperBKeyLabel)}
                            <code>{itemB.instance.answer}</code>
                          </div>
                          <div className="text-slate-300 print:text-slate-700 leading-relaxed whitespace-pre-line">
                            <MathText
                              text={localizeExplanation(
                                itemB.instance,
                                locale,
                                bilingual
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
