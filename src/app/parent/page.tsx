"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  MessageCircleHeart,
  Globe2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Award,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import type { RegionCode } from "@/types/taxonomy";

export default function ParentPortalPage() {
  const {
    data,
    loading,
    activeStudentId,
    setActiveStudentId,
    activeStudent,
    bilingual,
    getAlignment,
    getStudentTopicState,
    refreshData,
  } = usePlatform();

  const [targetRegion, setTargetRegion] = useState<RegionCode>("HK");
  const [pactLimitMin, setPactLimitMin] = useState<number>(45);
  const [pactWeeklyNodes, setPactWeeklyNodes] = useState<number>(4);
  const [pactReward, setPactReward] = useState<string>(
    "周末科学馆探索特展 + 户外运动时光"
  );
  const [pactBadgeUnlocked, setPactBadgeUnlocked] = useState<boolean>(false);
  const [pactSavedToast, setPactSavedToast] = useState<string | null>(null);

  const activePact = useMemo(
    () =>
      (data?.studyPacts ?? []).find((p) => p.studentId === activeStudentId),
    [data, activeStudentId]
  );

  useEffect(() => {
    if (activePact) {
      setPactLimitMin(activePact.dailyLimitMinutes);
      setPactWeeklyNodes(activePact.weeklyTargetNodes);
      setPactReward(activePact.rewardTitle);
      setPactBadgeUnlocked(activePact.badgeUnlocked);
    }
  }, [activePact]);

  const linkedChildren = useMemo(() => {
    if (!data) return [];
    const links = data.parentChildLinks.filter((l) => l.parentId === "par_lin");
    return links
      .map((l) => ({
        link: l,
        child: data.users.find((u) => u.id === l.studentId)!,
      }))
      .filter((x) => Boolean(x.child));
  }, [data]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在生成家长白话学情周报与 9 地升学衔接对标...
      </div>
    );
  }

  const childGrade = activeStudent?.currentGrade ?? 9;

  // States of current selected child
  const childStates = data.studentStates.filter(
    (s) => s.studentId === activeStudentId
  );
  const masteredList = childStates.filter(
    (s) => s.status === "mastered" || s.status === "inferred_mastered"
  );
  const gapStates = childStates.filter(
    (s) => s.status === "weak" || s.status === "shaky"
  );

  // Dinner-table 3-minute check prompts from weak/shaky topics
  const dinnerPrompts = gapStates
    .map((st) => ({
      state: st,
      topic: data.topics.find((t) => t.id === st.topicId)!,
    }))
    .filter((x) => Boolean(x.topic))
    .slice(0, 4);

  // 9-Region Cross-Border Readiness Comparison for targetRegion at <= childGrade
  const targetRegionMeta = data.regions.find((r) => r.code === targetRegion);
  const expectedTopicsInTarget = data.topics.filter((t) => {
    const aln = getAlignment(t.id, targetRegion);
    return (aln?.localGrade ?? t.baselineGrade) <= childGrade;
  });

  const readyInTarget = expectedTopicsInTarget.filter((t) => {
    const st = getStudentTopicState(t.id, activeStudentId)?.status;
    return st === "mastered" || st === "inferred_mastered";
  });

  const bridgeGapsInTarget = expectedTopicsInTarget.filter((t) => {
    const st = getStudentTopicState(t.id, activeStudentId)?.status;
    return st !== "mastered" && st !== "inferred_mastered";
  });

  const readinessPct =
    expectedTopicsInTarget.length > 0
      ? Math.round((readyInTarget.length / expectedTopicsInTarget.length) * 100)
      : 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Top Header + Multi-Child Switcher + Print Worksheet CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs text-indigo-300 font-semibold">
            <Users className="h-4 w-4" />
            <span>家长伴学与全球升学衔接空间（零术语焦虑 · 聚焦成长可操作建议）</span>
          </div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            👨‍👧‍👦 林远航家长，您好！正在查看{" "}
            <span className="text-indigo-300">{activeStudent?.displayName}</span>{" "}
            的图谱成长周报
          </h1>

          {/* Multi-Child Switcher Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {linkedChildren.map(({ link, child }) => {
              const selected = child.id === activeStudentId;
              return (
                <button
                  key={child.id}
                  onClick={() => {
                    setActiveStudentId(child.id);
                    if (child.targetTransitionRegion) {
                      setTargetRegion(child.targetTransitionRegion);
                    }
                  }}
                  className={`rounded-xl border px-3.5 py-2 text-left text-xs transition ${
                    selected
                      ? "border-indigo-400 bg-indigo-600/30 text-white shadow"
                      : "border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="font-bold">
                    {child.avatarEmoji} {child.displayName}
                  </div>
                  <div className="text-[11px] opacity-80">
                    {link.relationshipLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Link
          href={`/parent/print?studentId=${activeStudentId}`}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition"
        >
          <Printer className="h-4 w-4" />
          <span>导出 A4 双语防背题重练打印卷</span>
        </Link>
      </div>

      {/* Split Layout: Plain-Language Report & Dinner-Table Prompts + 9-Region Cross-Border Readiness */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 6 Cols: Plain-Language Weekly Insight + Dinner-Table 3-Minute Prompts */}
        <div className="lg:col-span-6 space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>本周白话版学情解读（为什么孩子新课某几题总卡壳？）</span>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-200 space-y-2.5">
              <p>
                1.{" "}
                <strong className="text-emerald-300">扎实闪光点：</strong>
                {activeStudent?.displayName} 目前已稳固掌握{" "}
                <strong>{masteredList.length}</strong> 个核心知识模块，基础运算、正负符号和直线图像理解非常扎实，请先给予充分肯定！
              </p>
              <p>
                2.{" "}
                <strong className="text-amber-300">真正的根源并非“粗心或笨”：</strong>
                知识图谱追踪发现，孩子近期在{" "}
                <strong>
                  {dinnerPrompts[0]?.topic.title["zh-CN"] ?? "进阶综合题"}
                </strong>{" "}
                遇到阻力，其实是因为早先的 1~2 个“上游工具小零件”（如公式中间交叉项或倒数通分）还没熟透。只要花 15 分钟把这个上游小零件补齐，后面几章物理和数学新课就会顺理成章打通！
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageCircleHeart className="h-4 w-4 text-rose-400" />
              <span>餐桌 / 放学路上 3 分钟轻松互动提问话术</span>
            </div>
            <p className="text-xs text-slate-400">
              无需家长自己会解难题！照着下面的一句话问孩子，让孩子当“小老师”讲给你听（费曼学习法）：
            </p>

            <div className="space-y-3">
              {dinnerPrompts.length === 0 ? (
                <p className="text-xs text-emerald-300">
                  当前所有已测知识点非常稳固，可以让孩子挑一道今天最得意的题讲给您听！
                </p>
              ) : (
                dinnerPrompts.map(({ topic, state }) => (
                  <div
                    key={topic.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-300">
                        对应微技能：{topic.title["zh-CN"]}
                      </span>
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-300">
                        {state.status === "weak" ? "优先补基" : "防粗心巩固"}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white leading-relaxed">
                      💬 {topic.homeCheckPrompt["zh-CN"]}
                    </p>
                    {bilingual && (
                      <p className="text-[11px] text-slate-400">
                        {topic.homeCheckPrompt.en}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right 6 Cols: 9-Region Cross-Border Transition Readiness Benchmark */}
        <div className="lg:col-span-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    9 地跨学制转学 / 升学课程衔接度雷达
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    对比当前掌握度与目标国家/地区同年级（G{childGrade}）官方课标要求
                  </p>
                </div>
              </div>

              <select
                value={targetRegion}
                onChange={(e) => setTargetRegion(e.target.value as RegionCode)}
                className="rounded-xl border border-emerald-500/40 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-emerald-300 focus:outline-none"
              >
                {data.regions.map((r) => (
                  <option key={r.code} value={r.code}>
                    目标对标：{r.flag} {r.nameZh} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Readiness Progress Meter */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-4 space-y-2.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-300">
                  衔接{" "}
                  <strong className="text-white">
                    {targetRegionMeta?.flag} {targetRegionMeta?.nameLocal}（
                    {targetRegionMeta?.gradeLabels[childGrade]}）
                  </strong>{" "}
                  核心先修准备度：
                </span>
                <span className="text-2xl font-bold text-emerald-400">
                  {readinessPct}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
                  style={{ width: `${readinessPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                目标考纲：{targetRegionMeta?.flagshipExams.join(" / ")} ·{" "}
                共覆盖 {expectedTopicsInTarget.length} 个必学模块（已达标{" "}
                {readyInTarget.length} 个，待衔接补齐 {bridgeGapsInTarget.length} 个）
              </p>
            </div>

            {/* Gap Modules for Target Region */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-slate-300">
                📌 衔接 {targetRegionMeta?.nameZh} 需重点关注的差异/薄弱章节：
              </div>
              {bridgeGapsInTarget.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>已 100% 覆盖目标地区该年级全部核心先修要求！</span>
                </div>
              ) : (
                bridgeGapsInTarget.map((t) => {
                  const destAln = getAlignment(t.id, targetRegion);
                  const st = getStudentTopicState(t.id, activeStudentId);
                  return (
                    <div
                      key={t.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span>{t.title["zh-CN"]}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          目标课标：<code>{destAln?.standardCode}</code> ·{" "}
                          {destAln?.localStageLabel}《{destAln?.localChapterTitle}》
                        </div>
                      </div>
                      <Link
                        href={`/diagnose?topic=${t.id}`}
                        className="shrink-0 rounded-lg border border-indigo-500/40 bg-indigo-950/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-900/40"
                      >
                        {st?.status === "weak" ? "补齐薄弱" : "衔接自测"}
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* P4: Anti-Addiction Screen-Time & Positive Incentive Pact */}
          <section className="rounded-2xl border border-amber-500/30 bg-slate-900/75 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>P4 防沉迷屏幕时长契约 & 正向勋章签发</span>
              </div>
              {pactBadgeUnlocked && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                  <Award className="h-3.5 w-3.5" /> 已点亮荣誉勋章
                </span>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>
                  今日已用伴学时长：<strong>{activePact?.todayUsedMinutes ?? 20}</strong> /{" "}
                  <strong>{pactLimitMin}</strong> 分钟
                </span>
                <span className="text-emerald-300 font-semibold">
                  本周攻克节点：{activePact?.completedNodesThisWeek ?? 2}/{pactWeeklyNodes}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((activePact?.todayUsedMinutes ?? 20) /
                          Math.max(15, pactLimitMin)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">
                  每日健康用眼上限（分钟）：
                </label>
                <input
                  type="number"
                  min={15}
                  max={120}
                  step={5}
                  value={pactLimitMin}
                  onChange={(e) => setPactLimitMin(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">
                  每周微技能清零目标数：
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={pactWeeklyNodes}
                  onChange={(e) => setPactWeeklyNodes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-slate-400 mb-1">
                家庭正向激励约定（达成目标解锁）：
              </label>
              <input
                type="text"
                value={pactReward}
                onChange={(e) => setPactReward(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-amber-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={pactBadgeUnlocked}
                  onChange={(e) => setPactBadgeUnlocked(e.target.checked)}
                  className="accent-amber-500"
                />
                <span>签发本周「跨科闯关小达人」亲子激励勋章</span>
              </label>

              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "update_study_pact",
                      studentId: activeStudentId,
                      parentId: "par_lin",
                      dailyLimitMinutes: pactLimitMin,
                      weeklyTargetNodes: pactWeeklyNodes,
                      rewardTitle: pactReward,
                      badgeUnlocked: pactBadgeUnlocked,
                    }),
                  });
                  setPactSavedToast("✅ 已同步保存亲子学习时长契约与勋章状态！");
                  await refreshData();
                }}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
              >
                保存亲子契约
              </button>
            </div>

            {pactSavedToast && (
              <div className="text-xs font-semibold text-emerald-300">
                {pactSavedToast}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
