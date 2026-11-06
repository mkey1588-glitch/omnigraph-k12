"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpenCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Bot,
  Send,
} from "lucide-react";
import {
  usePlatform,
  type EnrichedWrongQuestion,
} from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import { InteractiveWidget } from "@/components/InteractiveWidget";
import type { GeneratedQuestionInstance } from "@/types/taxonomy";
import {
  localizeChoice,
  localizeExplanation,
  localizeMisconceptionLabel,
  localizePrompt,
  localizeSvgDiagram,
} from "@/lib/i18n";
import { getSubjectShortBadge } from "@/lib/i18n/ui-common";
import {
  WRONG_BOOK_COPY,
  localizeWrongUserAnswer,
} from "@/lib/i18n/copy-capture-clearance-auth";

export default function WrongBookPage() {
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
    getAlignment,
    refreshData,
  } = usePlatform();

  const [tab, setTab] = useState<"pending" | "cleared">("pending");
  const [activeWqId, setActiveWqId] = useState<string | null>(null);
  const [twinInstance, setTwinInstance] =
    useState<GeneratedQuestionInstance | null>(null);
  const [twinAnswer, setTwinAnswer] = useState<string>("");
  const [selfRating, setSelfRating] = useState<1 | 2 | 3 | 4>(3);
  const [twinResult, setTwinResult] = useState<{
    isCorrect: boolean;
    status: string;
    streak: number;
    nextStability: number;
    scheduledDays: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  // Socratic AI Coach state
  const [tutorMessages, setTutorMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [tutorInput, setTutorInput] = useState<string>("");
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);

  // Clear cached tutor conversation when UI language switches so no stale locale text remains
  useEffect(() => {
    setTutorMessages([]);
  }, [locale]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(WRONG_BOOK_COPY.loading)}
      </div>
    );
  }

  const allStudentWqs = data.wrongQuestions.filter(
    (w) => w.studentId === activeStudentId
  );
  const pendingWqs = allStudentWqs.filter((w) => w.status !== "cleared");
  const clearedWqs = allStudentWqs.filter((w) => w.status === "cleared");
  const shownList = tab === "pending" ? pendingWqs : clearedWqs;

  const activeWq =
    allStudentWqs.find((w) => w.id === activeWqId) ?? null;

  const studentDisplayName = activeStudent ? userName(activeStudent) : "";
  const studentHeaderLabel = activeStudent
    ? `${activeStudent.avatarEmoji} ${studentDisplayName}`
    : studentDisplayName;

  const spawnTwin = async (wq: EnrichedWrongQuestion) => {
    setBusy(true);
    setActiveWqId(wq.id);
    setTwinResult(null);
    setTwinAnswer("");
    setSelfRating(3);
    setTutorMessages([]);
    setTutorInput("");
    try {
      const res = await fetch("/api/wrong-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "spawn_twin",
          wrongQuestionId: wq.id,
          regionCode,
          locale,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setTwinInstance(json.twinInstance as GeneratedQuestionInstance);
      }
    } finally {
      setBusy(false);
    }
  };

  const submitTwinAttempt = async (overrideAns?: string) => {
    if (!activeWq || !twinInstance || busy) return;
    const rawAns = overrideAns ?? twinAnswer;
    const ans =
      rawAns.trim() || (selfRating === 1 ? "__AGAIN__" : "");
    if (!ans) return;

    setBusy(true);
    try {
      const res = await fetch("/api/wrong-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_twin",
          wrongQuestionId: activeWq.id,
          twinInstance,
          userAnswer: ans,
          selfRating,
          regionCode,
          locale,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setTwinResult({
          isCorrect: json.grade.isCorrect,
          status: json.scheduled.status,
          streak: json.scheduled.twinClearStreak,
          nextStability: json.scheduled.stability,
          scheduledDays: json.scheduled.scheduledDays,
        });
        await refreshData();
      }
    } finally {
      setBusy(false);
    }
  };

  const askSocraticCoach = async (customPrompt?: string) => {
    if (!activeWq || !twinInstance || tutorLoading) return;
    const content = (customPrompt ?? tutorInput).trim();
    if (!content) return;

    const nextMessages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...tutorMessages,
      { role: "user", content },
    ];
    setTutorMessages(nextMessages);
    if (!customPrompt) {
      setTutorInput("");
    }
    setTutorLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: activeWq.topicId,
          regionCode,
          locale,
          bilingual,
          studentId: activeStudentId,
          question: twinInstance,
          studentWrongAnswer: activeWq.wrongUserAnswer,
          detectedMisconceptionTag: activeWq.misconceptionTag ?? undefined,
          messages: nextMessages,
        }),
      });
      const json = await res.json();
      if (json.ok && json.reply) {
        setTutorMessages([
          ...nextMessages,
          { role: "assistant", content: String(json.reply) },
        ]);
      }
    } finally {
      setTutorLoading(false);
    }
  };

  const localizedTwinSvg = twinInstance
    ? localizeSvgDiagram(twinInstance.svgDiagram, locale)
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-violet-400" />
            <span>
              {WRONG_BOOK_COPY.headerTitle(studentHeaderLabel, locale)}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {pick(WRONG_BOOK_COPY.subtitle)}
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
              tab === "pending"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {WRONG_BOOK_COPY.tabPending(pendingWqs.length, locale)}
          </button>
          <button
            type="button"
            onClick={() => setTab("cleared")}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
              tab === "cleared"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {WRONG_BOOK_COPY.tabCleared(clearedWqs.length, locale)}
          </button>
        </div>
      </div>

      {/* Main Split: Wrong Question Ledger + Interactive Twin Variant Arena */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          {shownList.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
              {tab === "pending"
                ? pick(WRONG_BOOK_COPY.emptyPending)
                : pick(WRONG_BOOK_COPY.emptyCleared)}
            </div>
          ) : (
            shownList.map((wq) => {
              const topic = data.topics.find((t) => t.id === wq.topicId);
              const aln = getAlignment(wq.topicId);
              const retPct = Math.round(wq.retrievability * 100);
              const isSelected = activeWq?.id === wq.id;
              const localizedSnapshotSvg = localizeSvgDiagram(
                wq.questionSnapshotJson.svgDiagram,
                locale
              );

              return (
                <div
                  key={wq.id}
                  className={`rounded-2xl border p-5 space-y-3 transition ${
                    isSelected
                      ? "border-violet-500 bg-slate-900"
                      : "border-slate-800 bg-slate-900/65 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {topic && (
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-300">
                            {getSubjectShortBadge(topic.subjectId, locale)}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-indigo-300">
                          {aln?.standardCode} · {aln?.localStageLabel}
                        </span>
                      </div>
                      <h3 className="mt-0.5 text-sm font-bold text-white">
                        {topic ? localize(topic.title) : wq.topicId}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-bold text-violet-300 border border-violet-500/30">
                        {WRONG_BOOK_COPY.streakBadge(wq.twinClearStreak, locale)}
                      </span>
                    </div>
                  </div>

                  {/* Original Wrong Snapshot */}
                  <div className="rounded-xl bg-slate-950/80 p-3.5 text-xs space-y-2 border border-slate-800/80">
                    <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                      <strong>{pick(WRONG_BOOK_COPY.snapshotLabel)}</strong>
                      <MathText
                        text={localizePrompt(
                          wq.questionSnapshotJson,
                          locale,
                          bilingual
                        )}
                      />
                    </div>
                    {localizedSnapshotSvg && (
                      <div
                        className="flex justify-center rounded-lg border border-slate-800/70 bg-slate-950 p-2"
                        dangerouslySetInnerHTML={{
                          __html: localizedSnapshotSvg,
                        }}
                      />
                    )}
                    <div className="flex flex-wrap gap-4 text-[11px]">
                      <span className="text-rose-400">
                        {pick(WRONG_BOOK_COPY.wrongAnswerLabel)}
                        <code>
                          {localizeWrongUserAnswer(wq.wrongUserAnswer, locale)}
                        </code>
                      </span>
                      <span className="text-emerald-400">
                        {pick(WRONG_BOOK_COPY.correctAnswerLabel)}
                        <code>{wq.questionSnapshotJson.answer}</code>
                      </span>
                    </div>
                  </div>

                  {(wq.misconceptionLabel || wq.misconceptionTag) && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>
                        <strong>{pick(WRONG_BOOK_COPY.misconceptionPrefix)}</strong>
                        {localizeMisconceptionLabel(wq, topic, locale)}
                      </span>
                    </div>
                  )}

                  {/* FSRS DSR Telemetry + Action Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex flex-wrap gap-3 text-slate-400 font-mono text-[11px]">
                      <span>
                        {WRONG_BOOK_COPY.difficultyMetric(
                          wq.fsrsDifficulty,
                          locale
                        )}
                      </span>
                      <span>
                        {WRONG_BOOK_COPY.stabilityMetric(
                          wq.fsrsStability,
                          locale
                        )}
                      </span>
                      <span>
                        {pick(WRONG_BOOK_COPY.retrievabilityPrefix)}
                        <strong
                          className={
                            retPct < 85 ? "text-rose-400" : "text-emerald-400"
                          }
                        >
                          {retPct}%
                        </strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => void spawnTwin(wq)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-violet-500 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>{pick(WRONG_BOOK_COPY.spawnTwinBtn)}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 5 Cols: Twin-Variant Clearance Arena */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <div>
                <h2 className="text-sm font-bold text-white">
                  {pick(WRONG_BOOK_COPY.arenaTitle)}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {pick(WRONG_BOOK_COPY.arenaSubtitle)}
                </p>
              </div>
            </div>

            {!activeWq || !twinInstance ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <p>{pick(WRONG_BOOK_COPY.arenaEmptyLead)}</p>
                {pendingWqs.some((w) => w.twinClearStreak === 2) && (
                  <p className="text-indigo-300">
                    {WRONG_BOOK_COPY.arenaEmptyTip(studentDisplayName, locale)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-violet-300">
                    {WRONG_BOOK_COPY.freshSeedBadge(
                      twinInstance.seed.slice(-8),
                      locale
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => void spawnTwin(activeWq)}
                    className="text-indigo-300 hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />{" "}
                    {pick(WRONG_BOOK_COPY.rerollTwinBtn)}
                  </button>
                </div>

                <div className="text-sm font-semibold text-white leading-relaxed whitespace-pre-line">
                  <MathText
                    text={localizePrompt(twinInstance, locale, bilingual)}
                  />
                </div>

                {twinInstance.latexFormula && (
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/25 px-3 py-2 text-center text-xs text-indigo-200">
                    <MathText text={`$$${twinInstance.latexFormula}$$`} />
                  </div>
                )}

                {localizedTwinSvg && (
                  <div
                    className="flex justify-center rounded-xl border border-slate-800 bg-slate-950 p-3"
                    dangerouslySetInnerHTML={{
                      __html: localizedTwinSvg,
                    }}
                  />
                )}

                {twinInstance.interactiveWidget && !twinResult && (
                  <InteractiveWidget
                    config={twinInstance.interactiveWidget}
                    onSelectValue={(val) => setTwinAnswer(val)}
                  />
                )}

                {/* 4-Button FSRS Recall Rating Selector (Again / Hard / Good / Easy) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">
                    {pick(WRONG_BOOK_COPY.ratingLabel)}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    {([1, 2, 3, 4] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelfRating(r)}
                        className={`rounded-lg border py-1.5 px-2 font-medium transition ${
                          selfRating === r
                            ? r === 1
                              ? "border-rose-500 bg-rose-600/25 text-white"
                              : "border-violet-500 bg-violet-600/25 text-white"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {pick(WRONG_BOOK_COPY.ratings[r])}
                      </button>
                    ))}
                  </div>
                </div>

                {!twinResult ? (
                  twinInstance.itemType === "choice" && twinInstance.choices ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2">
                        {twinInstance.choices.map((ch) => (
                          <button
                            key={ch.key}
                            type="button"
                            onClick={() =>
                              void submitTwinAttempt(
                                selfRating === 1 ? "__AGAIN__" : ch.key
                              )
                            }
                            disabled={busy}
                            className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-left text-xs text-white hover:border-violet-400"
                          >
                            <strong className="text-violet-300 mr-2">
                              {ch.key}.
                            </strong>
                            <MathText
                              text={localizeChoice(ch, locale, bilingual)}
                            />
                          </button>
                        ))}
                      </div>
                      {selfRating === 1 && (
                        <button
                          type="button"
                          onClick={() => void submitTwinAttempt("__AGAIN__")}
                          disabled={busy}
                          className="w-full rounded-xl border border-rose-500/40 bg-rose-950/30 py-2 text-xs font-bold text-rose-200 hover:bg-rose-950/50"
                        >
                          {pick(WRONG_BOOK_COPY.requeueAgainBtn)}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={twinAnswer}
                        onChange={(e) => setTwinAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void submitTwinAttempt();
                        }}
                        placeholder={pick(WRONG_BOOK_COPY.answerPlaceholder)}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => void submitTwinAttempt()}
                        disabled={
                          busy || (!twinAnswer.trim() && selfRating !== 1)
                        }
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                      >
                        {selfRating === 1 && !twinAnswer.trim()
                          ? pick(WRONG_BOOK_COPY.requeueAgainBtn)
                          : pick(WRONG_BOOK_COPY.submitTwinBtn)}
                      </button>
                    </div>
                  )
                ) : (
                  <div
                    className={`rounded-xl border p-3.5 text-xs space-y-2 ${
                      twinResult.isCorrect
                        ? "border-emerald-500/40 bg-emerald-950/25"
                        : "border-rose-500/40 bg-rose-950/25"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {twinResult.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          <span className="text-emerald-300">
                            {twinResult.status === "cleared"
                              ? pick(WRONG_BOOK_COPY.resultClearedMsg)
                              : WRONG_BOOK_COPY.resultStreakUpMsg(
                                  twinResult.streak,
                                  locale
                                )}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                          <span className="text-rose-300">
                            {WRONG_BOOK_COPY.resultMissMsg(
                              twinInstance.answer,
                              locale
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                      <MathText
                        text={localizeExplanation(
                          twinInstance,
                          locale,
                          bilingual
                        )}
                      />
                    </div>
                    <p className="font-mono text-[11px] text-indigo-300">
                      {WRONG_BOOK_COPY.resultFsrsSchedule(
                        twinResult.nextStability,
                        twinResult.scheduledDays,
                        locale
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => void spawnTwin(activeWq)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      {pick(WRONG_BOOK_COPY.practiceAnotherTwinBtn)}
                    </button>
                  </div>
                )}

                {/* Socratic Step-by-Step Coach */}
                <div className="rounded-xl border border-indigo-500/25 bg-slate-950/75 p-3.5 space-y-2.5 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-bold text-indigo-300">
                      <Bot className="h-4 w-4" />
                      <span>{pick(WRONG_BOOK_COPY.coachTitle)}</span>
                    </span>
                    {tutorMessages.length === 0 && (
                      <button
                        type="button"
                        disabled={tutorLoading}
                        onClick={() =>
                          void askSocraticCoach(
                            pick(WRONG_BOOK_COPY.coachDefaultPrompt)
                          )
                        }
                        className="rounded-lg bg-indigo-600/25 border border-indigo-500/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-200 hover:bg-indigo-600/40 disabled:opacity-50"
                      >
                        {pick(WRONG_BOOK_COPY.coachHintBtn)}
                      </button>
                    )}
                  </div>

                  {tutorMessages.length > 0 && (
                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {tutorMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg px-3 py-2 whitespace-pre-line leading-relaxed ${
                            msg.role === "assistant"
                              ? "bg-indigo-950/40 border border-indigo-500/30 text-slate-200"
                              : "bg-slate-900 text-slate-300"
                          }`}
                        >
                          <MathText text={msg.content} />
                        </div>
                      ))}
                      {tutorLoading && (
                        <div className="text-[11px] text-indigo-300 animate-pulse">
                          {pick(WRONG_BOOK_COPY.coachThinking)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tutorInput}
                      onChange={(e) => setTutorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void askSocraticCoach();
                      }}
                      placeholder={pick(WRONG_BOOK_COPY.coachPlaceholder)}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={tutorLoading || !tutorInput.trim()}
                      onClick={() => void askSocraticCoach()}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Send className="h-3 w-3" />
                      <span>{pick(WRONG_BOOK_COPY.coachSendBtn)}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
