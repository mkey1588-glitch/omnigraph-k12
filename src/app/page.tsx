"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Crosshair,
  BookOpenCheck,
  Network,
  Layers,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";

export default function StudentDashboardPage() {
  const {
    data,
    loading,
    regionCode,
    activeRegion,
    activeStudent,
    activeStudentId,
    localize,
    getAlignment,
    getStudentTopicState,
    refreshData,
  } = usePlatform();

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-400">
        正在加载 OmniGraph K12 全球 9 地知识图谱与个性化学习画像...
      </div>
    );
  }

  const studentStates = data.studentStates.filter(
    (s) => s.studentId === activeStudentId
  );
  const masteredCount = studentStates.filter(
    (s) => s.status === "mastered" || s.status === "inferred_mastered"
  ).length;
  const shakyCount = studentStates.filter((s) => s.status === "shaky").length;
  const weakStates = studentStates.filter((s) => s.status === "weak");

  // Compute root-cause weak topics dynamically (weak topics with no upstream weak topic)
  const weakSet = new Set(weakStates.map((w) => w.topicId));
  const rootCauseTopics = weakStates
    .filter((ws) => {
      const directPrereqs = data.edges
        .filter((e) => e.topicId === ws.topicId)
        .map((e) => e.prerequisiteId);
      return ws.isRootCause || !directPrereqs.some((p) => weakSet.has(p));
    })
    .map((ws) => ({
      state: ws,
      topic: data.topics.find((t) => t.id === ws.topicId)!,
      downstreamBlocked: data.edges
        .filter((e) => e.prerequisiteId === ws.topicId)
        .map((e) => ({
          edge: e,
          topic: data.topics.find((t) => t.id === e.topicId)!,
        }))
        .filter((x) => Boolean(x.topic)),
    }))
    .filter((x) => Boolean(x.topic));

  const studentWrongList = data.wrongQuestions.filter(
    (w) => w.studentId === activeStudentId && w.status !== "cleared"
  );

  const myAssignments = data.assignments.filter((a) =>
    a.assignedStudentIdsJson.includes(activeStudentId)
  );

  const localGradeLabel =
    activeStudent?.currentGrade && activeRegion
      ? activeRegion.gradeLabels[activeStudent.currentGrade]
      : `Grade ${activeStudent?.currentGrade ?? 9}`;

  const toggleAssignment = async (assignmentId: string) => {
    await fetch("/api/teacher/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle_complete",
        assignmentId,
        studentId: activeStudentId,
      }),
    });
    await refreshData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 font-semibold text-indigo-300 border border-indigo-500/30">
                {activeRegion?.flag} 当前课标透镜：{activeRegion?.nameLocal}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300">
                对应学段：{localGradeLabel}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-300 border border-emerald-500/30">
                隐私合规基线：{activeRegion?.privacyRegulation}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {activeStudent?.avatarEmoji} 你好，{activeStudent?.displayName}！
            </h1>
            <p className="max-w-3xl text-sm text-slate-300">
              {activeStudent?.schoolTrack} · 系统正基于{" "}
              <span className="font-semibold text-indigo-300">
                全球统一概念核（Canonical Core）+ {regionCode} 课标映射层
              </span>{" "}
              实时追踪你的上下游先修掌握度与跨学科数学工具链。
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/diagnose"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Crosshair className="h-4 w-4" />
              <span>启动靶向回溯诊断</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-indigo-400 hover:text-white transition"
            >
              <Network className="h-4 w-4 text-indigo-400" />
              <span>探索全科 DAG 星海</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">已掌握 / 剪枝豁免</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {masteredCount}
              </span>
              <span className="text-xs text-slate-400">
                / {data.topics.length} 核心微技能
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">粗心滑档待巩固 (Shaky)</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">
                {shakyCount}
              </span>
              <span className="text-xs text-slate-400">无需深层回溯</span>
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">薄弱与前置病灶 (Weak)</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-400">
                {weakStates.length}
              </span>
              <span className="text-xs text-rose-300/80">
                含 {rootCauseTopics.length} 个源头根因
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-violet-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">FSRS 错题待孪生清零</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-violet-400">
                {studentWrongList.length}
              </span>
              <Link
                href="/wrong-book"
                className="text-xs text-indigo-300 hover:underline"
              >
                去清零 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Content: Root-Cause Path + FSRS Wrong Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 cols: Upstream Root-Cause Prescription & Teacher Assignments */}
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  图谱溯源处方：优先攻克「上游根因」解锁下游多科卡点
                </h2>
              </div>
              <span className="text-xs text-slate-400">DAG 拓扑最短修复路径</span>
            </div>

            {rootCauseTopics.length === 0 ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
                🎉 太棒了！当前已测节点未发现上游先修断层，可直接前往「知识图谱星海」挑战更高学段微积分或拔高专题！
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {rootCauseTopics.map(({ topic, state, downstreamBlocked }) => {
                  const aln = getAlignment(topic.id);
                  return (
                    <div
                      key={topic.id}
                      className="rounded-xl border border-rose-500/30 bg-slate-950/80 p-4 transition hover:border-rose-400/50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-300 border border-rose-500/30">
                              🎯 源头病灶 Root Cause
                            </span>
                            <span className="text-xs font-mono text-indigo-300">
                              {aln?.standardCode} · {aln?.localStageLabel}
                            </span>
                          </div>
                          <h3 className="mt-1.5 text-sm font-bold text-white">
                            {localize(topic.title)}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">
                            BKT 掌握概率
                          </span>
                          <div className="text-sm font-bold text-rose-400">
                            {Math.round(state.pMastery * 100)}%
                          </div>
                        </div>
                      </div>

                      {downstreamBlocked.length > 0 && (
                        <div className="mt-3 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-slate-300">
                          <span className="text-amber-300 font-semibold">
                            ⚡ 修复该节点将直接打通下游：
                          </span>{" "}
                          {downstreamBlocked.map(({ edge, topic: dt }, idx) => (
                            <span key={dt.id}>
                              {idx > 0 ? "、" : ""}
                              <span
                                className={
                                  edge.relationType === "cross_subject"
                                    ? "text-purple-300 font-semibold"
                                    : "text-slate-200"
                                }
                              >
                                {edge.relationType === "cross_subject"
                                  ? `[跨科:${dt.subjectId.toUpperCase()}] `
                                  : ""}
                                {dt.title["zh-CN"]}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/explore?topic=${topic.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/20 border border-indigo-500/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/30"
                        >
                          <span>学 3 分钟微课件</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/diagnose?topic=${topic.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                        >
                          <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                          <span>靶向复测确认</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Teacher Differentiated Assignments */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  班级分层个性化任务单
                </h2>
              </div>
              <span className="text-xs text-slate-400">教师端精准靶向派发</span>
            </div>

            {myAssignments.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">
                当前学生暂无班级派发任务（可切换至 G9 班级学生如林小宇查看分层作业，或在教师端一键派发）。
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {myAssignments.map((asg) => {
                  const done =
                    asg.completedStudentIdsJson.includes(activeStudentId);
                  const tierBadge =
                    asg.tier === "foundational"
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : asg.tier === "challenge"
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        : "bg-sky-500/15 text-sky-300 border-sky-500/30";
                  return (
                    <div
                      key={asg.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => void toggleAssignment(asg.id)}
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition ${
                            done
                              ? "border-emerald-500 bg-emerald-500 text-slate-950"
                              : "border-slate-600 bg-slate-900 hover:border-indigo-400"
                          }`}
                        >
                          {done && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${tierBadge}`}
                            >
                              {asg.tier}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                done
                                  ? "line-through text-slate-500"
                                  : "text-slate-100"
                              }`}
                            >
                              {asg.title}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            关联 {asg.targetTopicIdsJson.length} 个图谱微技能 · 截止{" "}
                            {asg.dueDate}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/diagnose?topic=${asg.targetTopicIdsJson[0] ?? "mt_math_rational_eq"}`}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:border-indigo-500"
                      >
                        开始闯关 →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right 5 cols: FSRS Spaced-Repetition Queue */}
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">
                  今日 FSRS 遗忘曲线待复习队列
                </h2>
              </div>
              <Link
                href="/wrong-book"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                全部错题本 →
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              拒绝死记原题答案！系统每次提取均动态生成「同构不同数」孪生变式题，连续 3 次 Good/Easy 方可彻底清零。
            </p>

            <div className="mt-4 space-y-3">
              {studentWrongList.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                  今日暂无待清零错题！去「靶向回溯诊断」做一次体检吧。
                </div>
              ) : (
                studentWrongList.map((wq) => {
                  const topic = data.topics.find((t) => t.id === wq.topicId);
                  const retPct = Math.round(wq.retrievability * 100);
                  return (
                    <div
                      key={wq.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-indigo-300 truncate">
                          {topic ? localize(topic.title) : wq.topicId}
                        </span>
                        <span className="shrink-0 rounded bg-violet-500/15 px-2 py-0.5 text-[11px] font-mono text-violet-300 border border-violet-500/30">
                          清零连击 {wq.twinClearStreak}/3
                        </span>
                      </div>

                      {wq.misconceptionLabel && (
                        <div className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                          <span>迷思诊断：{wq.misconceptionLabel}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          记忆保留率 R ={" "}
                          <strong
                            className={
                              retPct < 85 ? "text-rose-400" : "text-emerald-400"
                            }
                          >
                            {retPct}%
                          </strong>{" "}
                          · 稳定性 S = {wq.fsrsStability}d
                        </span>
                        <Link
                          href="/wrong-book"
                          className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          <BookOpenCheck className="h-3.5 w-3.5" />
                          <span>练孪生变式</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Regional Exam & Notation Card */}
          {activeRegion && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">
                  {activeRegion.flag} {activeRegion.nameZh} 学制与升学考纲基座
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  货币符号 {activeRegion.notation.currencySymbol}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>学制结构：</strong>
                {activeRegion.schoolSystem}
              </p>
              <p className="text-xs text-slate-300">
                <strong>官方课标：</strong>
                {activeRegion.curriculumName}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeRegion.flagshipExams.map((ex) => (
                  <span
                    key={ex}
                    className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
                  >
                    🎯 {ex}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* All-Subject 8-Domain Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            全科 K12 知识图谱矩阵（数学深度主干 + 物理跨科桥接 + 六科全科扩展）
          </h2>
          <Link
            href="/explore"
            className="text-xs font-semibold text-indigo-400 hover:underline"
          >
            打开完整 DAG 画布 →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.subjects.map((sub) => {
            const subTopics = data.topics.filter((t) => t.subjectId === sub.id);
            const subMastered = subTopics.filter((t) => {
              const st = getStudentTopicState(t.id)?.status;
              return st === "mastered" || st === "inferred_mastered";
            }).length;
            const pct =
              subTopics.length > 0
                ? Math.round((subMastered / subTopics.length) * 100)
                : 0;
            return (
              <Link
                key={sub.id}
                href={`/explore?subject=${sub.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-indigo-500/50 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{sub.icon}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                    {subMastered}/{subTopics.length} 节点
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-white group-hover:text-indigo-300">
                  {localize(sub.name)}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {sub.description["zh-CN"]}
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
