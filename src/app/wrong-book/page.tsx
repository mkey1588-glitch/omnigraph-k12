"use client";

import React, { useState } from "react";
import {
  BookOpenCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import {
  usePlatform,
  type EnrichedWrongQuestion,
} from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import { InteractiveWidget } from "@/components/InteractiveWidget";
import type { GeneratedQuestionInstance } from "@/types/taxonomy";

export default function WrongBookPage() {
  const {
    data,
    loading,
    regionCode,
    bilingual,
    activeStudentId,
    activeStudent,
    localize,
    getAlignment,
    refreshData,
  } = usePlatform();

  const [tab, setTab] = useState<"pending" | "cleared">("pending");
  const [activeWq, setActiveWq] = useState<EnrichedWrongQuestion | null>(null);
  const [twinInstance, setTwinInstance] =
    useState<GeneratedQuestionInstance | null>(null);
  const [twinAnswer, setTwinAnswer] = useState<string>("");
  const [selfRating, setSelfRating] = useState<2 | 3 | 4>(3);
  const [twinResult, setTwinResult] = useState<{
    isCorrect: boolean;
    status: string;
    streak: number;
    nextStability: number;
    scheduledDays: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在加载 FSRS 间隔重复错题账本...
      </div>
    );
  }

  const allStudentWqs = data.wrongQuestions.filter(
    (w) => w.studentId === activeStudentId
  );
  const pendingWqs = allStudentWqs.filter((w) => w.status !== "cleared");
  const clearedWqs = allStudentWqs.filter((w) => w.status === "cleared");
  const shownList = tab === "pending" ? pendingWqs : clearedWqs;

  const spawnTwin = async (wq: EnrichedWrongQuestion) => {
    setBusy(true);
    setActiveWq(wq);
    setTwinResult(null);
    setTwinAnswer("");
    try {
      const res = await fetch("/api/wrong-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "spawn_twin",
          wrongQuestionId: wq.id,
          regionCode,
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
    const ans = (overrideAns ?? twinAnswer).trim();
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-violet-400" />
            <span>
              FSRS 智能错题本 & 防刷穿孪生变式清零台（{activeStudent?.avatarEmoji}{" "}
              {activeStudent?.displayName}）
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            基于 FSRS 动态遗忘曲线（难度 D · 稳定性 S · 记忆保留率 R）调度复习；每次重练实时生成全新参数孪生题，连续 3 次掌握自动归档清零。
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
          <button
            onClick={() => setTab("pending")}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
              tab === "pending"
                ? "bg-violet-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            待孪生清零 ({pendingWqs.length})
          </button>
          <button
            onClick={() => setTab("cleared")}
            className={`rounded-lg px-3.5 py-1.5 font-semibold transition ${
              tab === "cleared"
                ? "bg-emerald-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            已彻底清零 ({clearedWqs.length})
          </button>
        </div>
      </div>

      {/* Main Split: Wrong Question Ledger + Interactive Twin Variant Modal/Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          {shownList.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
              {tab === "pending"
                ? "🎉 当前学生所有错题均已清零！可前往「靶向回溯诊断」探索新章节。"
                : "暂无已清零错题记录——在右侧连续答对第 3 次孪生变式即可清零晋级！"}
            </div>
          ) : (
            shownList.map((wq) => {
              const topic = data.topics.find((t) => t.id === wq.topicId);
              const aln = getAlignment(wq.topicId);
              const retPct = Math.round(wq.retrievability * 100);
              const isSelected = activeWq?.id === wq.id;

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
                      <span className="text-[11px] font-mono text-indigo-300">
                        {aln?.standardCode} · {aln?.localStageLabel}
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        {topic ? localize(topic.title) : wq.topicId}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-bold text-violet-300 border border-violet-500/30">
                        清零进度 {wq.twinClearStreak}/3
                      </span>
                    </div>
                  </div>

                  {/* Original Wrong Snapshot */}
                  <div className="rounded-xl bg-slate-950/80 p-3.5 text-xs space-y-1.5 border border-slate-800/80">
                    <div className="text-slate-300">
                      <strong>原错题快照：</strong>
                      {wq.questionSnapshotJson.promptZh}
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px]">
                      <span className="text-rose-400">
                        当时误答：<code>{wq.wrongUserAnswer}</code>
                      </span>
                      <span className="text-emerald-400">
                        原题正解：<code>{wq.questionSnapshotJson.answer}</code>
                      </span>
                    </div>
                  </div>

                  {wq.misconceptionLabel && (
                    <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <span>
                        <strong>认知迷思归因：</strong>
                        {wq.misconceptionLabel}
                      </span>
                    </div>
                  )}

                  {/* FSRS DSR Telemetry + Action Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                    <div className="flex flex-wrap gap-3 text-slate-400 font-mono text-[11px]">
                      <span>难度 D={wq.fsrsDifficulty}</span>
                      <span>稳定性 S={wq.fsrsStability}d</span>
                      <span>
                        保留率 R=
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
                      onClick={() => void spawnTwin(wq)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-violet-500 transition"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>生成防背题孪生变式重练</span>
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
                  孪生变式防刷穿演练舱（Twin-Variant Arena）
                </h2>
                <p className="text-[11px] text-slate-400">
                  同母题结构 · 全新随机参数 · 检验真实迁移能力
                </p>
              </div>
            </div>

            {!activeWq || !twinInstance ? (
              <div className="py-10 text-center text-xs text-slate-400 space-y-2">
                <p>👈 点击左侧任意错题的「生成防背题孪生变式重练」按钮</p>
                <p className="text-indigo-300">
                  💡 提示：林小宇的第 4 道错题当前连击为 <strong>2/3</strong>，再答对 1 次即可见证「彻底清零晋级」！
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded bg-violet-500/20 px-2 py-0.5 font-mono text-violet-300">
                    全新种子 {twinInstance.seed.slice(-8)}
                  </span>
                  <button
                    onClick={() => void spawnTwin(activeWq)}
                    className="text-indigo-300 hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> 换一组新数字
                  </button>
                </div>

                <div className="text-sm font-semibold text-white leading-relaxed whitespace-pre-line">
                  <MathText text={twinInstance.promptZh} />
                </div>
                {bilingual && (
                  <div className="text-xs text-slate-400 whitespace-pre-line">
                    <MathText text={twinInstance.promptEn} />
                  </div>
                )}

                {twinInstance.latexFormula && (
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/25 px-3 py-2 text-center text-xs text-indigo-200">
                    <MathText text={`$$${twinInstance.latexFormula}$$`} />
                  </div>
                )}

                {twinInstance.svgDiagram && (
                  <div
                    className="flex justify-center rounded-xl border border-slate-800 bg-slate-950 p-3"
                    dangerouslySetInnerHTML={{
                      __html: twinInstance.svgDiagram,
                    }}
                  />
                )}

                {twinInstance.interactiveWidget && !twinResult && (
                  <InteractiveWidget
                    config={twinInstance.interactiveWidget}
                    onSelectValue={(val) => setTwinAnswer(val)}
                  />
                )}

                {/* Self-perceived recall rating selector for FSRS */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400">
                    FSRS 提取顺畅度自评（影响下次间隔天数 S）：
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(
                      [
                        { r: 2, label: "😓 吃力 (Hard)" },
                        { r: 3, label: "🙂 顺畅 (Good)" },
                        { r: 4, label: "⚡ 秒杀 (Easy)" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.r}
                        type="button"
                        onClick={() => setSelfRating(opt.r)}
                        className={`rounded-lg border py-1.5 font-medium ${
                          selfRating === opt.r
                            ? "border-violet-500 bg-violet-600/25 text-white"
                            : "border-slate-800 bg-slate-950 text-slate-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!twinResult ? (
                  twinInstance.itemType === "choice" && twinInstance.choices ? (
                    <div className="grid grid-cols-1 gap-2">
                      {twinInstance.choices.map((c) => (
                        <button
                          key={c.key}
                          onClick={() => void submitTwinAttempt(c.key)}
                          disabled={busy}
                          className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-left text-xs text-white hover:border-violet-400"
                        >
                          <strong className="text-violet-300 mr-2">
                            {c.key}.
                          </strong>
                          <MathText text={c.text} />
                        </button>
                      ))}
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
                        placeholder="输入新变式题答案（多根逗号隔开）..."
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                      />
                      <button
                        onClick={() => void submitTwinAttempt()}
                        disabled={busy || !twinAnswer.trim()}
                        className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                      >
                        验证清零
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
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-emerald-300">
                            {twinResult.status === "cleared"
                              ? "🏆 达成 3 连击！该错题已彻底清零并同步升级图谱掌握度！"
                              : `回答正确！清零连击升至 ${twinResult.streak}/3`}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-rose-400" />
                          <span className="text-rose-300">
                            仍未命中（正解：{twinInstance.answer}），连击归零，6 小时后再次调度！
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-300">{twinInstance.explanationZh}</p>
                    <p className="font-mono text-[11px] text-indigo-300">
                      FSRS 新稳定性 S = {twinResult.nextStability} 天 · 下次复习间隔{" "}
                      {twinResult.scheduledDays} 天
                    </p>
                    <button
                      onClick={() => void spawnTwin(activeWq)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                    >
                      再练一道新参数孪生题 →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
