"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  AlertOctagon,
  Send,
  CheckCircle2,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { localizeAssignmentTitle, localizeClassroomName } from "@/lib/i18n";
import {
  getMasteryStatusLabel,
  getSubjectShortBadge,
} from "@/lib/i18n/ui-common";
import { TEACHER_COPY } from "@/lib/i18n/copy-educator-parent";
import type { MasteryStatus, SubjectId } from "@/types/taxonomy";

const FOCUS_TOPIC_IDS = [
  "mt_math_alg_expressions",
  "mt_math_linear_eq_one",
  "mt_math_special_products_factor",
  "mt_math_rational_eq",
  "mt_math_radicals_pythagoras",
  "mt_math_quad_complete_sq",
  "mt_math_quad_function_parabola",
  "mt_phy_circuits_series_parallel",
  "mt_phy_ohm_law",
  "mt_phy_work_kinetic_energy",
];

function cellClass(status: MasteryStatus | undefined): string {
  switch (status) {
    case "mastered":
    case "inferred_mastered":
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    case "shaky":
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    case "weak":
      return "bg-rose-500/25 text-rose-200 border-rose-500/40 font-bold";
    default:
      return "bg-slate-900 text-slate-500 border-slate-800";
  }
}

export default function TeacherWorkbenchPage() {
  const {
    data,
    loading,
    locale,
    regionCode,
    pick,
    localizePlain,
    userName,
    userTrack,
    regionName,
    getAlignment,
    getStudentTopicState,
    setActiveStudentId,
    refreshData,
  } = usePlatform();

  const [publishing, setPublishing] = useState(false);
  const [publishedCount, setPublishedCount] = useState<number | null>(null);
  const [packTitlePrefix, setPackTitlePrefix] = useState<string>("");

  const classroom = data?.classrooms[0];

  const classStudents = useMemo(() => {
    if (!data || !classroom) return [];
    const memberIds = new Set(
      data.classMemberships
        .filter((m) => m.classId === classroom.id)
        .map((m) => m.studentId)
    );
    return data.users.filter((u) => memberIds.has(u.id));
  }, [data, classroom]);

  const heatmapTopics = useMemo(() => {
    if (!data) return [];
    return FOCUS_TOPIC_IDS.map((id) => data.topics.find((t) => t.id === id)!).filter(
      Boolean
    );
  }, [data]);

  // Automated Class-Wide Prerequisite & Cross-Subject Root-Cause Detector
  const rootCauseAlerts = useMemo(() => {
    if (!data || classStudents.length === 0) return [];
    const alerts: Array<{
      downstreamTopicTitle: string;
      downstreamSubject: SubjectId;
      weakCount: number;
      upstreamRootId: string;
      upstreamTitle: string;
      upstreamSubject: SubjectId;
      isCrossSubject: boolean;
      affectedStudents: string[];
    }> = [];

    for (const topic of heatmapTopics) {
      const weakStudents = classStudents.filter(
        (s) => getStudentTopicState(topic.id, s.id)?.status === "weak"
      );
      if (weakStudents.length >= 3) {
        const prereqEdges = data.edges.filter((e) => e.topicId === topic.id);
        for (const edge of prereqEdges) {
          const sharedWeak = weakStudents.filter(
            (s) =>
              getStudentTopicState(edge.prerequisiteId, s.id)?.status === "weak"
          );
          if (sharedWeak.length >= 3) {
            const upTopic = data.topics.find(
              (t) => t.id === edge.prerequisiteId
            )!;
            alerts.push({
              downstreamTopicTitle: localizePlain(topic.title),
              downstreamSubject: topic.subjectId,
              weakCount: weakStudents.length,
              upstreamRootId: upTopic.id,
              upstreamTitle: localizePlain(upTopic.title),
              upstreamSubject: upTopic.subjectId,
              isCrossSubject: edge.relationType === "cross_subject",
              affectedStudents: sharedWeak.map((s) => userName(s)),
            });
          }
        }
      }
    }
    return alerts;
  }, [data, classStudents, heatmapTopics, getStudentTopicState, localizePlain, userName]);

  // Group students automatically into 3 Differentiated Tiers
  const tierGroups = useMemo(() => {
    const foundational: typeof classStudents = [];
    const standard: typeof classStudents = [];
    const challenge: typeof classStudents = [];

    for (const s of classStudents) {
      const weakOnCore = FOCUS_TOPIC_IDS.filter(
        (tid) => getStudentTopicState(tid, s.id)?.status === "weak"
      ).length;
      if (weakOnCore >= 2) {
        foundational.push(s);
      } else {
        const shakyOnCore = FOCUS_TOPIC_IDS.filter(
          (tid) => getStudentTopicState(tid, s.id)?.status === "shaky"
        ).length;
        if (weakOnCore === 0 && shakyOnCore === 0) {
          challenge.push(s);
        } else {
          standard.push(s);
        }
      }
    }
    return { foundational, standard, challenge };
  }, [classStudents, getStudentTopicState]);

  const handlePublishThreeTiers = async () => {
    setPublishing(true);
    setPublishedCount(null);
    try {
      const effectivePrefix =
        packTitlePrefix.trim() || pick(TEACHER_COPY.defaultPackPrefix);
      const packs = [
        {
          classId: classroom?.id ?? "cls_global_g9",
          title: TEACHER_COPY.buildPackTitle(
            "foundational",
            effectivePrefix,
            locale
          ),
          tier: "foundational" as const,
          targetTopicIds: [
            "mt_math_special_products_factor",
            "mt_math_rational_eq",
            "mt_phy_ohm_law",
          ],
          assignedStudentIds: tierGroups.foundational.map((s) => s.id),
        },
        {
          classId: classroom?.id ?? "cls_global_g9",
          title: TEACHER_COPY.buildPackTitle(
            "standard",
            effectivePrefix,
            locale
          ),
          tier: "standard" as const,
          targetTopicIds: [
            "mt_math_quad_function_parabola",
            "mt_phy_work_kinetic_energy",
          ],
          assignedStudentIds: tierGroups.standard.map((s) => s.id),
        },
        {
          classId: classroom?.id ?? "cls_global_g9",
          title: TEACHER_COPY.buildPackTitle(
            "challenge",
            effectivePrefix,
            locale
          ),
          tier: "challenge" as const,
          targetTopicIds: [
            "mt_math_trig_right_triangle",
            "mt_math_calc_derivative_tangent",
          ],
          assignedStudentIds: tierGroups.challenge.map((s) => s.id),
        },
      ].filter((p) => p.assignedStudentIds.length > 0);

      const res = await fetch("/api/teacher/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_packs", packs }),
      });
      const json = await res.json();
      if (json.ok) {
        await refreshData();
        setPublishedCount(packs.length);
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(TEACHER_COPY.loading)}
      </div>
    );
  }

  const localizedClassName = classroom
    ? localizeClassroomName(classroom, locale)
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
            <span>
              {TEACHER_COPY.headerTitle(localizedClassName, locale)} (
              {pick(TEACHER_COPY.inviteCodeLabel)}{" "}
              <code className="text-indigo-300">{classroom?.inviteCode}</code>)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {TEACHER_COPY.headerSubtitle(
              regionName(regionCode),
              regionCode,
              locale
            )}
          </p>
        </div>
      </div>

      {/* Cross-Subject Root-Cause Radar Alert */}
      {rootCauseAlerts.length > 0 && (
        <section className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/35 via-purple-950/25 to-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
            <AlertOctagon className="h-5 w-5 text-rose-400" />
            <span>{pick(TEACHER_COPY.radarTitle)}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rootCauseAlerts.map((al, i) => (
              <div
                key={i}
                className="rounded-xl border border-rose-500/25 bg-slate-950/80 p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white">
                    {pick(TEACHER_COPY.downstreamBlocked)}[
                    {getSubjectShortBadge(al.downstreamSubject, locale)}]{" "}
                    {al.downstreamTopicTitle}
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 font-bold text-rose-300 shrink-0">
                    {TEACHER_COPY.blockedCountBadge(
                      al.weakCount,
                      classStudents.length,
                      locale
                    )}
                  </span>
                </div>
                <p className="text-slate-300">
                  🔍{" "}
                  <strong className="text-purple-300">
                    {al.isCrossSubject
                      ? pick(TEACHER_COPY.crossSubjectTraceLabel)
                      : pick(TEACHER_COPY.sameSubjectTraceLabel)}
                  </strong>
                  {pick(TEACHER_COPY.radarBodyBefore)}
                  <Link
                    href={`/explore?topic=${al.upstreamRootId}`}
                    className="underline font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    [{getSubjectShortBadge(al.upstreamSubject, locale)}]{" "}
                    {al.upstreamTitle}
                  </Link>
                  {pick(TEACHER_COPY.radarBodyAfter)}
                </p>
                <div className="text-[11px] text-slate-400">
                  {pick(TEACHER_COPY.affectedStudentsPrefix)}
                  {al.affectedStudents.join(pick(TEACHER_COPY.listSeparator))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Class x Topic Mastery Heatmap */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white">
            {pick(TEACHER_COPY.heatmapTitle)}
          </h2>
          <div className="flex gap-3 text-[11px]">
            <span className="text-emerald-300">
              {pick(TEACHER_COPY.legendMastered)}
            </span>
            <span className="text-amber-300">
              {pick(TEACHER_COPY.legendShaky)}
            </span>
            <span className="text-rose-300">
              {pick(TEACHER_COPY.legendWeak)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="py-2.5 pr-3 font-semibold min-w-[195px]">
                  {pick(TEACHER_COPY.colStudentProfile)}
                </th>
                {heatmapTopics.map((t) => {
                  const aln = getAlignment(t.id);
                  const tTitle = localizePlain(t.title);
                  return (
                    <th
                      key={t.id}
                      className="px-1.5 py-2 font-medium min-w-[96px] text-center"
                    >
                      <div className="text-[10px] font-mono text-indigo-300">
                        {getSubjectShortBadge(t.subjectId, locale)}
                      </div>
                      <div
                        className="truncate max-w-[96px] text-slate-200 mx-auto"
                        title={`${tTitle}${
                          aln?.standardCode ? ` (${aln.standardCode})` : ""
                        }`}
                      >
                        {tTitle}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {classStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 pr-3">
                    <Link
                      href="/"
                      onClick={() => setActiveStudentId(stu.id)}
                      className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-indigo-300"
                    >
                      <span>{stu.avatarEmoji}</span>
                      <span>{userName(stu)}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                        {stu.regionCode}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-slate-500" />
                    </Link>
                    <div
                      className="text-[10px] text-slate-500 truncate max-w-[195px]"
                      title={userTrack(stu)}
                    >
                      {userTrack(stu)}
                    </div>
                  </td>
                  {heatmapTopics.map((t) => {
                    const st = getStudentTopicState(t.id, stu.id);
                    const pct = st ? `${Math.round(st.pMastery * 100)}%` : "—";
                    const statusLabel = getMasteryStatusLabel(
                      st?.status ?? "untested",
                      locale
                    );
                    return (
                      <td key={t.id} className="p-1 text-center">
                        <div
                          className={`rounded-lg border py-1.5 text-[11px] font-mono ${cellClass(
                            st?.status
                          )}`}
                          title={`${userName(stu)} - ${localizePlain(
                            t.title
                          )}: ${statusLabel}`}
                        >
                          {pct}
                          {st?.isRootCause ? "🎯" : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 1-Click 3-Tier Differentiated Assignment Publisher */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                {pick(TEACHER_COPY.assignSectionTitle)}
              </h2>
              <p className="text-xs text-slate-400">
                {pick(TEACHER_COPY.assignSectionSubtitle)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={packTitlePrefix}
              onChange={(e) => setPackTitlePrefix(e.target.value)}
              placeholder={pick(TEACHER_COPY.defaultPackPrefix)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none min-w-[220px]"
            />
            <button
              onClick={() => void handlePublishThreeTiers()}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {publishing
                  ? pick(TEACHER_COPY.publishingBtn)
                  : pick(TEACHER_COPY.publishBtn)}
              </span>
            </button>
          </div>
        </div>

        {publishedCount !== null && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2.5 text-xs font-semibold text-emerald-300">
            {TEACHER_COPY.publishSuccess(publishedCount, locale)}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2">
            <div className="font-bold text-amber-300">
              {TEACHER_COPY.tierFoundationalTitle(
                tierGroups.foundational.length,
                locale
              )}
            </div>
            <p className="text-slate-400">
              {pick(TEACHER_COPY.tierFoundationalDesc)}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierGroups.foundational.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800 px-2 py-0.5 text-slate-200"
                >
                  {s.avatarEmoji} {userName(s)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-4 space-y-2">
            <div className="font-bold text-sky-300">
              {TEACHER_COPY.tierStandardTitle(
                tierGroups.standard.length,
                locale
              )}
            </div>
            <p className="text-slate-400">
              {pick(TEACHER_COPY.tierStandardDesc)}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierGroups.standard.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800 px-2 py-0.5 text-slate-200"
                >
                  {s.avatarEmoji} {userName(s)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-slate-950/80 p-4 space-y-2">
            <div className="font-bold text-purple-300">
              {TEACHER_COPY.tierChallengeTitle(
                tierGroups.challenge.length,
                locale
              )}
            </div>
            <p className="text-slate-400">
              {pick(TEACHER_COPY.tierChallengeDesc)}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierGroups.challenge.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800 px-2 py-0.5 text-slate-200"
                >
                  {s.avatarEmoji} {userName(s)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active Published Assignments List */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">
            {pick(TEACHER_COPY.publishedListHeader)}
          </div>
          {data.assignments
            .slice()
            .reverse()
            .map((asg) => (
              <div
                key={asg.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-200">
                    {localizeAssignmentTitle(asg, locale)}
                  </span>
                </div>
                <div className="text-slate-400 font-mono">
                  {TEACHER_COPY.assignmentProgress(
                    asg.completedStudentIdsJson.length,
                    asg.assignedStudentIdsJson.length,
                    asg.dueDate,
                    locale
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
