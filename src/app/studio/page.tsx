"use client";

import React, { useState } from "react";
import {
  FlaskConical,
  GitFork,
  ShieldAlert,
  PlusCircle,
  Trash2,
  TrendingUp,
  BookPlus,
  CheckCircle2,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import {
  biPick,
  localizeCustomEdgeReason,
  localizeCustomQuestionExplanation,
  uiPick,
} from "@/lib/i18n";
import {
  getDifficultyLabel,
  getRelationTypeLabel,
} from "@/lib/i18n/ui-common";
import {
  STUDIO_COPY,
  localizeCreatorName,
} from "@/lib/i18n/copy-educator-parent";
import type { DifficultyTier } from "@/types/taxonomy";

export default function SchoolStudioPage() {
  const {
    data,
    loading,
    locale,
    pick,
    localizePlain,
    userName,
    activeStudentId,
    activeStudent,
    refreshData,
  } = usePlatform();

  const [tab, setTab] = useState<"edges" | "questions" | "irt">("edges");

  // --- Tab 1: Custom School Prerequisite Edge State ---
  const [edgeTopicId, setEdgeTopicId] = useState<string>(
    "mt_phy_work_kinetic_energy"
  );
  const [edgePrereqId, setEdgePrereqId] = useState<string>(
    "mt_math_quad_function_parabola"
  );
  const [edgeRelType, setEdgeRelType] = useState<string>("cross_subject");
  const [edgeReasonInput, setEdgeReasonInput] = useState<string>("");
  const [edgeFeedback, setEdgeFeedback] = useState<{
    ok: boolean;
    msg?: string;
    cyclePath?: string[];
  } | null>(null);
  const [edgeBusy, setEdgeBusy] = useState(false);

  // --- Tab 2: Custom KaTeX Question Authoring State (Locale-reactive when untouched) ---
  const [qTopicId, setQTopicId] = useState<string>("mt_math_quad_complete_sq");
  const [qTier, setQTier] = useState<DifficultyTier>("standard");
  const [qPrompt, setQPrompt] = useState<string | null>(null);
  const [qLatex, setQLatex] = useState<string>(
    "x^2 - 8x + 7 = (x - 4)^2 - 9 = 0"
  );
  const [optA, setOptA] = useState<string>("$x_1 = 7,\\; x_2 = 1$");
  const [optB, setOptB] = useState<string>("$x_1 = -7,\\; x_2 = -1$");
  const [optC, setOptC] = useState<string | null>(null);
  const [optD, setOptD] = useState<string>("$x_1 = 4,\\; x_2 = 3$");
  const [qAnswer, setQAnswer] = useState<"A" | "B" | "C" | "D">("A");
  const [qExplain, setQExplain] = useState<string | null>(null);
  const [qSavedId, setQSavedId] = useState<string | null>(null);
  const [qBusy, setQBusy] = useState(false);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(STUDIO_COPY.loading)}
      </div>
    );
  }

  const displayPrompt = qPrompt ?? pick(STUDIO_COPY.sampleQPrompt);
  const displayOptC = optC ?? pick(STUDIO_COPY.sampleOptC);
  const displayExplain = qExplain ?? pick(STUDIO_COPY.sampleQExplain);

  const submitCustomEdge = async (
    overrideTopic?: string,
    overridePrereq?: string
  ) => {
    setEdgeBusy(true);
    setEdgeFeedback(null);
    try {
      const trimmedReason = edgeReasonInput.trim();
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_edge",
          locale,
          topicId: overrideTopic ?? edgeTopicId,
          prerequisiteId: overridePrereq ?? edgePrereqId,
          relationType: edgeRelType,
          reasonZh:
            trimmedReason || uiPick("zh-CN", STUDIO_COPY.defaultEdgeReason),
          reasonEn:
            trimmedReason || uiPick("en", STUDIO_COPY.defaultEdgeReason),
          createdBy: "Ms. Evelyn Wang",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setEdgeFeedback({ ok: true });
        await refreshData();
      } else {
        setEdgeFeedback({
          ok: false,
          msg: json.error || pick(STUDIO_COPY.edgeAddFailedFallback),
          cyclePath: json.cyclePath,
        });
      }
    } finally {
      setEdgeBusy(false);
    }
  };

  const deleteCustomEdge = async (id: string) => {
    await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_edge", locale, id }),
    });
    await refreshData();
  };

  const submitCustomQuestion = async () => {
    setQBusy(true);
    setQSavedId(null);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_custom_question",
          locale,
          topicId: qTopicId,
          difficulty: qTier,
          promptZh:
            qPrompt !== null
              ? qPrompt
              : uiPick("zh-CN", STUDIO_COPY.sampleQPrompt),
          promptEn:
            qPrompt !== null
              ? qPrompt
              : uiPick("en", STUDIO_COPY.sampleQPrompt),
          latexFormula: qLatex,
          choicesJson: [optA, optB, displayOptC, optD],
          answer: qAnswer,
          explanationZh: displayExplain,
          createdBy: "Ms. Evelyn Wang",
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setQSavedId(String(json.id));
        await refreshData();
      }
    } finally {
      setQBusy(false);
    }
  };

  const deleteCustomQuestion = async (id: string) => {
    await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_custom_question", locale, id }),
    });
    await refreshData();
  };

  // IRT stats sorted by largest positive empirical difficulty drift (calibratedBeta - priorBeta)
  const irtList = [...(data.irtStats ?? [])].sort(
    (a, b) => b.calibratedBeta - b.priorBeta - (a.calibratedBeta - a.priorBeta)
  );

  // Longitudinal logs for active student (chronological)
  const studentLogs = [...(data.attemptLogs ?? [])]
    .filter((l) => l.studentId === activeStudentId)
    .reverse();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-indigo-400" />
            <span>{pick(STUDIO_COPY.headerTitle)}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {pick(STUDIO_COPY.headerSubtitle)}
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
          {(
            [
              { id: "edges", label: pick(STUDIO_COPY.tabEdges) },
              { id: "questions", label: pick(STUDIO_COPY.tabQuestions) },
              { id: "irt", label: pick(STUDIO_COPY.tabIrt) },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3.5 py-2 font-bold transition ${
                tab === t.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Custom School Edges + DAG Cycle Guard */}
      {tab === "edges" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>{pick(STUDIO_COPY.addEdgeTitle)}</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEdgeTopicId("mt_math_linear_eq_one");
                  setEdgePrereqId("mt_phy_ohm_law");
                  void submitCustomEdge(
                    "mt_math_linear_eq_one",
                    "mt_phy_ohm_law"
                  );
                }}
                className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-950/60 shrink-0"
              >
                {pick(STUDIO_COPY.demoCycleBtn)}
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  {pick(STUDIO_COPY.targetTopicLabel)}
                </label>
                <select
                  value={edgeTopicId}
                  onChange={(e) => setEdgeTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectId.toUpperCase()} · G{t.baselineGrade}]{" "}
                      {localizePlain(t.title)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  {pick(STUDIO_COPY.prereqTopicLabel)}
                </label>
                <select
                  value={edgePrereqId}
                  onChange={(e) => setEdgePrereqId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectId.toUpperCase()} · G{t.baselineGrade}]{" "}
                      {localizePlain(t.title)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    {pick(STUDIO_COPY.relTypeLabel)}
                  </label>
                  <select
                    value={edgeRelType}
                    onChange={(e) => setEdgeRelType(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="hard">
                      hard ({getRelationTypeLabel("hard", locale)})
                    </option>
                    <option value="cross_subject">
                      cross_subject (
                      {getRelationTypeLabel("cross_subject", locale)})
                    </option>
                    <option value="soft">
                      soft ({getRelationTypeLabel("soft", locale)})
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">
                    {pick(STUDIO_COPY.reasonLabel)}
                  </label>
                  <input
                    type="text"
                    value={edgeReasonInput}
                    onChange={(e) => setEdgeReasonInput(e.target.value)}
                    placeholder={pick(STUDIO_COPY.defaultEdgeReason)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void submitCustomEdge()}
              disabled={edgeBusy}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{pick(STUDIO_COPY.saveEdgeBtn)}</span>
            </button>

            {edgeFeedback && (
              <div
                className={`rounded-xl border p-3.5 text-xs space-y-1.5 ${
                  edgeFeedback.ok
                    ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-200"
                    : "border-rose-500/40 bg-rose-950/30 text-rose-200"
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {edgeFeedback.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span>
                    {edgeFeedback.ok
                      ? pick(STUDIO_COPY.edgeSavedBanner)
                      : edgeFeedback.msg ||
                        pick(STUDIO_COPY.edgeAddFailedFallback)}
                  </span>
                </div>
                {edgeFeedback.cyclePath && (
                  <div className="font-mono text-[11px] bg-slate-950/80 rounded-lg p-2 text-rose-300">
                    {pick(STUDIO_COPY.cyclePathPrefix)}
                    {edgeFeedback.cyclePath
                      .map((tid) => {
                        const found = data.topics.find((t) => t.id === tid);
                        return found ? localizePlain(found.title) : tid;
                      })
                      .join(" ➔ ")}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-bold text-white">
              {STUDIO_COPY.activeEdgesTitle(
                (data.customEdges ?? []).length,
                data.edges.length,
                locale
              )}
            </h2>

            <div className="space-y-2.5">
              {(data.customEdges ?? []).map((ce) => {
                const tObj = data.topics.find((t) => t.id === ce.topicId);
                const pObj = data.topics.find(
                  (t) => t.id === ce.prerequisiteId
                );
                return (
                  <div
                    key={ce.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white">
                        {pObj ? localizePlain(pObj.title) : ce.prerequisiteId}{" "}
                        ➔ {tObj ? localizePlain(tObj.title) : ce.topicId}
                      </div>
                      <div className="text-slate-400">
                        {localizeCustomEdgeReason(ce, locale)}
                      </div>
                      <div className="text-[11px] text-indigo-300 font-mono">
                        {STUDIO_COPY.edgeMetaLine(
                          getRelationTypeLabel(ce.relationType, locale),
                          localizeCreatorName(ce.createdBy, locale),
                          locale
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteCustomEdge(ce.id)}
                      className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:border-rose-500/40 hover:text-rose-300"
                      title={pick(STUDIO_COPY.deleteEdgeTitle)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KaTeX Custom School Question Authoring */}
      {tab === "questions" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3.5 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookPlus className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{pick(STUDIO_COPY.authorQuestionTitle)}</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">
                  {pick(STUDIO_COPY.linkedTopicLabel)}
                </label>
                <select
                  value={qTopicId}
                  onChange={(e) => setQTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectId.toUpperCase()}] {localizePlain(t.title)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  {pick(STUDIO_COPY.difficultyTierLabel)}
                </label>
                <select
                  value={qTier}
                  onChange={(e) => setQTier(e.target.value as DifficultyTier)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="basic">
                    basic · {getDifficultyLabel("basic", locale)}
                  </option>
                  <option value="standard">
                    standard · {getDifficultyLabel("standard", locale)}
                  </option>
                  <option value="challenge">
                    challenge · {getDifficultyLabel("challenge", locale)}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                {pick(STUDIO_COPY.stemLabel)}
              </label>
              <textarea
                rows={3}
                value={displayPrompt}
                onChange={(e) => setQPrompt(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                {pick(STUDIO_COPY.latexLabel)}
              </label>
              <input
                type="text"
                value={qLatex}
                onChange={(e) => setQLatex(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-indigo-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <input
                value={optA}
                onChange={(e) => setOptA(e.target.value)}
                placeholder={STUDIO_COPY.optPlaceholder("A", locale)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder={STUDIO_COPY.optPlaceholder("B", locale)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                value={displayOptC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder={STUDIO_COPY.optPlaceholder("C", locale)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                placeholder={STUDIO_COPY.optPlaceholder("D", locale)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  {pick(STUDIO_COPY.correctOptionLabel)}
                </label>
                <select
                  value={qAnswer}
                  onChange={(e) =>
                    setQAnswer(e.target.value as "A" | "B" | "C" | "D")
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">
                  {pick(STUDIO_COPY.explanationLabel)}
                </label>
                <input
                  value={displayExplain}
                  onChange={(e) => setQExplain(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void submitCustomQuestion()}
              disabled={qBusy}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {pick(STUDIO_COPY.saveQuestionBtn)}
            </button>

            {qSavedId && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-emerald-300 font-semibold">
                {STUDIO_COPY.questionSavedBanner(qSavedId, locale)}
              </div>
            )}
          </div>

          {/* Right Col: Live KaTeX Preview + Existing School Question Bank */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-5 space-y-3">
              <div className="text-xs font-bold text-indigo-300">
                {pick(STUDIO_COPY.livePreviewHeader)}
              </div>
              <div className="text-sm font-semibold text-white">
                <MathText text={displayPrompt} />
              </div>
              {qLatex && (
                <div className="rounded-xl bg-slate-950 p-3 text-center text-indigo-200">
                  <MathText text={`$$${qLatex}$$`} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
                {[
                  { k: "A", v: optA },
                  { k: "B", v: optB },
                  { k: "C", v: displayOptC },
                  { k: "D", v: optD },
                ].map((o) => (
                  <div
                    key={o.k}
                    className={`rounded-lg border p-2 ${
                      qAnswer === o.k
                        ? "border-emerald-500/50 bg-emerald-950/20"
                        : "border-slate-800 bg-slate-950"
                    }`}
                  >
                    <strong className="mr-1.5 text-indigo-300">{o.k}.</strong>
                    <MathText text={o.v} />
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                {pick(STUDIO_COPY.explanationPreviewPrefix)}
                <MathText text={displayExplain} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <h3 className="text-xs font-bold text-white">
                {STUDIO_COPY.savedBankHeader(
                  (data.customQuestions ?? []).length,
                  locale
                )}
              </h3>
              {(data.customQuestions ?? []).map((cq) => (
                <div
                  key={cq.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white">
                      <MathText
                        text={biPick(locale, cq.promptZh, cq.promptEn)}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <MathText
                        text={localizeCustomQuestionExplanation(cq, locale)}
                      />
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono">
                      {STUDIO_COPY.savedQuestionMeta(
                        cq.answer,
                        getDifficultyLabel(cq.difficulty, locale),
                        localizeCreatorName(cq.createdBy, locale),
                        locale
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteCustomQuestion(cq.id)}
                    className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:text-rose-300"
                    title={pick(STUDIO_COPY.deleteQuestionTitle)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Elo-IRT 2PL Calibration Flywheel + Student Longitudinal Trajectory */}
      {tab === "irt" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Prior Beta vs Calibrated Beta Scatter + Top Drift Table */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{pick(STUDIO_COPY.scatterTitle)}</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {pick(STUDIO_COPY.scatterHint)}
              </span>
            </div>

            <svg
              viewBox="0 0 420 220"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2"
            >
              {/* Diagonal reference y = x */}
              <line
                x1="45"
                y1="190"
                x2="395"
                y2="25"
                stroke="#475569"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text x="50" y="208" fontSize="10" fill="#94a3b8">
                {pick(STUDIO_COPY.svgPriorAxis)}
              </text>
              <text x="12" y="22" fontSize="10" fill="#94a3b8">
                {pick(STUDIO_COPY.svgCalibratedAxis)}
              </text>
              {irtList.slice(0, 75).map((item) => {
                const cx = 220 + item.priorBeta * 62;
                const cy = 108 - item.calibratedBeta * 34;
                const drift = item.calibratedBeta - item.priorBeta;
                return (
                  <circle
                    key={item.templateId}
                    cx={Math.max(48, Math.min(392, cx))}
                    cy={Math.max(22, Math.min(192, cy))}
                    r={drift > 0.35 ? 4.5 : 3}
                    fill={drift > 0.35 ? "#f43f5e" : "#6366f1"}
                    fillOpacity={0.85}
                  />
                );
              })}
            </svg>

            <div className="text-xs font-bold text-rose-300">
              {pick(STUDIO_COPY.driftAlertTitle)}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">{pick(STUDIO_COPY.colTopic)}</th>
                    <th className="py-2">{pick(STUDIO_COPY.colPriorBeta)}</th>
                    <th className="py-2">
                      {pick(STUDIO_COPY.colCalibratedBeta)}
                    </th>
                    <th className="py-2">{pick(STUDIO_COPY.colAlpha)}</th>
                    <th className="py-2">{pick(STUDIO_COPY.colAccuracy)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {irtList.slice(0, 6).map((row) => {
                    const tObj = data.topics.find((t) => t.id === row.topicId);
                    const rate = Math.round(
                      (row.correct / Math.max(1, row.attempts)) * 100
                    );
                    return (
                      <tr key={row.templateId} className="text-slate-200">
                        <td className="py-2 font-semibold">
                          {tObj ? localizePlain(tObj.title) : row.topicId}
                        </td>
                        <td className="py-2 font-mono text-slate-400">
                          {row.priorBeta}
                        </td>
                        <td className="py-2 font-mono font-bold text-rose-300">
                          {row.calibratedBeta} (+
                          {(row.calibratedBeta - row.priorBeta).toFixed(2)})
                        </td>
                        <td className="py-2 font-mono text-indigo-300">
                          {row.discriminationAlpha}
                        </td>
                        <td className="py-2 font-mono">
                          {rate}% ({row.correct}/{row.attempts})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right 5 Cols: Student Longitudinal Ability Theta & Mastery Growth Curve */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <h2 className="text-sm font-bold text-white">
              {STUDIO_COPY.trajectoryTitle(
                activeStudent?.avatarEmoji ?? "",
                activeStudent ? userName(activeStudent) : "",
                locale
              )}
            </h2>
            <p className="text-xs text-slate-400">
              {pick(STUDIO_COPY.trajectoryDesc)}
            </p>

            {studentLogs.length > 0 ? (
              <>
                <svg
                  viewBox="0 0 340 175"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2"
                >
                  <line
                    x1="30"
                    y1="90"
                    x2="320"
                    y2="90"
                    stroke="#334155"
                    strokeDasharray="3 3"
                  />
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    points={studentLogs
                      .map((l, idx) => {
                        const x =
                          35 +
                          (idx / Math.max(1, studentLogs.length - 1)) * 275;
                        const y = 90 - l.thetaEstimate * 28;
                        return `${x},${Math.max(20, Math.min(155, y))}`;
                      })
                      .join(" ")}
                  />
                  {studentLogs.map((l, idx) => {
                    const x =
                      35 + (idx / Math.max(1, studentLogs.length - 1)) * 275;
                    const y = Math.max(
                      20,
                      Math.min(155, 90 - l.thetaEstimate * 28)
                    );
                    return (
                      <circle
                        key={l.id}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={l.isCorrect ? "#10b981" : "#f43f5e"}
                      />
                    );
                  })}
                </svg>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {studentLogs
                    .slice()
                    .reverse()
                    .map((l) => {
                      const tObj = data.topics.find((t) => t.id === l.topicId);
                      return (
                        <div
                          key={l.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">
                              {tObj ? localizePlain(tObj.title) : l.topicId}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              Token: {l.studentAnonToken}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div
                              className={
                                l.isCorrect
                                  ? "text-emerald-400 font-bold"
                                  : "text-rose-400 font-bold"
                              }
                            >
                              {l.isCorrect
                                ? pick(STUDIO_COPY.logHit)
                                : pick(STUDIO_COPY.logMiss)}{" "}
                              · θ={l.thetaEstimate}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {STUDIO_COPY.logMasteryProb(
                                Math.round(l.pMasteryAfter * 100),
                                locale
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-400">
                {pick(STUDIO_COPY.emptyTrajectory)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
