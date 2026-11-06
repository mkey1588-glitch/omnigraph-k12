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
import type { MasteryStatus } from "@/types/taxonomy";

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
    regionCode,
    getAlignment,
    getStudentTopicState,
    setActiveStudentId,
    refreshData,
  } = usePlatform();

  const [publishing, setPublishing] = useState(false);
  const [publishBanner, setPublishBanner] = useState<string>("");
  const [packTitlePrefix, setPackTitlePrefix] = useState<string>(
    "第11周数理跨科靶向分层单"
  );

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

  // Automated Class-Wide Prerequisite & Cross-Subject Root-Cause Detector!
  const rootCauseAlerts = useMemo(() => {
    if (!data || classStudents.length === 0) return [];
    const alerts: Array<{
      downstreamTopicTitle: string;
      downstreamSubject: string;
      weakCount: number;
      upstreamRootId: string;
      upstreamTitle: string;
      upstreamSubject: string;
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
              downstreamTopicTitle: topic.title["zh-CN"],
              downstreamSubject: topic.subjectId,
              weakCount: weakStudents.length,
              upstreamRootId: upTopic.id,
              upstreamTitle: upTopic.title["zh-CN"],
              upstreamSubject: upTopic.subjectId,
              isCrossSubject: edge.relationType === "cross_subject",
              affectedStudents: sharedWeak.map((s) => s.displayName),
            });
          }
        }
      }
    }
    return alerts;
  }, [data, classStudents, heatmapTopics, getStudentTopicState]);

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
    setPublishBanner("");
    try {
      const packs = [
        {
          classId: classroom?.id ?? "cls_global_g9",
          title: `【补基层】${packTitlePrefix}：分式方程倒数变形与并联欧姆定律`,
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
          title: `【巩固层】${packTitlePrefix}：二次函数抛物线顶点式与机械能`,
          tier: "standard" as const,
          targetTopicIds: [
            "mt_math_quad_function_parabola",
            "mt_phy_work_kinetic_energy",
          ],
          assignedStudentIds: tierGroups.standard.map((s) => s.id),
        },
        {
          classId: classroom?.id ?? "cls_global_g9",
          title: `【拔高层】${packTitlePrefix}：三角比综合与多项式导数切线探究`,
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
        setPublishBanner(
          `✅ 已成功向全班精准派发 ${packs.length} 档分层作业包（已同步至各学生端首页）！`
        );
      }
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在加载班级学情热力图与跨科共性病灶引擎...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
            <span>
              教师教研与分层指挥台 — {classroom?.name}（邀请码{" "}
              <code className="text-indigo-300">{classroom?.inviteCode}</code>）
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            支持多学制插班生统一归口到全球概念核（当前课标视图：{regionCode}），自动识别全班跨科前置根因并一键派发三档分层作业。
          </p>
        </div>
      </div>

      {/* Cross-Subject Root-Cause Radar Alert */}
      {rootCauseAlerts.length > 0 && (
        <section className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/35 via-purple-950/25 to-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
            <AlertOctagon className="h-5 w-5 text-rose-400" />
            <span>
              全班共性前置病灶与跨学科预警（DAG Automated Root-Cause Radar）
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rootCauseAlerts.map((al, i) => (
              <div
                key={i}
                className="rounded-xl border border-rose-500/25 bg-slate-950/80 p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    下游受阻：[{al.downstreamSubject.toUpperCase()}]{" "}
                    {al.downstreamTopicTitle}
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 font-bold text-rose-300">
                    {al.weakCount}/{classStudents.length} 人卡壳
                  </span>
                </div>
                <p className="text-slate-300">
                  🔍{" "}
                  <strong className="text-purple-300">
                    {al.isCrossSubject ? "跨科数学根因溯源：" : "同科上游根因溯源："}
                  </strong>
                  图谱检测到受阻学生共同在先修节点{" "}
                  <Link
                    href={`/explore?topic=${al.upstreamRootId}`}
                    className="underline font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    [{al.upstreamSubject.toUpperCase()}] {al.upstreamTitle}
                  </Link>{" "}
                  存在薄弱断层！建议优先安排 15 分钟微专题补基后再讲评新课。
                </p>
                <div className="text-[11px] text-slate-400">
                  涉及学生：{al.affectedStudents.join("、")}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Class × Topic Mastery Heatmap */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white">
            班级学生 × 核心微技能掌握度热力矩阵（点击学生姓名可切换视角）
          </h2>
          <div className="flex gap-3 text-[11px]">
            <span className="text-emerald-300">■ 已掌握 (≥85%)</span>
            <span className="text-amber-300">■ 粗心滑档 Shaky</span>
            <span className="text-rose-300">■ 薄弱卡点 Weak</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="py-2.5 pr-3 font-semibold min-w-[175px]">
                  学生档案（原生学制）
                </th>
                {heatmapTopics.map((t) => {
                  const aln = getAlignment(t.id);
                  return (
                    <th
                      key={t.id}
                      className="px-1.5 py-2 font-medium min-w-[92px] text-center"
                    >
                      <div className="text-[10px] font-mono text-indigo-300">
                        {t.subjectId === "physics" ? "⚡PHY" : "📐MATH"}
                      </div>
                      <div
                        className="truncate max-w-[92px] text-slate-200"
                        title={`${t.title["zh-CN"]} (${aln?.standardCode})`}
                      >
                        {t.title["zh-CN"].slice(0, 6)}
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
                      <span>{stu.displayName}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">
                        {stu.regionCode}
                      </span>
                      <ArrowUpRight className="h-3 w-3 text-slate-500" />
                    </Link>
                  </td>
                  {heatmapTopics.map((t) => {
                    const st = getStudentTopicState(t.id, stu.id);
                    const pct = st ? `${Math.round(st.pMastery * 100)}%` : "—";
                    return (
                      <td key={t.id} className="p-1 text-center">
                        <div
                          className={`rounded-lg border py-1.5 text-[11px] font-mono ${cellClass(
                            st?.status
                          )}`}
                          title={`${stu.displayName} - ${t.title["zh-CN"]}: ${
                            st?.status ?? "untested"
                          }`}
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
                一键智能三档分层派题（Auto-Clustered Differentiated Assignments）
              </h2>
              <p className="text-xs text-slate-400">
                系统已根据全班 DAG 掌握向量自动聚类为「补基层 / 巩固层 / 拔高层」，每位学生收到各自最近发展区（ZPD）变式题。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={packTitlePrefix}
              onChange={(e) => setPackTitlePrefix(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => void handlePublishThreeTiers()}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>一键派发三档分层任务包</span>
            </button>
          </div>
        </div>

        {publishBanner && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-4 py-2.5 text-xs font-semibold text-emerald-300">
            {publishBanner}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
          <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2">
            <div className="font-bold text-amber-300">
              🛠️ 第一档：靶向补基层（Foundational · {tierGroups.foundational.length}人）
            </div>
            <p className="text-slate-400">
              先补「完全平方因式分解」与「分式方程倒数变形」，再回攻「物理并联欧姆定律」。
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierGroups.foundational.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800 px-2 py-0.5 text-slate-200"
                >
                  {s.avatarEmoji} {s.displayName}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-slate-950/80 p-4 space-y-2">
            <div className="font-bold text-sky-300">
              📈 第二档：稳固进阶层（Standard · {tierGroups.standard.length}人）
            </div>
            <p className="text-slate-400">
              聚焦「二次函数顶点式对称轴符号」与「动能定理速度平方项」易错滑档点强化。
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierGroups.standard.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800 px-2 py-0.5 text-slate-200"
                >
                  {s.avatarEmoji} {s.displayName}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-slate-950/80 p-4 space-y-2">
            <div className="font-bold text-purple-300">
              🚀 第三档：竞赛/先修拔高层（Challenge · {tierGroups.challenge.length}人）
            </div>
            <p className="text-slate-400">
              已扎实掌握初三数理主干，开放「直角三角比综合」与高中/A-Math「导数切线斜率」先修挑战。
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tierGroups.challenge.map((s) => (
                <span
                  key={s.id}
                  className="rounded bg-slate-800 px-2 py-0.5 text-slate-200"
                >
                  {s.avatarEmoji} {s.displayName}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Active Published Assignments List */}
        <div className="border-t border-slate-800 pt-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400">
            📋 已发布任务包实时完成率追踪（SQLite 持久化）：
          </div>
          {data.assignments.slice().reverse().map((asg) => (
            <div
              key={asg.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                <span className="font-semibold text-slate-200">{asg.title}</span>
              </div>
              <div className="text-slate-400 font-mono">
                完成进度 {asg.completedStudentIdsJson.length} /{" "}
                {asg.assignedStudentIdsJson.length} 人 · 截止 {asg.dueDate}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
