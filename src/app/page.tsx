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
import {
  localizeAssignmentTitle,
  localizeMisconceptionLabel,
} from "@/lib/i18n";
import { STUDENT_DASHBOARD_COPY } from "@/lib/i18n/copy-student-core";

export default function StudentDashboardPage() {
  const {
    data,
    loading,
    locale,
    regionCode,
    activeRegion,
    activeStudent,
    activeStudentId,
    pick,
    localize,
    userName,
    userTrack,
    regionName,
    regionProfile,
    gradeLabel,
    getAlignment,
    getStudentTopicState,
    refreshData,
  } = usePlatform();

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-400">
        {pick(STUDENT_DASHBOARD_COPY.loading)}
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

  const localGradeLabel = gradeLabel(activeStudent?.currentGrade ?? 9);
  const activeRegionProf = activeRegion
    ? regionProfile(activeRegion)
    : undefined;
  const studentDisplayName = activeStudent ? userName(activeStudent) : "";
  const studentTrackLabel = activeStudent ? userTrack(activeStudent) : "";

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
                {activeRegion?.flag} {pick(STUDENT_DASHBOARD_COPY.currentLensPrefix)}
                {activeRegionProf?.labelWithSystem}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-300">
                {pick(STUDENT_DASHBOARD_COPY.gradeStagePrefix)}
                {localGradeLabel}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-emerald-300 border border-emerald-500/30">
                {pick(STUDENT_DASHBOARD_COPY.privacyBaselinePrefix)}
                {activeRegionProf?.privacyRegulation}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {activeStudent?.avatarEmoji}{" "}
              {STUDENT_DASHBOARD_COPY.greeting(studentDisplayName, locale)}
            </h1>
            <p className="max-w-3xl text-sm text-slate-300">
              {studentTrackLabel ? `${studentTrackLabel} · ` : ""}
              {pick(STUDENT_DASHBOARD_COPY.heroIntroBefore)}
              <span className="font-semibold text-indigo-300">
                {STUDENT_DASHBOARD_COPY.heroIntroHighlight(regionCode, locale)}
              </span>
              {pick(STUDENT_DASHBOARD_COPY.heroIntroAfter)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/diagnose"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <Crosshair className="h-4 w-4" />
              <span>{pick(STUDENT_DASHBOARD_COPY.ctaDiagnose)}</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-indigo-400 hover:text-white transition"
            >
              <Network className="h-4 w-4 text-indigo-400" />
              <span>{pick(STUDENT_DASHBOARD_COPY.ctaExplore)}</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-emerald-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">
              {pick(STUDENT_DASHBOARD_COPY.metricMasteredLabel)}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {masteredCount}
              </span>
              <span className="text-xs text-slate-400">
                {STUDENT_DASHBOARD_COPY.metricMasteredTotal(
                  data.topics.length,
                  locale
                )}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">
              {pick(STUDENT_DASHBOARD_COPY.metricShakyLabel)}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-400">
                {shakyCount}
              </span>
              <span className="text-xs text-slate-400">
                {pick(STUDENT_DASHBOARD_COPY.metricShakySub)}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">
              {pick(STUDENT_DASHBOARD_COPY.metricWeakLabel)}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-400">
                {weakStates.length}
              </span>
              <span className="text-xs text-rose-300/80">
                {STUDENT_DASHBOARD_COPY.metricWeakSub(
                  rootCauseTopics.length,
                  locale
                )}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-violet-500/25 bg-slate-950/60 p-3.5">
            <div className="text-xs text-slate-400">
              {pick(STUDENT_DASHBOARD_COPY.metricWrongLabel)}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-violet-400">
                {studentWrongList.length}
              </span>
              <Link
                href="/wrong-book"
                className="text-xs text-indigo-300 hover:underline"
              >
                {pick(STUDENT_DASHBOARD_COPY.metricWrongAction)}
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 shrink-0 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  {pick(STUDENT_DASHBOARD_COPY.rootPrescriptionTitle)}
                </h2>
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {pick(STUDENT_DASHBOARD_COPY.rootPrescriptionBadge)}
              </span>
            </div>

            {rootCauseTopics.length === 0 ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
                {pick(STUDENT_DASHBOARD_COPY.rootEmptyMsg)}
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
                              {pick(STUDENT_DASHBOARD_COPY.rootCauseTag)}
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
                            {pick(STUDENT_DASHBOARD_COPY.bktMasteryProb)}
                          </span>
                          <div className="text-sm font-bold text-rose-400">
                            {Math.round(state.pMastery * 100)}%
                          </div>
                        </div>
                      </div>

                      {downstreamBlocked.length > 0 && (
                        <div className="mt-3 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-slate-300">
                          <span className="text-amber-300 font-semibold">
                            {pick(STUDENT_DASHBOARD_COPY.downstreamUnlockPrefix)}
                          </span>
                          {downstreamBlocked.map(({ edge, topic: dt }, idx) => (
                            <span key={dt.id}>
                              {idx > 0
                                ? pick(STUDENT_DASHBOARD_COPY.listSep)
                                : ""}
                              <span
                                className={
                                  edge.relationType === "cross_subject"
                                    ? "text-purple-300 font-semibold"
                                    : "text-slate-200"
                                }
                              >
                                {edge.relationType === "cross_subject"
                                  ? STUDENT_DASHBOARD_COPY.crossSubjectTag(
                                      dt.subjectId.toUpperCase(),
                                      locale
                                    )
                                  : ""}
                                {localize(dt.title)}
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
                          <span>
                            {pick(STUDENT_DASHBOARD_COPY.learnMicroLessonBtn)}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/diagnose?topic=${topic.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                        >
                          <Crosshair className="h-3.5 w-3.5 text-amber-400" />
                          <span>
                            {pick(STUDENT_DASHBOARD_COPY.retestTargetBtn)}
                          </span>
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">
                  {pick(STUDENT_DASHBOARD_COPY.assignmentsTitle)}
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {pick(STUDENT_DASHBOARD_COPY.assignmentsSubtitle)}
              </span>
            </div>

            {myAssignments.length === 0 ? (
              <p className="mt-3 text-xs text-slate-400">
                {pick(STUDENT_DASHBOARD_COPY.assignmentsEmpty)}
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
                              {STUDENT_DASHBOARD_COPY.assignmentTierLabel(
                                asg.tier,
                                locale
                              )}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                done
                                  ? "line-through text-slate-500"
                                  : "text-slate-100"
                              }`}
                            >
                              {localizeAssignmentTitle(asg, locale)}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {STUDENT_DASHBOARD_COPY.assignmentMeta(
                              asg.targetTopicIdsJson.length,
                              asg.dueDate,
                              locale
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/diagnose?topic=${asg.targetTopicIdsJson[0] ?? "mt_math_rational_eq"}`}
                        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:border-indigo-500"
                      >
                        {pick(STUDENT_DASHBOARD_COPY.assignmentStartBtn)}
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">
                  {pick(STUDENT_DASHBOARD_COPY.fsrsQueueTitle)}
                </h2>
              </div>
              <Link
                href="/wrong-book"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 shrink-0"
              >
                {pick(STUDENT_DASHBOARD_COPY.fsrsAllLink)}
              </Link>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {pick(STUDENT_DASHBOARD_COPY.fsrsQueueDesc)}
            </p>

            <div className="mt-4 space-y-3">
              {studentWrongList.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                  {pick(STUDENT_DASHBOARD_COPY.fsrsQueueEmpty)}
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
                          {STUDENT_DASHBOARD_COPY.clearStreak(
                            wq.twinClearStreak,
                            locale
                          )}
                        </span>
                      </div>

                      {wq.misconceptionLabel && (
                        <div className="flex items-start gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 text-[11px] text-amber-200">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                          <span>
                            {pick(STUDENT_DASHBOARD_COPY.misconceptionPrefix)}
                            {localizeMisconceptionLabel(wq, topic, locale)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {pick(STUDENT_DASHBOARD_COPY.retrievabilityPrefix)}{" "}
                          <strong
                            className={
                              retPct < 85 ? "text-rose-400" : "text-emerald-400"
                            }
                          >
                            {retPct}%
                          </strong>{" "}
                          ·{" "}
                          {STUDENT_DASHBOARD_COPY.stabilityLabel(
                            wq.fsrsStability,
                            locale
                          )}
                        </span>
                        <Link
                          href="/wrong-book"
                          className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          <BookOpenCheck className="h-3.5 w-3.5" />
                          <span>
                            {pick(STUDENT_DASHBOARD_COPY.practiceTwinBtn)}
                          </span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Regional Exam & Notation Card */}
          {activeRegion && activeRegionProf && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-white">
                  {activeRegion.flag}{" "}
                  {STUDENT_DASHBOARD_COPY.regionCardTitle(
                    activeRegionProf.name || regionName(activeRegion.code),
                    locale
                  )}
                </h3>
                <span className="text-xs font-mono text-slate-400 shrink-0">
                  {STUDENT_DASHBOARD_COPY.currencySymbolLabel(
                    activeRegion.notation.currencySymbol,
                    locale
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                <strong>
                  {pick(STUDENT_DASHBOARD_COPY.schoolSystemLabel)}
                </strong>
                {activeRegionProf.schoolSystem}
              </p>
              <p className="text-xs text-slate-300">
                <strong>
                  {pick(STUDENT_DASHBOARD_COPY.officialCurriculumLabel)}
                </strong>
                {activeRegionProf.curriculumName}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeRegionProf.flagshipExams.map((ex) => (
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

      {/* All-Subject Domain Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white">
            {pick(STUDENT_DASHBOARD_COPY.allSubjectGridTitle)}
          </h2>
          <Link
            href="/explore"
            className="text-xs font-semibold text-indigo-400 hover:underline shrink-0"
          >
            {pick(STUDENT_DASHBOARD_COPY.openFullDagLink)}
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
                    {STUDENT_DASHBOARD_COPY.subjectNodeCount(
                      subMastered,
                      subTopics.length,
                      locale
                    )}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-white group-hover:text-indigo-300">
                  {localize(sub.name)}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {localize(sub.description)}
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
