"use client";

import React, { Suspense, useEffect, useState } from "react";
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
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import { InteractiveWidget } from "@/components/InteractiveWidget";
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

  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    queryTopic || "mt_phy_ohm_law"
  );
  const [session, setSession] = useState<DiagnosticSessionState | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<PromptPayload | null>(null);
  const [summary, setSummary] = useState<SummaryPayload | null>(null);

  const [userAnswer, setUserAnswer] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [stepFeedback, setStepFeedback] = useState<{
    isCorrect: boolean;
    explanationZh: string;
    explanationEn: string;
    expectedAnswer: string;
    detectedMisconception?: string;
    prunedCount: number;
    pushedCount: number;
    pendingNextPrompt: PromptPayload | null;
    pendingSummary: SummaryPayload | null;
  } | null>(null);

  // Scaffolds reveal count
  const [revealedScaffolds, setRevealedScaffolds] = useState<number>(0);

  // Socratic AI Tutor chat state
  const [tutorMessages, setTutorMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [tutorInput, setTutorInput] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorMeta, setTutorMeta] = useState<{
    provider?: string;
    code?: string;
  }>({});

  useEffect(() => {
    if (queryTopic) {
      setSelectedTargetId(queryTopic);
    }
  }, [queryTopic]);

  const startDiagnosis = async (overrideTopicIds?: string[], mode: "target" | "grade_screen" = "target") => {
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
  };

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
          explanationZh: currentPrompt.instance.explanationZh,
          explanationEn: currentPrompt.instance.explanationEn,
          expectedAnswer: currentPrompt.instance.answer,
          detectedMisconception: json.outcome.detectedMisconception,
          prunedCount: json.outcome.prunedAncestors?.length ?? 0,
          pushedCount: json.outcome.pushedPrerequisites?.length ?? 0,
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
  };

  const askSocraticTutor = async (customPrompt?: string) => {
    if (!currentPrompt || tutorLoading) return;
    const content = (customPrompt ?? tutorInput).trim();
    if (!content) return;

    const nextMsgs = [
      ...tutorMessages,
      { role: "user" as const, content },
    ];
    setTutorMessages(nextMsgs);
    setTutorInput("");
    setTutorLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: currentPrompt.topicId,
          regionCode,
          bilingual,
          question: currentPrompt.instance,
          studentWrongAnswer: stepFeedback && !stepFeedback.isCorrect ? userAnswer : undefined,
          detectedMisconceptionTag: stepFeedback?.detectedMisconception,
          studentId: activeStudentId,
          messages: nextMsgs,
        }),
      });
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
    } finally {
      setTutorLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在初始化自适应前置回溯诊断引擎...
      </div>
    );
  }

  const currentTopicObj = currentPrompt
    ? data.topics.find((t) => t.id === currentPrompt.topicId)
    : undefined;
  const currentAln = currentPrompt
    ? getAlignment(currentPrompt.topicId)
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Crosshair className="h-6 w-6 text-indigo-400" />
            <span>自适应前置回溯诊断舱 & 苏格拉底 AI 伴学导师</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            答对连胜自动剪枝豁免全部先修节点；首题答错降维复测区分「粗心滑档 Shaky」与「概念薄弱 Weak」，并自动跨科回溯源头病灶。
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
            <span>重新选择诊断目标</span>
          </button>
        )}
      </div>

      {/* STATE 1: Session Launcher */}
      {!session && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
            <h2 className="text-base font-bold text-white">
              选择诊断起点（当前受测学生：{activeStudent?.avatarEmoji}{" "}
              {activeStudent?.displayName} · {regionCode} 课标）
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                任意微技能靶向溯源（包含上游全部先修链与跨科数学桥）：
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
                      [{t.subjectId.toUpperCase()} · {aln?.localStageLabel}]{" "}
                      {t.title["zh-CN"]} ({aln?.standardCode})
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
              <span>立即启动自适应回溯诊断</span>
            </button>

            <div className="border-t border-slate-800 pt-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-400">
                🔥 推荐高光演示剧本（一键体验跨科溯源与先修剪枝）：
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  onClick={() => void startDiagnosis(["mt_phy_ohm_law"], "target")}
                  className="text-left rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 hover:border-purple-400 transition"
                >
                  <div className="text-xs font-bold text-purple-300">
                    ⚡ 跨科回溯展示：物理欧姆定律并联电阻
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    若连续答错物理并联电阻，观察系统如何自动回溯排查「串并联规律」与跨科数学「分式方程 1/x=1/a+1/b」！
                  </p>
                </button>
                <button
                  onClick={() =>
                    void startDiagnosis(["mt_math_quad_function_parabola"], "target")
                  }
                  className="text-left rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 hover:border-indigo-400 transition"
                >
                  <div className="text-xs font-bold text-indigo-300">
                    📐 先修剪枝展示：二次函数抛物线顶点式
                  </div>
                  <p className="mt-1 text-[11px] text-slate-300">
                    连对 2 题直接豁免上游 12 个小初代数节点；答错则精准回溯配方法、完全平方与勾股根式！
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 text-xs text-slate-300">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>诊断状态机如何运作？</span>
            </h3>
            <div className="rounded-xl bg-slate-950/80 p-3 space-y-1">
              <div className="font-semibold text-emerald-300">
                1. 祖先闭包剪枝（Ancestor Mastery Closure）
              </div>
              <p className="text-slate-400">
                目标节点连续答对标准题 + 拔高变式题，系统依据 DAG 传递性自动将全部未测上游先修标记为「先修豁免」，省去低年级重复刷题。
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-3 space-y-1">
              <div className="font-semibold text-amber-300">
                2. 区分「粗心滑档 Shaky」与「真薄弱 Weak」
              </div>
              <p className="text-slate-400">
                首题答错不会盲目退回低年级，而是立刻出一道同节点基础辨析题：复测答对判为「粗心滑档」，复测仍错才触发先修回溯！
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/80 p-3 space-y-1">
              <div className="font-semibold text-purple-300">
                3. 强先修与跨科数学桥优先回溯 + 自动入错题本
              </div>
              <p className="text-slate-400">
                任何错题连同识别出的「认知迷思标签」实时写入 SQLite FSRS 错题账本，按遗忘曲线安排孪生变式清零。
              </p>
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
            <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/35 px-4 py-3 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-indigo-300">
                  🧭 诊断引擎实时透视（第 {session.history.length + 1} /{" "}
                  {session.maxQuestions} 步 · 难度 {currentPrompt.difficulty.toUpperCase()}）
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  {currentAln?.standardCode} · {currentAln?.localStageLabel}
                </span>
              </div>
              <p className="text-xs text-slate-200">{currentPrompt.whyAskedZh}</p>
              {bilingual && (
                <p className="text-[11px] text-indigo-200/80">
                  {currentPrompt.whyAskedEn}
                </p>
              )}
            </div>

            {/* Question Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold text-indigo-400">
                  当前考察微技能：{currentTopicObj ? localize(currentTopicObj.title) : ""}
                </span>
                <h2 className="mt-2 text-base font-semibold leading-relaxed text-white whitespace-pre-line">
                  <MathText text={currentPrompt.instance.promptZh} />
                </h2>
                {bilingual && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400 whitespace-pre-line">
                    <MathText text={currentPrompt.instance.promptEn} />
                  </p>
                )}
              </div>

              {/* Highlighted KaTeX Formula Card */}
              {currentPrompt.instance.latexFormula && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/25 px-4 py-3 text-center text-sm text-indigo-200">
                  <MathText text={`$$${currentPrompt.instance.latexFormula}$$`} />
                </div>
              )}

              {/* Clean-Room Inline SVG Diagram */}
              {currentPrompt.instance.svgDiagram && (
                <div
                  className="flex justify-center rounded-xl border border-slate-800 bg-slate-950/80 p-4"
                  dangerouslySetInnerHTML={{
                    __html: currentPrompt.instance.svgDiagram,
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
                            <MathText text={ch.text} />
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
                            onClick={() => setUserAnswer((prev) => `${prev}${sym}`)}
                            className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-slate-200 hover:border-indigo-400"
                          >
                            {sym}
                          </button>
                        ))}
                        {currentPrompt.instance.unit && (
                          <span className="self-center text-slate-400 ml-1">
                            单位：{currentPrompt.instance.unit}（只需填数值或代数式，支持分数如 3/4、多根逗号分隔）
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
                          placeholder="输入精确数值、分数（如 3/5）或代数式..."
                          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                        />
                        <button
                          onClick={() => void submitAnswer()}
                          disabled={submitting || !userAnswer.trim()}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                          提交判分
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
                            卡壳了？展开第 {revealedScaffolds + 1} 步分步脚手架引导（共{" "}
                            {currentPrompt.instance.scaffolds.length} 步）
                          </span>
                        </button>
                      )}
                      {currentPrompt.instance.scaffolds
                        .slice(0, revealedScaffolds)
                        .map((sc, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs space-y-1"
                          >
                            <div className="font-semibold text-amber-300">
                              脚手架第 {idx + 1} 步：{sc.promptZh}
                            </div>
                            <div className="text-slate-400">
                              线索提示：{sc.hintZh}（中间参考值：
                              <code className="text-emerald-300 font-mono">
                                {sc.expectedAnswer}
                              </code>
                              ）
                            </div>
                          </div>
                        ))}
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
                          <span className="text-emerald-300">回答正确！</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-rose-400" />
                          <span className="text-rose-300">
                            未命中（标准答案：{stepFeedback.expectedAnswer}）· 已自动收录至 FSRS 错题本
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {stepFeedback.prunedCount > 0 && (
                    <div className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-200">
                      ✨ <strong>祖先闭包剪枝生效：</strong>已自动确认并豁免上游{" "}
                      <strong>{stepFeedback.prunedCount}</strong> 个先修节点！
                    </div>
                  )}

                  {stepFeedback.pushedCount > 0 && (
                    <div className="rounded-lg bg-purple-500/15 px-3 py-2 text-xs text-purple-200">
                      🔍 <strong>触发 DAG 先修/跨科回溯：</strong>已将{" "}
                      <strong>{stepFeedback.pushedCount}</strong> 个直接先修地基压入诊断栈，下一步定位真正病灶！
                    </div>
                  )}

                  <p className="text-xs leading-relaxed text-slate-200">
                    <strong>解析：</strong>
                    {stepFeedback.explanationZh}
                  </p>
                  {bilingual && (
                    <p className="text-[11px] text-slate-400">
                      {stepFeedback.explanationEn}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={proceedToNextStep}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      <span>
                        {stepFeedback.pendingSummary
                          ? "生成完整根因诊断报告"
                          : "进入下一诊断节点"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    {!stepFeedback.isCorrect && (
                      <button
                        onClick={() =>
                          void askSocraticTutor(
                            `我刚才填了 "${userAnswer}" 答错了，请用苏格拉底提问法一步步带我理清思路！`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-800"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        <span>让右侧苏格拉底导师带我复盘</span>
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
                      苏格拉底图谱锚定 AI 导师
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      锚定 {tutorMeta.code || currentAln?.standardCode} · 绝不直接剧透答案
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
                      👋 你好！我已挂载当前节点的<strong>先修知识链</strong>、
                      <strong>{regionCode} 官方课标要求</strong>与
                      <strong>高频迷思库</strong>。
                    </p>
                    <p className="text-slate-400">
                      点击下方快捷提问，或输入你的中间算式，我会用启发式提问一步步引导你自己推导出答案：
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        "这道题第一步该从哪里切入？",
                        "本题最容易踩的陷阱是什么？",
                        "需要用到哪个上游先修公式？",
                      ].map((q) => (
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
                      className={`rounded-xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                        m.role === "user"
                          ? "ml-6 bg-indigo-600 text-white"
                          : "mr-4 border border-slate-800 bg-slate-950/90 text-slate-200"
                      }`}
                    >
                      {m.content}
                    </div>
                  ))
                )}
                {tutorLoading && (
                  <div className="text-xs text-indigo-300 animate-pulse">
                    苏格拉底导师正在结合图谱先修链推演引导步骤...
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={tutorInput}
                  onChange={(e) => setTutorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void askSocraticTutor();
                  }}
                  placeholder="输入你的中间步骤或疑问..."
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
                ✅ 诊断完成 · 已同步写入 SQLite 知识状态向量与 FSRS 错题账本
              </span>
              <h2 className="mt-2 text-xl font-bold text-white">
                DAG 靶向溯源诊断报告（共作答 {session.history.length} 题 · 正确率{" "}
                {summary.accuracyPercent}%）
              </h2>
            </div>

            <div className="flex gap-2">
              <Link
                href="/wrong-book"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                前往 FSRS 错题本练孪生变式 →
              </Link>
              <Link
                href="/explore"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-200 hover:border-indigo-400"
              >
                在星图中查看掌握度染色
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-rose-300">
                🎯 锁定的源头病灶根因（Weak Roots: {summary.weakRootIds.length}）
              </div>
              {summary.weakRootIds.length === 0 ? (
                <p className="text-xs text-slate-300">无深层先修断层！</p>
              ) : (
                summary.weakRootIds.map((id) => {
                  const t = data.topics.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className="rounded-lg bg-slate-950/80 px-3 py-2 text-xs text-white font-semibold"
                    >
                      [{t?.subjectId.toUpperCase()}] {t?.title["zh-CN"]}
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-amber-300">
                ⚠️ 粗心滑档待稳（Shaky: {summary.shakyIds.length}）
              </div>
              {summary.shakyIds.length === 0 ? (
                <p className="text-xs text-slate-300">本次未出现粗心滑档节点。</p>
              ) : (
                summary.shakyIds.map((id) => {
                  const t = data.topics.find((x) => x.id === id);
                  return (
                    <div
                      key={id}
                      className="rounded-lg bg-slate-950/80 px-3 py-2 text-xs text-amber-200"
                    >
                      {t?.title["zh-CN"]}
                    </div>
                  );
                })
              )}
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
              <div className="text-xs font-bold text-emerald-300">
                ✨ 实测掌握 ({summary.masteredIds.length}) + 自动剪枝豁免 (
                {summary.inferredMasteredIds.length})
              </div>
              <p className="text-xs text-slate-300">
                通过连对确认与传递闭包，共为你节省了{" "}
                <strong className="text-emerald-300">
                  {summary.inferredMasteredIds.length * 2}
                </strong>{" "}
                道低年级冗余基础测试题！
              </p>
            </div>
          </div>

          {summary.remedialPathIds.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
              <div className="text-xs font-bold text-indigo-300">
                🗺️ 个性化由浅入深拓扑修复路径（Bottom-Up Remedial Sequence）：
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
                        {idx + 1}. {t?.title["zh-CN"]}
                        {isRoot ? " (先补此根因)" : ""}
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
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">加载诊断舱中...</div>
      }
    >
      <DiagnoseStudioContent />
    </Suspense>
  );
}
