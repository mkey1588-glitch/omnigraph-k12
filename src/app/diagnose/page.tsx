"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Crosshair,
  Sparkles,
  Send,
  Lightbulb,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Bot,
  ListChecks,
  Layers,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import { InteractiveWidget } from "@/components/InteractiveWidget";
import {
  localizeAssignmentTitle,
  localizeChoice,
  localizeExplanation,
  localizePrompt,
  localizeScaffold,
  localizeSvgDiagram,
  localizeWhyAsked,
} from "@/lib/i18n";
import {
  getDifficultyLabel,
  getLoadingText,
  getSubjectShortBadge,
} from "@/lib/i18n/ui-common";
import { DIAGNOSE_COPY } from "@/lib/i18n/copy-student-core";
import type {
  DiagnosticSessionState,
  GeneratedQuestionInstance,
  SubjectId,
} from "@/types/taxonomy";

interface PromptPayload {
  topicId: string;
  difficulty: string;
  whyAskedZh: string;
  whyAskedEn: string;
  instance: GeneratedQuestionInstance;
}

interface SummaryPayload {
  masteredIds: string[];
  inferredMasteredIds: string[];
  shakyIds: string[];
  weakIds: string[];
  weakRootIds: string[];
  remedialPathIds: string[];
  accuracyPercent: number;
}

function DiagnoseStudioContent() {
  const searchParams = useSearchParams();
  const queryTopic = searchParams.get("topic");
  const queryTopics = searchParams.get("topics");

  const {
    data,
    loading,
    locale,
    regionCode,
    bilingual,
    activeStudentId,
    activeStudent,
    pick,
    localize,
    userName,
    regionName,
    getAlignment,
    refreshData,
  } = usePlatform();

  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    queryTopic || "mt_phy_ohm_law"
  );
  const [session, setSession] = useState<DiagnosticSessionState | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptPayload | null>(
    null
  );
  const [summary, setSummary] = useState<SummaryPayload | null>(null);

  const [userAnswer, setUserAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [stepFeedback, setStepFeedback] = useState<{
    isCorrect: boolean;
    instance: GeneratedQuestionInstance;
    expectedAnswer: string;
    detectedMisconception?: string;
    prunedCount: number;
    pushedCount: number;
    autoCompletedAssignment: boolean;
    pendingNextPrompt: PromptPayload | null;
    pendingSummary: SummaryPayload | null;
  } | null>(null);

  // Scaffolds reveal count
  const [revealedScaffolds, setRevealedScaffolds] = useState<number>(0);

  // Socratic AI Tutor chat + Step-by-Step Working Checker state
  const [tutorMessages, setTutorMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [tutorInput, setTutorInput] = useState("");
  const [stepCheckOpen, setStepCheckOpen] = useState(false);
  const [stepsDraft, setStepsDraft] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMeta, setTutorMeta] = useState<{
    provider?: string;
    code?: string;
  }>({});

  const autoLaunchedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (queryTopic) {
      setSelectedTargetId(queryTopic);
    }
  }, [queryTopic]);

  const startDiagnosis = useCallback(
    async (
      overrideTopicIds?: string[],
      mode: "target" | "grade_screen" = "target"
    ) => {
      if (!data) return;
      const targets = overrideTopicIds ?? [selectedTargetId];
      const firstTopic = data.topics.find((t) => t.id === targets[0]);
      const subjectId: SubjectId = firstTopic?.subjectId ?? "math";

      setSubmitting(true);
      setSummary(null);
      setStepFeedback(null);
      setTutorMessages([]);
      setRevealedScaffolds(0);
      setUserAnswer("");

      try {
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "start",
            studentId: activeStudentId,
            subjectId,
            regionCode,
            locale,
            mode,
            targetTopicIds: targets,
            confirmRequired: 2,
            maxQuestions: 12,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setSession(json.session as DiagnosticSessionState);
          setCurrentPrompt(json.nextPrompt as PromptPayload);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [data, selectedTargetId, activeStudentId, regionCode, locale]
  );

  // Auto-launch multi-node assignment pack when arriving via `?topics=id1,id2`
  useEffect(() => {
    if (!data || !queryTopics || session) return;
    if (autoLaunchedQueryRef.current === queryTopics) return;
    const parsed = queryTopics
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parsed.length > 0) {
      autoLaunchedQueryRef.current = queryTopics;
      setSelectedTargetId(parsed[0]);
      void startDiagnosis(parsed, "target");
    }
  }, [data, queryTopics, session, startDiagnosis]);

  const submitAnswer = async (overrideChoice?: string) => {
    if (!session || !currentPrompt || submitting) return;
    const ans = (overrideChoice ?? userAnswer).trim();
    if (!ans) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          sessionId: session.sessionId,
          locale,
          session,
          instance: currentPrompt.instance,
          userAnswer: ans,
          whyAskedZh: currentPrompt.whyAskedZh,
          whyAskedEn: currentPrompt.whyAskedEn,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSession(json.session as DiagnosticSessionState);
        setStepFeedback({
          isCorrect: json.outcome.isCorrect,
          instance: currentPrompt.instance,
          expectedAnswer: currentPrompt.instance.answer,
          detectedMisconception: json.outcome.detectedMisconception,
          prunedCount: json.outcome.prunedAncestors?.length ?? 0,
          pushedCount: json.outcome.pushedPrerequisites?.length ?? 0,
          autoCompletedAssignment:
            (json.syncResult?.autoCompletedAssignmentIds?.length ?? 0) > 0,
          pendingNextPrompt: json.nextPrompt ?? null,
          pendingSummary: json.summary ?? null,
        });
        await refreshData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const proceedToNextStep = () => {
    if (!stepFeedback) return;
    if (stepFeedback.pendingSummary) {
      setSummary(stepFeedback.pendingSummary);
      setCurrentPrompt(null);
    } else {
      setCurrentPrompt(stepFeedback.pendingNextPrompt);
    }
    setStepFeedback(null);
    setUserAnswer("");
    setRevealedScaffolds(0);
    setTutorMessages([]);
    setStepsDraft("");
  };

  const askSocraticTutor = async (
    customPrompt?: string,
    checkStepsMode = false
  ) => {
    if (!currentPrompt || tutorLoading) return;
    const content = (
      customPrompt ?? (checkStepsMode ? stepsDraft : tutorInput)
    ).trim();
    if (!content) return;

    const nextMsgs = [...tutorMessages, { role: "user" as const, content }];
    setTutorMessages(nextMsgs);
    if (checkStepsMode) {
      setStepsDraft("");
    } else if (!customPrompt) {
      setTutorInput("");
    }
    setTutorLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: currentPrompt.topicId,
          regionCode,
          locale,
          bilingual,
          question: currentPrompt.instance,
          studentWrongAnswer:
            stepFeedback && !stepFeedback.isCorrect ? userAnswer : undefined,
          detectedMisconceptionTag: stepFeedback?.detectedMisconception,
          studentId: activeStudentId,
          checkStepsMode,
          stream: true,
          messages: nextMsgs,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedText = "";

        setTutorMessages([...nextMsgs, { role: "assistant", content: "" }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";

          for (const frame of frames) {
            const lines = frame.split("\n");
            let eventType = "message";
            let dataLine = "";
            for (const ln of lines) {
              if (ln.startsWith("event:")) {
                eventType = ln.slice(6).trim();
              } else if (ln.startsWith("data:")) {
                dataLine = ln.slice(5).trim();
              }
            }
            if (!dataLine) continue;
            try {
              const payload = JSON.parse(dataLine) as Record<string, unknown>;
              if (eventType === "meta") {
                setTutorMeta({
                  provider: String(payload.provider ?? ""),
                  code: String(payload.groundedStandardCode ?? ""),
                });
              } else if (eventType === "delta") {
                streamedText += String(payload.text ?? "");
                const snapshot = streamedText;
                setTutorMessages([
                  ...nextMsgs,
                  { role: "assistant", content: snapshot },
                ]);
              }
            } catch {
              // Ignore malformed SSE frame
            }
          }
        }
      } else {
        const json = await res.json();
        if (json.ok) {
          setTutorMessages([
            ...nextMsgs,
            { role: "assistant", content: json.reply as string },
          ]);
          setTutorMeta({
            provider: json.provider,
            code: json.groundedStandardCode,
          });
        }
      }
    } finally {
      setTutorLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(DIAGNOSE_COPY.loading)}
      </div>
    );
  }

  const currentTopicObj = currentPrompt
    ? data.topics.find((t) => t.id === currentPrompt.topicId)
    : undefined;
  const currentAln = currentPrompt
    ? getAlignment(currentPrompt.topicId)
    : undefined;

  const localizedSvg = currentPrompt
    ? localizeSvgDiagram(currentPrompt.instance.svgDiagram, locale)
    : undefined;

  const pendingAssignments = data.assignments.filter(
    (a) =>
      a.assignedStudentIdsJson.includes(activeStudentId) &&
      !a.completedStudentIdsJson.includes(activeStudentId)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Crosshair className="h-6 w-6 text-indigo-400" />
            <span>{pick(DIAGNOSE_COPY.pageTitle)}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {pick(DIAGNOSE_COPY.pageSubtitle)}
          </p>
        </div>

        {session && (
          <button
            onClick={() => {
              setSession(null);
              setCurrentPrompt(null);
              setSummary(null);
              setStepFeedback(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-indigo-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{pick(DIAGNOSE_COPY.reselectTargetBtn)}</span>
          </button>
        )}
      </div>

      {/* STATE 1: Session Launcher */}
      {!session && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
            <h2 className="text-base font-bold text-white">
              {DIAGNOSE_COPY.launcherHeading(
                activeStudent?.avatarEmoji ?? "",
                activeStudent ? userName(activeStudent) : "",
                regionName(regionCode),
                locale
              )}
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {pick(DIAGNOSE_COPY.selectTopicLabel)}
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {data.topics.map((t) => {
                  const aln = getAlignment(t.id);
                  return (
                    <option key={t.id} value={t.id}>
                      [{getSubjectShortBadge(t.subjectId, locale)} ·{" "}
                      {aln?.localStageLabel}] {localize(t.title)} (
                      {aln?.standardCode})
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={() => void startDiagnosis([selectedTargetId], "target")}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition"
            >
              <Crosshair className="h-4 w-4" />
              <span>{pick(DIAGNOSE_COPY.startDiagnoseBtn)}</span>
            </button>

            {pendingAssignments.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-2.5">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>{pick(DIAGNOSE_COPY.pendingAssignmentsTitle)}</span>
                </div>
                <div className="space-y-2">
                  {pendingAssignments.map((asg) => (
                    <button
                      key={asg.id}
                      type="button"
                      onClick={() =>
                        void startDiagnosis(asg.targetTopicIdsJson, "target")
                      }
                      className="w-full flex items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/20 px-3.5 py-2.5 text-left hover:border-indigo-400 transition"
                    >
                      <span className="text-xs font-semibold text-slate-100">
                        {localizeAssignmentTitle(asg, locale)}
                      </span>
                      <span className="shrink-0 rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-200">
                        {asg.targetTopicIdsJson.length}× DAG →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400">
                {pick(DIAGNOSE_COPY.demoScriptsLabel)}
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  onClick={() =>
                    void startDiagnosis(["mt_phy_ohm_law"], "target")
                  }
                  className="text-left rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 hover:border-purple-400 transition"
                >
                  <div className="text-xs font-bold text-purple-300">
                    {pick(DIAGNOSE_COPY.demoOhmTitle)}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    {pick(DIAGNOSE_COPY.demoOhmDesc)}
                  </p>
                </button>
                <button
                  onClick={() =>
                    void startDiagnosis(
                      ["mt_math_quad_function_parabola"],
                      "target"
                    )
                  }
                  className="text-left rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 hover:border-indigo-400 transition"
                >
                  <div className="text-xs font-bold text-indigo-300">
                    {pick(DIAGNOSE_COPY.demoQuadTitle)}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    {pick(DIAGNOSE_COPY.demoQuadDesc)}
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>{pick(DIAGNOSE_COPY.howItWorksTitle)}</span>
            </h3>
            <div className="rounded-xl bg-slate-950/80 p-3 space-y-1">
              <div className="font-semibold text-emerald-300">
                {pick(DIAGNOSE_COPY.rule1Title)}
              </div>
              <p className="text-slate-400">{pick(DIAGNOSE_COPY.rule1Desc)}</p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-3 space-y-1">
              <div className="font-semibold text-amber-300">
                {pick(DIAGNOSE_COPY.rule2Title)}
              </div>
              <p className="text-slate-400">{pick(DIAGNOSE_COPY.rule2Desc)}</p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-3 space-y-1">
              <div className="font-semibold text-purple-300">
                {pick(DIAGNOSE_COPY.rule3Title)}
              </div>
              <p className="text-slate-400">{pick(DIAGNOSE_COPY.rule3Desc)}</p>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: Active Diagnostic Cockpit + Socratic AI Tutor */}
      {session && currentPrompt && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left 7 Cols: Question Card & Scaffolds */}
          <div className="lg:col-span-7 space-y-4">
            {/* Causal Backtracking Transparency Banner */}
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/35 px-4 py-3 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-indigo-300">
                  {DIAGNOSE_COPY.engineLiveBanner(
                    session.history.length + 1,
                    session.maxQuestions,
                    getDifficultyLabel(currentPrompt.difficulty, locale),
                    locale
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {typeof session.studentTheta === "number" && (
                    <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 font-mono text-[10px] text-indigo-200">
                      {DIAGNOSE_COPY.mfiThetaBadge(session.studentTheta, locale)}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-slate-300">
                    {currentAln?.standardCode} · {currentAln?.localStageLabel}
                  </span>
                </div>
              </div>
              {(session.warmStartSkippedCount ?? 0) > 0 && (
                <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  {DIAGNOSE_COPY.warmStartBadge(
                    session.warmStartSkippedCount ?? 0,
                    locale
                  )}
                </div>
              )}
              <p className="text-xs text-slate-200">
                {localizeWhyAsked(currentPrompt, locale)}
              </p>
              {bilingual &&
                (locale === "zh-CN" || locale === "zh-TW") &&
                currentPrompt.whyAskedEn && (
                  <p className="text-[11px] text-indigo-200/80">
                    {currentPrompt.whyAskedEn}
                  </p>
                )}
            </div>

            {/* Question Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold text-indigo-400">
                  {pick(DIAGNOSE_COPY.currentSkillPrefix)}
                  {currentTopicObj ? localize(currentTopicObj.title) : ""}
                </span>
                <h2 className="mt-2 text-base font-semibold leading-relaxed text-white whitespace-pre-line">
                  <MathText
                    text={localizePrompt(
                      currentPrompt.instance,
                      locale,
                      bilingual
                    )}
                  />
                </h2>
              </div>

              {/* Highlighted KaTeX Formula Card */}
              {currentPrompt.instance.latexFormula && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/25 px-4 py-3 text-center text-sm text-indigo-200">
                  <MathText text={`$$${currentPrompt.instance.latexFormula}$$`} />
                </div>
              )}

              {/* Clean-Room Inline SVG Diagram */}
              {localizedSvg && (
                <div
                  className="flex justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-4"
                  dangerouslySetInnerHTML={{
                    __html: localizedSvg,
                  }}
                />
              )}

              {/* Interactive Manipulative Widget (Number Line / Ohm Parallel Lab / Function Probe) */}
              {currentPrompt.instance.interactiveWidget && !stepFeedback && (
                <InteractiveWidget
                  config={currentPrompt.instance.interactiveWidget}
                  onSelectValue={(val) => setUserAnswer(val)}
                />
              )}

              {/* Answer Input Area */}
              {!stepFeedback ? (
                <div className="space-y-4">
                  {currentPrompt.instance.itemType === "choice" &&
                  currentPrompt.instance.choices ? (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {currentPrompt.instance.choices.map((ch) => (
                        <button
                          key={ch.key}
                          onClick={() => {
                            setUserAnswer(ch.key);
                            void submitAnswer(ch.key);
                          }}
                          disabled={submitting}
                          className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/90 p-3.5 text-left text-sm text-slate-100 hover:border-indigo-500 hover:bg-indigo-950/30 transition"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-mono text-xs font-bold text-indigo-300">
                            {ch.key}
                          </span>
                          <span>
                            <MathText
                              text={localizeChoice(ch, locale, bilingual)}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {["/", "^2", "-", ",", "%"].map((sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() =>
                              setUserAnswer((prev) => `${prev}${sym}`)
                            }
                            className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-slate-200 hover:border-indigo-400"
                          >
                            {sym}
                          </button>
                        ))}
                        {currentPrompt.instance.unit && (
                          <span className="self-center text-slate-400 ml-1">
                            {DIAGNOSE_COPY.unitHint(
                              currentPrompt.instance.unit,
                              locale
                            )}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void submitAnswer();
                          }}
                          placeholder={pick(DIAGNOSE_COPY.answerPlaceholder)}
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={() => void submitAnswer()}
                          disabled={submitting || !userAnswer.trim()}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          {pick(DIAGNOSE_COPY.submitAnswerBtn)}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progressive Scaffolds Drawer */}
                  {currentPrompt.instance.scaffolds.length > 0 && (
                    <div className="pt-1 space-y-2">
                      {revealedScaffolds <
                        currentPrompt.instance.scaffolds.length && (
                        <button
                          type="button"
                          onClick={() => setRevealedScaffolds((n) => n + 1)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200"
                        >
                          <Lightbulb className="h-3.5 w-3.5" />
                          <span>
                            {DIAGNOSE_COPY.revealScaffoldBtn(
                              revealedScaffolds + 1,
                              currentPrompt.instance.scaffolds.length,
                              locale
                            )}
                          </span>
                        </button>
                      )}
                      {currentPrompt.instance.scaffolds
                        .slice(0, revealedScaffolds)
                        .map((sc, idx) => {
                          const locSc = localizeScaffold(sc, locale);
                          const isFinalStep =
                            idx === currentPrompt.instance.scaffolds.length - 1;
                          return (
                            <div
                              key={idx}
                              className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs space-y-1"
                            >
                              <div className="font-semibold text-amber-300">
                                <MathText
                                  text={DIAGNOSE_COPY.scaffoldStepTitle(
                                    idx + 1,
                                    locSc.prompt,
                                    locale
                                  )}
                                />
                              </div>
                              <div className="text-slate-400">
                                {pick(DIAGNOSE_COPY.scaffoldHintPrefix)}
                                <MathText text={locSc.hint} />
                                {!isFinalStep && locSc.expected && (
                                  <>
                                    {" ("}
                                    {pick(DIAGNOSE_COPY.scaffoldRefPrefix)}
                                    <code className="text-emerald-300 font-mono">
                                      <MathText text={locSc.expected} />
                                    </code>
                                    {")"}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              ) : (
                /* Immediate Step Feedback Card */
                <div
                  className={`rounded-xl border p-4 space-y-3 ${
                    stepFeedback.isCorrect
                      ? "border-emerald-500/40 bg-emerald-950/25"
                      : "border-rose-500/40 bg-rose-950/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {stepFeedback.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          <span className="text-emerald-300">
                            {pick(DIAGNOSE_COPY.feedbackCorrect)}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-rose-400" />
                          <span className="text-rose-300">
                            {DIAGNOSE_COPY.feedbackWrong(
                              stepFeedback.expectedAnswer,
                              locale
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {stepFeedback.prunedCount > 0 && (
                    <div className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200">
                      ✨{" "}
                      <strong>{pick(DIAGNOSE_COPY.prunedBannerTitle)}</strong>
                      {DIAGNOSE_COPY.prunedBannerBody(
                        stepFeedback.prunedCount,
                        locale
                      )}
                    </div>
                  )}

                  {stepFeedback.pushedCount > 0 && (
                    <div className="rounded-lg bg-purple-500/15 px-3 py-2 text-xs text-purple-200">
                      🔍{" "}
                      <strong>{pick(DIAGNOSE_COPY.pushedBannerTitle)}</strong>
                      {DIAGNOSE_COPY.pushedBannerBody(
                        stepFeedback.pushedCount,
                        locale
                      )}
                    </div>
                  )}

                  {stepFeedback.autoCompletedAssignment && (
                    <div className="rounded-lg bg-indigo-500/20 border border-indigo-400/40 px-3 py-2 text-xs font-semibold text-indigo-200">
                      {pick(DIAGNOSE_COPY.syncAssignmentBanner)}
                    </div>
                  )}

                  <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                    <strong>{pick(DIAGNOSE_COPY.explanationPrefix)}</strong>
                    <MathText
                      text={localizeExplanation(
                        stepFeedback.instance,
                        locale,
                        bilingual
                      )}
                    />
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={proceedToNextStep}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      <span>
                        {stepFeedback.pendingSummary
                          ? pick(DIAGNOSE_COPY.generateReportBtn)
                          : pick(DIAGNOSE_COPY.nextDiagNodeBtn)}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {!stepFeedback.isCorrect && (
                      <button
                        onClick={() =>
                          void askSocraticTutor(
                            DIAGNOSE_COPY.wrongAnswerAutoPrompt(
                              userAnswer,
                              locale
                            )
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-800"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        <span>{pick(DIAGNOSE_COPY.askTutorReviewBtn)}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 5 Cols: KG-Grounded Socratic AI Tutor Sidebar */}
          <div className="lg:col-span-5">
            <div className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/75 p-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {pick(DIAGNOSE_COPY.tutorTitle)}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {DIAGNOSE_COPY.tutorSubtitle(
                        tutorMeta.code || currentAln?.standardCode || "",
                        locale
                      )}
                    </p>
                  </div>
                </div>
                {tutorMeta.provider && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                    {tutorMeta.provider}
                  </span>
                )}
              </div>

              <div className="my-3 flex-1 space-y-3 overflow-y-auto max-h-[380px] pr-1">
                {tutorMessages.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300 space-y-2.5">
                    <p>
                      {DIAGNOSE_COPY.tutorWelcomeIntro(
                        regionName(regionCode),
                        locale
                      )}
                    </p>
                    <p className="text-slate-400">
                      {pick(DIAGNOSE_COPY.tutorWelcomeHint)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {DIAGNOSE_COPY.tutorQuickPrompts(locale).map((q) => (
                        <button
                          key={q}
                          onClick={() => void askSocraticTutor(q)}
                          className="rounded-lg border border-indigo-500/30 bg-indigo-950/30 px-2.5 py-1 text-[11px] text-indigo-200 hover:border-indigo-400"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  tutorMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "ml-6 bg-indigo-600 text-white"
                          : "mr-4 border border-slate-800 bg-slate-950/90 text-slate-200"
                      }`}
                    >
                      <MathText text={m.content} />
                    </div>
                  ))
                )}
                {tutorLoading && (
                  <div className="text-xs text-indigo-300 animate-pulse">
                    {pick(DIAGNOSE_COPY.tutorThinking)}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStepCheckOpen((v) => !v)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition ${
                      stepCheckOpen
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                        : "border-slate-700 bg-slate-950 text-indigo-300 hover:border-indigo-400"
                    }`}
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                    <span>
                      {stepCheckOpen
                        ? pick(DIAGNOSE_COPY.stepCheckerCloseBtn)
                        : pick(DIAGNOSE_COPY.stepCheckerToggleBtn)}
                    </span>
                  </button>
                </div>

                {stepCheckOpen ? (
                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-2.5">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {pick(DIAGNOSE_COPY.stepCheckerHint)}
                    </p>
                    <textarea
                      rows={3}
                      value={stepsDraft}
                      onChange={(e) => setStepsDraft(e.target.value)}
                      placeholder={pick(DIAGNOSE_COPY.stepCheckerPlaceholder)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void askSocraticTutor(undefined, true)}
                      disabled={tutorLoading || !stepsDraft.trim()}
                      className="w-full rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {pick(DIAGNOSE_COPY.stepCheckerSubmitBtn)}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void askSocraticTutor();
                      }}
                      placeholder={pick(DIAGNOSE_COPY.tutorInputPlaceholder)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={() => void askSocraticTutor()}
                      disabled={tutorLoading || !tutorInput.trim()}
                      className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: Final Root-Cause & Topological Remediation Report */}
      {session && summary && (
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
                {pick(DIAGNOSE_COPY.reportCompletedBadge)}
              </span>
              <h2 className="mt-2 text-xl font-bold text-white">
                {DIAGNOSE_COPY.reportTitle(
                  session.history.length,
                  summary.accuracyPercent,
                  locale
                )}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/wrong-book"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                {pick(DIAGNOSE_COPY.reportGoWrongBook)}
              </Link>
              <Link
                href="/explore"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-400"
              >
                {pick(DIAGNOSE_COPY.reportGoExplore)}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-rose-300">
                {DIAGNOSE_COPY.reportWeakRootsTitle(
                  summary.weakRootIds.length,
                  locale
                )}
              </div>
              {summary.weakRootIds.length === 0 ? (
                <p className="text-xs text-slate-300">
                  {pick(DIAGNOSE_COPY.reportWeakRootsEmpty)}
                </p>
              ) : (
                summary.weakRootIds.map((id) => {
                  const t = data.topics.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className="rounded-lg bg-slate-950/80 px-3 py-2 text-xs text-white font-semibold"
                    >
                      [{t ? getSubjectShortBadge(t.subjectId, locale) : ""}]{" "}
                      {t ? localize(t.title) : id}
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-amber-300">
                {DIAGNOSE_COPY.reportShakyTitle(summary.shakyIds.length, locale)}
              </div>
              {summary.shakyIds.length === 0 ? (
                <p className="text-xs text-slate-300">
                  {pick(DIAGNOSE_COPY.reportShakyEmpty)}
                </p>
              ) : (
                summary.shakyIds.map((id) => {
                  const t = data.topics.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className="rounded-lg bg-slate-950/80 px-3 py-2 text-xs text-amber-200"
                    >
                      {t ? localize(t.title) : id}
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-300">
                {DIAGNOSE_COPY.reportMasteredTitle(
                  summary.masteredIds.length,
                  summary.inferredMasteredIds.length,
                  locale
                )}
              </div>
              <p className="text-xs text-slate-300">
                {pick(DIAGNOSE_COPY.reportSavedPrefix)}{" "}
                <strong className="text-emerald-300">
                  {summary.inferredMasteredIds.length * 2}
                </strong>{" "}
                {pick(DIAGNOSE_COPY.reportSavedSuffix)}
              </p>
            </div>
          </div>

          {summary.remedialPathIds.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
              <div className="text-xs font-bold text-indigo-300">
                {pick(DIAGNOSE_COPY.remedialPathTitle)}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {summary.remedialPathIds.map((id, idx) => {
                  const t = data.topics.find((x) => x.id === id);
                  const isRoot = summary.weakRootIds.includes(id);
                  return (
                    <React.Fragment key={id}>
                      {idx > 0 && (
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      )}
                      <Link
                        href={`/explore?topic=${id}`}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                          isRoot
                            ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
                            : "border-slate-700 bg-slate-900 text-slate-200"
                        }`}
                      >
                        {idx + 1}. {t ? localize(t.title) : id}
                        {isRoot ? pick(DIAGNOSE_COPY.remedialRootSuffix) : ""}
                      </Link>
                    </React.Fragment>
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

export default function DiagnosePage() {
  const { locale } = usePlatform();
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          {getLoadingText(locale)}
        </div>
      }
    >
      <DiagnoseStudioContent />
    </Suspense>
  );
}
