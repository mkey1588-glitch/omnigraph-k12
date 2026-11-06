"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Crosshair,
  Globe2,
  BookOpen,
  AlertOctagon,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { KnowledgeGraphCanvas } from "@/components/KnowledgeGraphCanvas";
import { MathText } from "@/components/MathText";
import {
  getLoadingText,
  getMasteryStatusLabel,
  getRelationTypeLabel,
  getSubjectShortBadge,
} from "@/lib/i18n/ui-common";
import {
  EXPLORE_COPY,
  getLocalizedRootReason,
} from "@/lib/i18n/copy-student-core";
import type { SubjectId } from "@/types/taxonomy";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get("subject") || "stem_core";
  const initialTopic = searchParams.get("topic") || "mt_phy_ohm_law";

  const {
    data,
    loading,
    locale,
    regionCode,
    setRegionCode,
    pick,
    localize,
    localizePlain,
    regionName,
    getAlignment,
    getStudentTopicState,
  } = usePlatform();

  const [subjectFilter, setSubjectFilter] = useState<string>(initialSubject);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopic);
  const [inspectorTab, setInspectorTab] = useState<"lesson" | "crosswalk">(
    "lesson"
  );
  const [checkInput, setCheckInput] = useState<string>("");
  const [checkFeedback, setCheckFeedback] = useState<
    "idle" | "right" | "wrong"
  >("idle");

  useEffect(() => {
    const qSub = searchParams.get("subject");
    const qTop = searchParams.get("topic");
    if (qSub) setSubjectFilter(qSub);
    if (qTop) {
      setSelectedTopicId(qTop);
      setSubjectFilter("all");
    }
  }, [searchParams]);

  const filteredTopics = useMemo(() => {
    if (!data) return [];
    if (subjectFilter === "all") return data.topics;
    if (subjectFilter === "stem_core") {
      return data.topics.filter(
        (t) => t.subjectId === "math" || t.subjectId === "physics"
      );
    }
    return data.topics.filter(
      (t) => t.subjectId === (subjectFilter as SubjectId)
    );
  }, [data, subjectFilter]);

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-400">
        {pick(EXPLORE_COPY.loading)}
      </div>
    );
  }

  const stemCoreCount = data.topics.filter(
    (t) => t.subjectId === "math" || t.subjectId === "physics"
  ).length;

  const selectedTopic =
    data.topics.find((t) => t.id === selectedTopicId) ??
    filteredTopics[0] ??
    data.topics[0];

  const activeAln = getAlignment(selectedTopic.id);
  const activeState = getStudentTopicState(selectedTopic.id);

  const directPrereqs = data.edges
    .filter((e) => e.topicId === selectedTopic.id)
    .map((e) => ({
      edge: e,
      topic: data.topics.find((t) => t.id === e.prerequisiteId)!,
    }))
    .filter((x) => Boolean(x.topic));

  const directDownstream = data.edges
    .filter((e) => e.prerequisiteId === selectedTopic.id)
    .map((e) => ({
      edge: e,
      topic: data.topics.find((t) => t.id === e.topicId)!,
    }))
    .filter((x) => Boolean(x.topic));

  const firstStep = selectedTopic.microLesson.steps[0];

  const handleCheckAnswer = () => {
    if (!firstStep?.checkAnswer) return;
    const cleanUser = checkInput.trim().toLowerCase();
    const cleanExp = firstStep.checkAnswer.trim().toLowerCase();
    setCheckFeedback(cleanUser === cleanExp ? "right" : "wrong");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">
      {/* Header & Subject Filter Pills */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {pick(EXPLORE_COPY.title)}
          </h1>
          <p className="text-xs text-slate-400">
            {pick(EXPLORE_COPY.subtitle)}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setSubjectFilter("stem_core")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              subjectFilter === "stem_core"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
            }`}
          >
            {EXPLORE_COPY.stemCoreFilter(stemCoreCount, locale)}
          </button>
          <button
            onClick={() => setSubjectFilter("all")}
            className={`rounded-lg px-3 py-1.5 font-semibold transition ${
              subjectFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
            }`}
          >
            {EXPLORE_COPY.allSubjectsFilter(data.topics.length, locale)}
          </button>
          {data.subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSubjectFilter(s.id);
                const firstInSub = data.topics.find(
                  (t) => t.subjectId === s.id
                );
                if (firstInSub) setSelectedTopicId(firstInSub.id);
              }}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition ${
                subjectFilter === s.id
                  ? "bg-slate-800 text-white ring-1 ring-indigo-500"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {s.icon} {localizePlain(s.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split View: Left Interactive DAG Canvas (7 cols) + Right Topic Inspector (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <KnowledgeGraphCanvas
            topics={filteredTopics}
            edges={data.edges}
            selectedTopicId={selectedTopic.id}
            onSelectTopic={(id) => {
              setSelectedTopicId(id);
              setCheckInput("");
              setCheckFeedback("idle");
            }}
            getAlignment={getAlignment}
            getStudentState={getStudentTopicState}
          />

          {/* Causal Neighbors Bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="text-xs font-bold text-amber-300">
                {pick(EXPLORE_COPY.upstreamTitle)}
              </div>
              {directPrereqs.length === 0 ? (
                <p className="mt-1.5 text-xs text-slate-400">
                  🌱 {pick(EXPLORE_COPY.rootNodePrefix)}
                  {getLocalizedRootReason(
                    selectedTopic.id,
                    selectedTopic.rootReason,
                    locale
                  )}
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {directPrereqs.map(({ edge, topic }) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className="w-full text-left rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-xs hover:border-amber-500/40 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-100">
                          {localize(topic.title)}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.2 text-[10px] ${
                            edge.relationType === "cross_subject"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {getRelationTypeLabel(edge.relationType, locale)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {localize(edge.reason)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="text-xs font-bold text-sky-300">
                {pick(EXPLORE_COPY.downstreamTitle)}
              </div>
              {directDownstream.length === 0 ? (
                <p className="mt-1.5 text-xs text-slate-400">
                  {pick(EXPLORE_COPY.terminalNodeMsg)}
                </p>
              ) : (
                <div className="mt-2 space-y-1.5">
                  {directDownstream.map(({ edge, topic }) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className="w-full text-left rounded-lg border border-slate-800 bg-slate-950/70 p-2 text-xs hover:border-sky-500/40 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-100">
                          {localize(topic.title)}
                        </span>
                        <span className="shrink-0 rounded bg-sky-500/15 px-1.5 py-0.2 text-[10px] text-sky-300">
                          {edge.relationType === "cross_subject"
                            ? EXPLORE_COPY.crossEmpowerBadge(
                                getSubjectShortBadge(topic.subjectId, locale),
                                locale
                              )
                            : pick(EXPLORE_COPY.downstreamStepBadge)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {localize(edge.reason)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 cols: Micro-Lesson & 9-Region Standard Crosswalk */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            {/* Selected Topic Header */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono font-semibold text-indigo-300 border border-indigo-500/30">
                  {activeAln?.standardCode} · {activeAln?.localStageLabel}
                </span>
                <span className="text-slate-400">
                  {pick(EXPLORE_COPY.currentStatusLabel)}{" "}
                  <strong className="text-white">
                    {getMasteryStatusLabel(
                      activeState?.status ?? "untested",
                      locale
                    )}
                  </strong>{" "}
                  {activeState
                    ? `(${Math.round(activeState.pMastery * 100)}%)`
                    : ""}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white">
                {localize(selectedTopic.title)}
              </h2>
              <p className="text-xs text-slate-300">
                {localize(selectedTopic.description)}
              </p>
              <p className="text-[11px] text-indigo-300/90">
                📖{" "}
                {EXPLORE_COPY.textbookPosition(
                  activeAln?.textbookEdition ?? "",
                  activeAln?.localChapterTitle ?? "",
                  locale
                )}
              </p>

              <div className="pt-1 flex flex-wrap gap-2">
                <Link
                  href={`/diagnose?topic=${selectedTopic.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  <span>{pick(EXPLORE_COPY.launchDiagnoseFromNode)}</span>
                </Link>
              </div>
            </div>

            {/* Sub-Tabs: Interactive Micro-Lesson vs 9-Region Crosswalk */}
            <div className="flex rounded-xl bg-slate-950 p-1 text-xs">
              <button
                onClick={() => setInspectorTab("lesson")}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition ${
                  inspectorTab === "lesson"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                <span>{pick(EXPLORE_COPY.tabLesson)}</span>
              </button>
              <button
                onClick={() => setInspectorTab("crosswalk")}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold transition ${
                  inspectorTab === "crosswalk"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{pick(EXPLORE_COPY.tabCrosswalk)}</span>
              </button>
            </div>

            {inspectorTab === "lesson" ? (
              <div className="space-y-4">
                {/* Core Intuition & Formula */}
                <div className="rounded-xl border border-indigo-500/25 bg-indigo-950/25 p-3.5 space-y-2">
                  <div className="text-xs font-bold text-indigo-300">
                    {pick(EXPLORE_COPY.coreIntuitionTitle)}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">
                    {localize(selectedTopic.microLesson.intuition)}
                  </p>
                  {selectedTopic.microLesson.coreFormula && (
                    <div className="rounded-lg bg-slate-950/90 px-3 py-2 font-mono text-xs font-semibold text-emerald-300">
                      <MathText text={selectedTopic.microLesson.coreFormula} />
                    </div>
                  )}
                </div>

                {/* Mastery Criteria */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300">
                    {pick(EXPLORE_COPY.masteryCriteriaTitle)}
                  </div>
                  {selectedTopic.masteryCriteria.map((mc, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                      <span>{localize(mc)}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Micro-Step Quick Check */}
                {firstStep && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2.5">
                    <div className="text-xs font-bold text-white">
                      🧩 {localize(firstStep.title)}
                    </div>
                    <p className="text-xs text-slate-300">
                      {localize(firstStep.body)}
                    </p>
                    {firstStep.checkQuestion && (
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-semibold text-indigo-300">
                          ⚡ {pick(EXPLORE_COPY.quickCheckPrefix)}
                          {localize(firstStep.checkQuestion)}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={checkInput}
                            onChange={(e) => {
                              setCheckInput(e.target.value);
                              setCheckFeedback("idle");
                            }}
                            placeholder={pick(
                              EXPLORE_COPY.quickCheckPlaceholder
                            )}
                            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                          <button
                            onClick={handleCheckAnswer}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            {pick(EXPLORE_COPY.quickCheckBtn)}
                          </button>
                        </div>
                        {checkFeedback === "right" && (
                          <p className="text-xs text-emerald-400 font-semibold">
                            {pick(EXPLORE_COPY.quickCheckRight)}
                          </p>
                        )}
                        {checkFeedback === "wrong" && (
                          <p className="text-xs text-amber-300">
                            {pick(EXPLORE_COPY.quickCheckWrongPrefix)}{" "}
                            <code className="font-mono font-bold">
                              {firstStep.checkAnswer}
                            </code>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Common Misconception Warning */}
                {selectedTopic.microLesson.misconceptions.map((m) => (
                  <div
                    key={m.tag}
                    className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <AlertOctagon className="h-4 w-4 shrink-0 text-amber-400" />
                      <span>
                        {pick(EXPLORE_COPY.misconceptionAlertPrefix)}
                        {localize(m.label)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>{pick(EXPLORE_COPY.wrongPatternLabel)}</strong>
                      {localize(m.wrongPattern)}
                    </p>
                    <p className="text-xs text-emerald-300/90">
                      <strong>{pick(EXPLORE_COPY.remediationTipLabel)}</strong>
                      {localize(m.remediationTip)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* 9-Region Curriculum Crosswalk Matrix */
              <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
                {data.regions.map((reg) => {
                  const aln = getAlignment(selectedTopic.id, reg.code);
                  const isCurrent = reg.code === regionCode;
                  return (
                    <div
                      key={reg.code}
                      onClick={() => setRegionCode(reg.code)}
                      className={`cursor-pointer rounded-xl border p-3 text-xs transition ${
                        isCurrent
                          ? "border-indigo-500 bg-indigo-950/35"
                          : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white">
                          {reg.flag} {regionName(reg.code)} ({reg.code}) ·{" "}
                          {aln?.localStageLabel}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-0.5 font-mono text-[11px] text-indigo-300">
                          {aln?.standardCode}
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                      <div className="mt-1 text-slate-300">
                        {EXPLORE_COPY.wrapChapterTitle(
                          aln?.localChapterTitle ?? "",
                          locale
                        )}{" "}
                        <span className="text-slate-500">
                          ({aln?.textbookEdition})
                        </span>
                      </div>
                      {aln?.regionalNote && (
                        <div className="mt-1 text-[11px] text-emerald-300">
                          ★ {pick(EXPLORE_COPY.regionalNotePrefix)}
                          {aln.regionalNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const { locale } = usePlatform();
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          {getLoadingText(locale)}
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
