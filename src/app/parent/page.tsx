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
import {
  localizePactReward,
  localizeRelationship,
  uiPick,
} from "@/lib/i18n";
import { PARENT_COPY } from "@/lib/i18n/copy-educator-parent";
import type { RegionCode } from "@/types/taxonomy";

export default function ParentPortalPage() {
  const {
    data,
    loading,
    locale,
    activeStudentId,
    setActiveStudentId,
    activeStudent,
    pick,
    localize,
    localizePlain,
    userName,
    regionName,
    regionProfile,
    gradeLabel,
    getAlignment,
    getStudentTopicState,
    refreshData,
  } = usePlatform();

  const [targetRegion, setTargetRegion] = useState<RegionCode>("HK");
  const [pactLimitMin, setPactLimitMin] = useState<number>(45);
  const [pactWeeklyNodes, setPactWeeklyNodes] = useState<number>(4);
  const [pactReward, setPactReward] = useState<string>("");
  const [pactBadgeUnlocked, setPactBadgeUnlocked] = useState<boolean>(false);
  const [pactSaved, setPactSaved] = useState<boolean>(false);

  const activePact = useMemo(
    () =>
      (data?.studyPacts ?? []).find((p) => p.studentId === activeStudentId),
    [data, activeStudentId]
  );

  useEffect(() => {
    setPactSaved(false);
    if (activePact) {
      setPactLimitMin(activePact.dailyLimitMinutes);
      setPactWeeklyNodes(activePact.weeklyTargetNodes);
      setPactReward(localizePactReward(activePact, locale));
      setPactBadgeUnlocked(activePact.badgeUnlocked);
    } else {
      setPactReward(uiPick(locale, PARENT_COPY.defaultPactReward));
    }
  }, [activePact, locale, activeStudentId]);

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
        {pick(PARENT_COPY.loading)}
      </div>
    );
  }

  const parentUser = data.users.find((u) => u.id === "par_lin");
  const parentDisplayName = parentUser ? userName(parentUser) : "";
  const childDisplayName = activeStudent ? userName(activeStudent) : "";
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
  const targetProf = targetRegionMeta
    ? regionProfile(targetRegionMeta)
    : undefined;

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
            <span>{pick(PARENT_COPY.eyebrow)}</span>
          </div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {PARENT_COPY.greetingBefore(parentDisplayName, locale)}
            <span className="text-indigo-300">{childDisplayName}</span>
            {pick(PARENT_COPY.greetingAfter)}
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
                    {child.avatarEmoji} {userName(child)}
                  </div>
                  <div className="text-[11px] opacity-80">
                    {localizeRelationship(
                      link.studentId,
                      link.relationshipLabel,
                      locale
                    )}
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
          <span>{pick(PARENT_COPY.exportPrintCta)}</span>
        </Link>
      </div>

      {/* Split Layout: Plain-Language Report & Dinner-Table Prompts + 9-Region Cross-Border Readiness */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 6 Cols: Plain-Language Weekly Insight + Dinner-Table 3-Minute Prompts */}
        <div className="lg:col-span-6 space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{pick(PARENT_COPY.weeklyInsightTitle)}</span>
            </div>

            <div className="rounded-xl bg-slate-950/80 p-4 text-xs leading-relaxed text-slate-200 space-y-2.5">
              <p>
                1.{" "}
                <strong className="text-emerald-300">
                  {pick(PARENT_COPY.insightPoint1Title)}
                </strong>
                {PARENT_COPY.insightPoint1Body(
                  childDisplayName,
                  masteredList.length,
                  locale
                )}
              </p>
              <p>
                2.{" "}
                <strong className="text-amber-300">
                  {pick(PARENT_COPY.insightPoint2Title)}
                </strong>
                {PARENT_COPY.insightPoint2Body(
                  dinnerPrompts[0]
                    ? localizePlain(dinnerPrompts[0].topic.title)
                    : pick(PARENT_COPY.advancedSynthesisFallback),
                  locale
                )}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <MessageCircleHeart className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{pick(PARENT_COPY.dinnerSectionTitle)}</span>
            </div>
            <p className="text-xs text-slate-400">
              {pick(PARENT_COPY.dinnerSectionSubtitle)}
            </p>

            <div className="space-y-3">
              {dinnerPrompts.length === 0 ? (
                <p className="text-xs text-emerald-300">
                  {pick(PARENT_COPY.dinnerAllSolid)}
                </p>
              ) : (
                dinnerPrompts.map(({ topic, state }) => (
                  <div
                    key={topic.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-bold text-indigo-300">
                        {pick(PARENT_COPY.microSkillPrefix)}
                        {localizePlain(topic.title)}
                      </span>
                      <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-300 shrink-0">
                        {state.status === "weak"
                          ? pick(PARENT_COPY.priorityRemediateBadge)
                          : pick(PARENT_COPY.antiSlipConsolidateBadge)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-white leading-relaxed">
                      💬 {localize(topic.homeCheckPrompt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right 6 Cols: 9-Region Cross-Border Transition Readiness Benchmark */}
        <div className="lg:col-span-6 space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    {pick(PARENT_COPY.readinessTitle)}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {PARENT_COPY.readinessSubtitle(childGrade, locale)}
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
                    {PARENT_COPY.targetRegionOption(
                      r.flag,
                      regionName(r.code),
                      r.code,
                      locale
                    )}
                  </option>
                ))}
              </select>
            </div>

            {/* Readiness Progress Meter */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/85 p-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-slate-300">
                  {pick(PARENT_COPY.readinessMeterBefore)}
                  <strong className="text-white">
                    {targetRegionMeta?.flag}{" "}
                    {targetProf?.labelWithSystem ?? regionName(targetRegion)} (
                    {gradeLabel(childGrade, targetRegion)})
                  </strong>
                  {pick(PARENT_COPY.readinessMeterAfter)}
                </span>
                <span className="text-2xl font-bold text-emerald-400 shrink-0">
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
                {PARENT_COPY.readinessSummary(
                  (targetProf?.flagshipExams ?? []).join(" / "),
                  expectedTopicsInTarget.length,
                  readyInTarget.length,
                  bridgeGapsInTarget.length,
                  locale
                )}
              </p>
            </div>

            {/* Gap Modules for Target Region */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-slate-300">
                {PARENT_COPY.gapModulesHeader(
                  regionName(targetRegion),
                  locale
                )}
              </div>
              {bridgeGapsInTarget.length === 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{pick(PARENT_COPY.gapAllCovered)}</span>
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
                          <span>{localizePlain(t.title)}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {pick(PARENT_COPY.targetAlignmentPrefix)}
                          <code>{destAln?.standardCode}</code> ·{" "}
                          {destAln?.localStageLabel} ·{" "}
                          {destAln?.localChapterTitle}
                        </div>
                      </div>
                      <Link
                        href={`/diagnose?topic=${t.id}`}
                        className="shrink-0 rounded-lg border border-indigo-500/40 bg-indigo-950/30 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-900/40"
                      >
                        {st?.status === "weak"
                          ? pick(PARENT_COPY.remediateWeakBtn)
                          : pick(PARENT_COPY.bridgeSelfCheckBtn)}
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Anti-Addiction Screen-Time & Positive Incentive Pact */}
          <section className="rounded-2xl border border-amber-500/30 bg-slate-900/75 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{pick(PARENT_COPY.pactTitle)}</span>
              </div>
              {pactBadgeUnlocked && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                  <Award className="h-3.5 w-3.5" />{" "}
                  {pick(PARENT_COPY.badgeUnlockedPill)}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-2">
              <div className="flex flex-wrap justify-between gap-2 text-slate-300">
                <span>
                  {PARENT_COPY.todayUsedLine(
                    activePact?.todayUsedMinutes ?? 20,
                    pactLimitMin,
                    locale
                  )}
                </span>
                <span className="text-emerald-300 font-semibold">
                  {PARENT_COPY.weeklyNodesLine(
                    activePact?.completedNodesThisWeek ?? 2,
                    pactWeeklyNodes,
                    locale
                  )}
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
                  {pick(PARENT_COPY.dailyLimitLabel)}
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
                  {pick(PARENT_COPY.weeklyTargetLabel)}
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
                {pick(PARENT_COPY.rewardLabel)}
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
                <span>{pick(PARENT_COPY.unlockBadgeCheckbox)}</span>
              </label>

              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "update_study_pact",
                      locale,
                      studentId: activeStudentId,
                      parentId: "par_lin",
                      dailyLimitMinutes: pactLimitMin,
                      weeklyTargetNodes: pactWeeklyNodes,
                      rewardTitle: pactReward,
                      badgeUnlocked: pactBadgeUnlocked,
                    }),
                  });
                  setPactSaved(true);
                  await refreshData();
                }}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500"
              >
                {pick(PARENT_COPY.savePactBtn)}
              </button>
            </div>

            {pactSaved && (
              <div className="text-xs font-semibold text-emerald-300">
                {pick(PARENT_COPY.pactSavedToast)}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
