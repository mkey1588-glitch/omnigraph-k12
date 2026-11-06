"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import type { SubjectId } from "@/types/taxonomy";
import type { SmartExamBundle } from "@/lib/engines/smart-capture-and-paper";

export default function PaperBuilderPage() {
  const { data, loading, regionCode, setRegionCode, getAlignment } = usePlatform();

  const [subjectId, setSubjectId] = useState<SubjectId>("math");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState<number>(8);
  const [basicPct, setBasicPct] = useState<number>(30);
  const [standardPct, setStandardPct] = useState<number>(50);
  const [challengePct, setChallengePct] = useState<number>(20);
  const [includeCustom, setIncludeCustom] = useState<boolean>(true);
  const [paperTitle, setPaperTitle] = useState<string>("");

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
      setSelectedTopicIds(subjectTopics.slice(0, Math.min(5, subjectTopics.length)).map((t) => t.id));
    }
  }, [subjectTopics]);

  const generatePapers = async (customSeed?: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperTitle,
          regionCode,
          subjectId,
          topicIds: selectedTopicIds,
          totalItems,
          includeCustom,
          paperSeed: customSeed || `exam_${regionCode}_${subjectId}_${Date.now()}`,
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
  };

  useEffect(() => {
    if (data && selectedTopicIds.length > 0 && !bundle) {
      void generatePapers("initial_demo_paper_2026");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedTopicIds.length]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在加载 9 地课标智能组卷与双向细目表引擎...
      </div>
    );
  }

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header (Hidden on A4 Print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-indigo-400" />
            <span>教师 9 地教材一键组 A/B 平行卷 & 双向细目表中心</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            勾选当地教材章节与难度配比 → 毫秒级生成防作弊同构{" "}
            <strong>A 卷 / B 卷 + 课标双向细目表 + 评分解析卷</strong>（内置 IRT 真实校准难度{" "}
            <code>β</code>，支持 A4 打印）。
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
        >
          <Printer className="h-4 w-4" />
          <span>打印当前视图（A4 试卷 / 细目表）</span>
        </button>
      </div>

      {/* Config Panel (Hidden on Print) */}
      <div className="no-print grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">1. 试卷课标与难度结构设定</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                适用地区课标：
              </label>
              <select
                value={regionCode}
                onChange={(e) => setRegionCode(e.target.value as typeof regionCode)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {data.regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.flag} {r.code} · {r.nameZh}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                测评学科：
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              >
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name["zh-CN"]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                试卷总题量（满分自动配平 100 分）：
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
                自定义卷头名称（可选）：
              </label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                placeholder={`${regionCode} 阶段性诊断联考卷`}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Difficulty Ratio Sliders */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2 text-xs">
            <div className="flex justify-between font-semibold text-slate-300">
              <span>三档难度配比</span>
              <span className="font-mono text-indigo-300">
                基础 {basicPct}% / 巩固 {standardPct}% / 拔高 {challengePct}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-emerald-300">基础 Basic</span>
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
                <span className="text-[11px] text-indigo-300">巩固 Standard</span>
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
                <span className="text-[11px] text-amber-300">拔高 Challenge</span>
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
            <span>优先混编「校本教研工坊（/studio）」自建题库题目</span>
          </label>

          <button
            type="button"
            onClick={() => void generatePapers()}
            disabled={generating || selectedTopicIds.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {generating ? "正在并行合成 A/B 卷与细目表..." : "一键重新随机生成 A/B 防作弊平行卷"}
            </span>
          </button>
        </div>

        {/* Chapter / Topic Multi-Select */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-indigo-400" />
              <span>
                2. 勾选纳入命题范围的 {regionCode} 教材章节微技能（已选{" "}
                {selectedTopicIds.length}/{subjectTopics.length}）
              </span>
            </h2>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTopicIds(subjectTopics.map((t) => t.id))}
                className="text-indigo-300 hover:underline"
              >
                全选本学科
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopicIds(subjectTopics.slice(0, 3).map((t) => t.id))}
                className="text-slate-400 hover:underline"
              >
                精简前3章
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
                      {t.title["zh-CN"]}
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
                  { id: "blueprint", label: "📊 双向细目表 (Two-Way Blueprint)" },
                  { id: "paperA", label: "📝 A 卷（学生测评卷）" },
                  { id: "paperB", label: "🛡️ B 卷（同构防作弊平行卷）" },
                  { id: "answerKey", label: "✅ 教师评分标准答案与解析卷" },
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
              总分：{bundle.totalPoints} 分 · 题量：{bundle.totalItems} 题 · 全卷平均实测难度 β ={" "}
              <strong className="text-emerald-300">{bundle.averageBeta}</strong>
            </div>
          </div>

          {/* TAB 1: Two-Way Specification Matrix */}
          {activeTab === "blueprint" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 print:border-slate-300 print:bg-white print:text-slate-900 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 print:border-slate-300 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white print:text-slate-900">
                    {bundle.paperTitle} — 命题双向细目表（Two-Way Specification Matrix）
                  </h3>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    对标地区：{bundle.regionCode} · 满分：{bundle.totalPoints} 分 · 同构平行双卷防作弊校验通过
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 print:text-emerald-700">
                  <ShieldAlert className="h-3.5 w-3.5" /> A/B 卷参数零重样
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700">
                      <th className="py-2.5 px-2">题号</th>
                      <th className="py-2.5 px-2">微技能节点</th>
                      <th className="py-2.5 px-2">{bundle.regionCode} 官方课标码</th>
                      <th className="py-2.5 px-2">本地教材章节</th>
                      <th className="py-2.5 px-2">认知层级</th>
                      <th className="py-2.5 px-2">难度档位</th>
                      <th className="py-2.5 px-2">IRT 实测 β</th>
                      <th className="py-2.5 px-2">赋分</th>
                      <th className="py-2.5 px-2">A卷答案</th>
                      <th className="py-2.5 px-2">B卷答案</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 print:divide-slate-200">
                    {bundle.blueprint.map((row) => (
                      <tr key={row.itemNumber} className="text-slate-200 print:text-slate-900">
                        <td className="py-2.5 px-2 font-mono font-bold">#{row.itemNumber}</td>
                        <td className="py-2.5 px-2 font-semibold">
                          {row.topicTitleZh}
                          {row.sourceType === "school_custom" && (
                            <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                              校本自建
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-indigo-300 print:text-indigo-700">
                          {row.standardCode}
                        </td>
                        <td className="py-2.5 px-2 text-slate-400 print:text-slate-600">
                          {row.localChapterTitle}
                        </td>
                        <td className="py-2.5 px-2 uppercase font-mono text-[11px]">
                          {row.cognitiveType}
                        </td>
                        <td className="py-2.5 px-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                              row.difficulty === "basic"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : row.difficulty === "standard"
                                  ? "bg-indigo-500/15 text-indigo-300"
                                  : "bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {row.difficulty}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono">{row.calibratedBeta}</td>
                        <td className="py-2.5 px-2 font-bold">{row.points} 分</td>
                        <td className="py-2.5 px-2 font-mono text-emerald-300 print:text-emerald-700">
                          {row.answerA}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-violet-300 print:text-violet-700">
                          {row.answerB}
                        </td>
                      </tr>
                    ))}
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
                    ? "【A 卷 · 标准测评卷】"
                    : "【B 卷 · 同构防作弊平行卷】"}
                </div>
                <h2 className="text-xl font-bold text-white print:text-black">
                  {bundle.paperTitle}
                </h2>
                <p className="text-xs text-slate-400 print:text-slate-700">
                  姓名：____________ &nbsp;&nbsp; 班级：____________ &nbsp;&nbsp; 学号：____________ &nbsp;&nbsp; 满分：{bundle.totalPoints} 分
                </p>
              </div>

              <div className="space-y-6">
                {(activeTab === "paperA" ? bundle.paperA : bundle.paperB).map(
                  (item) => (
                    <div
                      key={item.itemNumber}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 print:border-slate-300 print:bg-white space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 print:text-slate-600">
                        <span className="font-bold text-indigo-300 print:text-black">
                          第 {item.itemNumber} 题（{item.points} 分）· [{item.standardCode}]{" "}
                          {item.topicTitleZh}
                        </span>
                        {item.sourceType === "school_custom" && (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-300 print:text-black">
                            校本教研题
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-medium text-white print:text-black whitespace-pre-line leading-relaxed">
                        <MathText text={item.instance.promptZh} />
                      </div>

                      {item.instance.latexFormula && (
                        <div className="py-1 text-sm text-indigo-200 print:text-black">
                          <MathText text={`$$${item.instance.latexFormula}$$`} />
                        </div>
                      )}

                      {item.instance.svgDiagram && (
                        <div
                          className="max-w-xs py-2"
                          dangerouslySetInnerHTML={{
                            __html: item.instance.svgDiagram,
                          }}
                        />
                      )}

                      {item.instance.choices ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 print:text-black pt-1">
                          {item.instance.choices.map((c) => (
                            <div key={c.key} className="py-1">
                              <strong className="mr-1.5">{c.key}.</strong>
                              <MathText text={c.text} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pt-2 text-xs text-slate-400 print:text-slate-700">
                          作答区：________________________
                          {item.instance.unit ? `（单位：${item.instance.unit}）` : ""}
                        </div>
                      )}
                    </div>
                  )
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
                  教师标准答案与解析评分细则（A / B 双卷对照）
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
                          第 {itemA.itemNumber} 题（{itemA.points} 分）· {itemA.topicTitleZh} [
                          {itemA.standardCode}]
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/15 p-3 space-y-1">
                          <div className="font-bold text-emerald-300 print:text-black">
                            【A 卷标准答案】：<code>{itemA.instance.answer}</code>
                          </div>
                          <div className="text-slate-300 print:text-slate-700 leading-relaxed">
                            <MathText text={itemA.instance.explanationZh} />
                          </div>
                        </div>
                        <div className="rounded-lg border border-violet-500/25 bg-violet-950/15 p-3 space-y-1">
                          <div className="font-bold text-violet-300 print:text-black">
                            【B 卷标准答案】：<code>{itemB.instance.answer}</code>
                          </div>
                          <div className="text-slate-300 print:text-slate-700 leading-relaxed">
                            <MathText text={itemB.instance.explanationZh} />
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
