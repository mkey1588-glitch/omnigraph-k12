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
import type { DifficultyTier } from "@/types/taxonomy";

export default function SchoolStudioPage() {
  const { data, loading, activeStudentId, activeStudent, refreshData } =
    usePlatform();

  const [tab, setTab] = useState<"edges" | "questions" | "irt">("edges");

  // --- Tab 1: Custom School Prerequisite Edge State ---
  const [edgeTopicId, setEdgeTopicId] = useState<string>(
    "mt_phy_work_kinetic_energy"
  );
  const [edgePrereqId, setEdgePrereqId] = useState<string>(
    "mt_math_quad_function_parabola"
  );
  const [edgeRelType, setEdgeRelType] = useState<string>("cross_subject");
  const [edgeReasonZh, setEdgeReasonZh] = useState<string>(
    "校本教研：动能随速度二次方增长曲线与二次函数开口特征对照"
  );
  const [edgeFeedback, setEdgeFeedback] = useState<{
    ok: boolean;
    msg: string;
    cyclePath?: string[];
  } | null>(null);
  const [edgeBusy, setEdgeBusy] = useState(false);

  // --- Tab 2: Custom KaTeX Question Authoring State ---
  const [qTopicId, setQTopicId] = useState<string>("mt_math_quad_complete_sq");
  const [qTier, setQTier] = useState<DifficultyTier>("standard");
  const [qPromptZh, setQPromptZh] = useState<string>(
    "【校本自建期中真题】用配方法解一元二次方程 $x^2 - 8x + 7 = 0$，其两个实数根为："
  );
  const [qLatex, setQLatex] = useState<string>(
    "x^2 - 8x + 7 = (x - 4)^2 - 9 = 0"
  );
  const [optA, setOptA] = useState<string>("$x_1 = 7,\\; x_2 = 1$");
  const [optB, setOptB] = useState<string>("$x_1 = -7,\\; x_2 = -1$");
  const [optC, setOptC] = useState<string>("仅 $x = 7$（漏负平方根）");
  const [optD, setOptD] = useState<string>("$x_1 = 4,\\; x_2 = 3$");
  const [qAnswer, setQAnswer] = useState<"A" | "B" | "C" | "D">("A");
  const [qExplain, setQExplain] = useState<string>(
    "配方得 $(x - 4)^2 = 9 \\Rightarrow x - 4 = \\pm 3$，解得 $x_1 = 7,\\; x_2 = 1$。"
  );
  const [qSavedMsg, setQSavedMsg] = useState<string | null>(null);
  const [qBusy, setQBusy] = useState(false);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在加载校本教研图谱工坊与 IRT 数据飞轮...
      </div>
    );
  }

  const submitCustomEdge = async (
    overrideTopic?: string,
    overridePrereq?: string
  ) => {
    setEdgeBusy(true);
    setEdgeFeedback(null);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_edge",
          topicId: overrideTopic ?? edgeTopicId,
          prerequisiteId: overridePrereq ?? edgePrereqId,
          relationType: edgeRelType,
          reasonZh: edgeReasonZh,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setEdgeFeedback({
          ok: true,
          msg: "✅ 已通过 DAG 无环拓扑校验并写入校本先修图谱（已在图谱星海实时生效）！",
        });
        await refreshData();
      } else {
        setEdgeFeedback({
          ok: false,
          msg: json.error || "添加失败",
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
      body: JSON.stringify({ action: "delete_edge", id }),
    });
    await refreshData();
  };

  const submitCustomQuestion = async () => {
    setQBusy(true);
    setQSavedMsg(null);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_custom_question",
          topicId: qTopicId,
          difficulty: qTier,
          promptZh: qPromptZh,
          latexFormula: qLatex,
          choicesJson: [optA, optB, optC, optD],
          answer: qAnswer,
          explanationZh: qExplain,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setQSavedMsg(
          `✅ 校本题目已入库（ID: ${json.id}），可在「9地组AB卷」中自动混编并生成防作弊平行卷！`
        );
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
      body: JSON.stringify({ action: "delete_custom_question", id }),
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
            <span>校本图谱教研工坊 & Elo-IRT 真实难度数据飞轮看板</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            支持学校教研组扩展跨科先修边（内置实时有向无环图环路拦截）、编写{" "}
            <code>KaTeX</code> 校本真题，并基于全站作答日志动态校准题目难度{" "}
            <code>β</code> 与区分度 <code>α</code>。
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs">
          {(
            [
              { id: "edges", label: "🔗 校本先修边 & 环路守护" },
              { id: "questions", label: "✍️ KaTeX 校本题库自建" },
              { id: "irt", label: "📈 Elo-IRT 难度校准与成长曲线" },
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork className="h-4 w-4 text-indigo-400" />
                <span>新增校本先修依赖边（自动执行 BFS 拓扑环路校验）</span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEdgeTopicId("mt_math_linear_eq_one");
                  setEdgePrereqId("mt_phy_ohm_law");
                  void submitCustomEdge("mt_math_linear_eq_one", "mt_phy_ohm_law");
                }}
                className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-950/60"
              >
                🧪 演示环路自动拦截
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  后继目标微技能（Topic）：
                </label>
                <select
                  value={edgeTopicId}
                  onChange={(e) => setEdgeTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectId.toUpperCase()} · G{t.baselineGrade}]{" "}
                      {t.title["zh-CN"]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  需要前置掌握的上游先修微技能（Prerequisite）：
                </label>
                <select
                  value={edgePrereqId}
                  onChange={(e) => setEdgePrereqId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectId.toUpperCase()} · G{t.baselineGrade}]{" "}
                      {t.title["zh-CN"]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">依赖强弱类型：</label>
                  <select
                    value={edgeRelType}
                    onChange={(e) => setEdgeRelType(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="hard">hard（强先修必测）</option>
                    <option value="cross_subject">cross_subject（跨学科数理桥）</option>
                    <option value="soft">soft（弱辅助迁移）</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">教研备注说明：</label>
                  <input
                    type="text"
                    value={edgeReasonZh}
                    onChange={(e) => setEdgeReasonZh(e.target.value)}
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
              <span>校验无环性并保存至校本知识图谱</span>
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
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  )}
                  <span>{edgeFeedback.msg}</span>
                </div>
                {edgeFeedback.cyclePath && (
                  <div className="font-mono text-[11px] bg-slate-950/80 rounded-lg p-2 text-rose-300">
                    拦截环路轨迹：{edgeFeedback.cyclePath.join(" ➔ ")}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
            <h2 className="text-sm font-bold text-white">
              当前生效的校本自定义先修边（{(data.customEdges ?? []).length} 条 · 已合并至全局{" "}
              {data.edges.length} 条图谱边）
            </h2>

            <div className="space-y-2.5">
              {(data.customEdges ?? []).map((ce) => {
                const tObj = data.topics.find((t) => t.id === ce.topicId);
                const pObj = data.topics.find((t) => t.id === ce.prerequisiteId);
                return (
                  <div
                    key={ce.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white">
                        《{pObj?.title["zh-CN"] ?? ce.prerequisiteId}》 ➔ 《
                        {tObj?.title["zh-CN"] ?? ce.topicId}》
                      </div>
                      <div className="text-slate-400">{ce.reasonZh}</div>
                      <div className="text-[11px] text-indigo-300 font-mono">
                        类型：{ce.relationType} · 创建人：{ce.createdBy}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteCustomEdge(ce.id)}
                      className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:border-rose-500/40 hover:text-rose-300"
                      title="移除该校本边"
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
              <BookPlus className="h-4 w-4 text-indigo-400" />
              <span>录入校本自建题（原生支持 $...$ 与 $$...$$ KaTeX 数学理化公式）</span>
            </h2>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">挂靠微技能节点：</label>
                <select
                  value={qTopicId}
                  onChange={(e) => setQTopicId(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.subjectId.toUpperCase()}] {t.title["zh-CN"]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">难度档位：</label>
                <select
                  value={qTier}
                  onChange={(e) => setQTier(e.target.value as DifficultyTier)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="basic">basic 基础</option>
                  <option value="standard">standard 巩固</option>
                  <option value="challenge">challenge 拔高</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">题干内容（支持 LaTeX）：</label>
              <textarea
                rows={3}
                value={qPromptZh}
                onChange={(e) => setQPromptZh(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                核心独立展示公式（可选纯 LaTeX，无需写 $$）：
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
                placeholder="选项 A"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                value={optB}
                onChange={(e) => setOptB(e.target.value)}
                placeholder="选项 B"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                value={optC}
                onChange={(e) => setOptC(e.target.value)}
                placeholder="选项 C"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
              <input
                value={optD}
                onChange={(e) => setOptD(e.target.value)}
                placeholder="选项 D"
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">正确选项：</label>
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
                <label className="block text-slate-400 mb-1">标准解析：</label>
                <input
                  value={qExplain}
                  onChange={(e) => setQExplain(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void submitCustomQuestion()}
              disabled={qBusy}
              className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500"
            >
              保存至校本精品题库（同步赋能 AB 卷智能组卷）
            </button>

            {qSavedMsg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-emerald-300 font-semibold">
                {qSavedMsg}
              </div>
            )}
          </div>

          {/* Right Col: Live KaTeX Preview + Existing School Question Bank */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-5 space-y-3">
              <div className="text-xs font-bold text-indigo-300">
                👁️ KaTeX 实时排版渲染预览（所见即所得）：
              </div>
              <div className="text-sm font-semibold text-white">
                <MathText text={qPromptZh} />
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
                  { k: "C", v: optC },
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
                解析预览：<MathText text={qExplain} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-3">
              <h3 className="text-xs font-bold text-white">
                已入库校本精品题（{(data.customQuestions ?? []).length} 题）：
              </h3>
              {(data.customQuestions ?? []).map((cq) => (
                <div
                  key={cq.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-white">
                      <MathText text={cq.promptZh} />
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono">
                      正解：{cq.answer} · 难度：{cq.difficulty} · 创建人：{cq.createdBy}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void deleteCustomQuestion(cq.id)}
                    className="rounded-lg border border-slate-800 p-1.5 text-slate-400 hover:text-rose-300"
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>
                  全站 150 套母题 Elo-IRT 2PL 实测难度校准散点（先验 β₀ vs 实测 β̂）
                </span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                对角线上方 = 实测比预期更难（高频卡点）
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
                先验难度 Prior β₀ (-2.5 → +2.5)
              </text>
              <text x="12" y="22" fontSize="10" fill="#94a3b8">
                实测 β̂
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
              🔥 教研预警：实测难度显著高于课标预期（Δβ &gt; +0.30）的高频暗礁母题 Top 6：
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2">微技能节点</th>
                    <th className="py-2">先验 β₀</th>
                    <th className="py-2">实测 β̂</th>
                    <th className="py-2">区分度 α</th>
                    <th className="py-2">样本正确率</th>
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
                          {tObj?.title["zh-CN"] ?? row.topicId}
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
              📈 {activeStudent?.avatarEmoji} {activeStudent?.displayName}{" "}
              纵向能力值 θ(t) 与掌握度轨迹
            </h2>
            <p className="text-xs text-slate-400">
              每次在「靶向诊断」或「错题孪生变式」作答后，系统以零 PII 匿名令牌实时记录并更新潜在能力估计{" "}
              <code>θ</code>。
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
                              {tObj?.title["zh-CN"] ?? l.topicId}
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
                              {l.isCorrect ? "✔ 命中" : "✘ 失误"} · θ=
                              {l.thetaEstimate}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              P(掌握)={Math.round(l.pMasteryAfter * 100)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-400">
                当前学生暂无历史轨迹，前往「靶向回溯诊断」作答 1 题即可实时点亮成长曲线！
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
