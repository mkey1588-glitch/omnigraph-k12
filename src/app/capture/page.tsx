"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  GitBranch,
  BookmarkPlus,
  CheckCircle2,
  Upload,
  ArrowRight,
} from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import { MathText } from "@/components/MathText";
import type { LocaleCode, SubjectId } from "@/types/taxonomy";
import type { SmartCaptureAnalysisResult } from "@/lib/engines/smart-capture-and-paper";
import { getLocalizedPrivacyRegime } from "@/lib/engines/privacy-shield";
import {
  localizeChoice,
  localizeExplanation,
  localizePrompt,
  localizeSvgDiagram,
} from "@/lib/i18n";
import {
  CAPTURE_COPY,
  getCaptureSamplePresets,
} from "@/lib/i18n/copy-capture-clearance-auth";

export default function SmartCapturePage() {
  const {
    data,
    loading,
    locale,
    regionCode,
    bilingual,
    activeStudentId,
    activeStudent,
    pick,
    localizePlain,
    userName,
    refreshData,
  } = usePlatform();

  const presets = useMemo(() => getCaptureSamplePresets(locale), [locale]);

  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number | null>(0);
  const [isOcrGenerated, setIsOcrGenerated] = useState<boolean>(false);
  const [userEditedStem, setUserEditedStem] = useState<boolean>(false);

  const [subjectHint, setSubjectHint] = useState<SubjectId | "all">(
    presets[0]?.subject ?? "all"
  );
  const [rawQuestionText, setRawQuestionText] = useState<string>(
    presets[0]?.stem ?? ""
  );
  const [studentWrongAnswer, setStudentWrongAnswer] = useState<string>(
    presets[0]?.wrongAns ?? ""
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SmartCaptureAnalysisResult | null>(null);
  const [shieldInfo, setShieldInfo] = useState<{
    sanitizedText: string;
    redactedTypes: string[];
    regulation: string;
    anonToken: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedWqId, setSavedWqId] = useState<string | null>(null);
  const [twinTryInput, setTwinTryInput] = useState<string>("");
  const [twinFeedback, setTwinFeedback] = useState<"idle" | "right" | "wrong">(
    "idle"
  );

  const executeAnalyze = useCallback(
    async (params: {
      stem: string;
      wrongAns: string;
      targetLocale: LocaleCode;
      preferredSubj: SubjectId | "all";
    }) => {
      if (params.stem.trim().length < 3) return;
      setAnalyzing(true);
      setSavedWqId(null);
      setTwinFeedback("idle");
      setTwinTryInput("");
      try {
        const res = await fetch("/api/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "analyze",
            rawQuestionText: params.stem,
            studentWrongAnswer: params.wrongAns,
            studentId: activeStudentId,
            regionCode,
            locale: params.targetLocale,
            preferredSubjectId: params.preferredSubj,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          setResult(json.analysis as SmartCaptureAnalysisResult);
          setShieldInfo(json.privacyShield);
          await refreshData();
        }
      } finally {
        setAnalyzing(false);
      }
    },
    [activeStudentId, regionCode, refreshData]
  );

  // Sync preset / OCR text whenever UI locale changes (if unedited by user),
  // and re-localize active attribution result if already open.
  const prevLocaleRef = useRef<LocaleCode>(locale);
  useEffect(() => {
    let nextStem = rawQuestionText;
    let nextWrong = studentWrongAnswer;

    if (!userEditedStem) {
      if (isOcrGenerated && imageFileName) {
        nextStem = CAPTURE_COPY.ocrSimulatedStem(imageFileName, locale);
        setRawQuestionText(nextStem);
      } else if (selectedPresetIdx !== null) {
        const localizedPresets = getCaptureSamplePresets(locale);
        const target = localizedPresets[selectedPresetIdx];
        if (target) {
          nextStem = target.stem;
          nextWrong = target.wrongAns;
          setRawQuestionText(nextStem);
          setStudentWrongAnswer(nextWrong);
        }
      }
    }

    if (prevLocaleRef.current !== locale) {
      prevLocaleRef.current = locale;
      if (result !== null) {
        void executeAnalyze({
          stem: nextStem,
          wrongAns: nextWrong,
          targetLocale: locale,
          preferredSubj: subjectHint,
        });
      }
    }
  }, [
    locale,
    selectedPresetIdx,
    isOcrGenerated,
    imageFileName,
    userEditedStem,
    rawQuestionText,
    studentWrongAnswer,
    result,
    subjectHint,
    executeAnalyze,
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(String(reader.result));
      if (!rawQuestionText.trim() || !userEditedStem) {
        setRawQuestionText(CAPTURE_COPY.ocrSimulatedStem(file.name, locale));
        setStudentWrongAnswer("");
        setSubjectHint("math");
        setSelectedPresetIdx(null);
        setIsOcrGenerated(true);
        setUserEditedStem(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAnalyze = async () => {
    await executeAnalyze({
      stem: rawQuestionText,
      wrongAns: studentWrongAnswer,
      targetLocale: locale,
      preferredSubj: subjectHint,
    });
  };

  const handleSaveToWrongBook = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_to_wrong_book",
          studentId: activeStudentId,
          regionCode,
          locale,
          topicId: result.matchedPrimary.topicId,
          canonicalSnapshot: result.canonicalSnapshot,
          wrongUserAnswer:
            studentWrongAnswer.trim() ||
            pick(CAPTURE_COPY.noRecordedWrongAnswer),
          misconceptionTag: result.detectedMisconception.tag,
          misconceptionLabel: result.detectedMisconception.label,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSavedWqId(json.wrongQuestionId as string);
        await refreshData();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        {pick(CAPTURE_COPY.loading)}
      </div>
    );
  }

  const studentDisplayName = activeStudent ? userName(activeStudent) : "";
  const localizedRegime = getLocalizedPrivacyRegime(regionCode, locale);
  const localizedTwinSvg = result
    ? localizeSvgDiagram(result.twinVariant.svgDiagram, locale)
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6 text-indigo-400" />
            <span>{pick(CAPTURE_COPY.title)}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {CAPTURE_COPY.subtitle(regionCode, locale)}
          </p>
        </div>
        <Link
          href="/wrong-book"
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 px-3.5 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-500/25"
        >
          <span>
            {CAPTURE_COPY.viewWrongBookLink(studentDisplayName, locale)}
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quick Preset Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
        <div className="text-xs font-semibold text-slate-300">
          {pick(CAPTURE_COPY.presetStripTitle)}
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedPresetIdx(idx);
                setIsOcrGenerated(false);
                setUserEditedStem(false);
                setSubjectHint(preset.subject);
                setRawQuestionText(preset.stem);
                setStudentWrongAnswer(preset.wrongAns);
                setResult(null);
                setShieldInfo(null);
                setSavedWqId(null);
              }}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                selectedPresetIdx === idx && !userEditedStem
                  ? "border-indigo-400 bg-indigo-500/15 text-indigo-100"
                  : "border-slate-700 bg-slate-950/90 text-slate-200 hover:border-indigo-400 hover:text-indigo-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 Cols: Capture Input Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white">
              {pick(CAPTURE_COPY.step1Title)}
            </h2>
            <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
              {CAPTURE_COPY.activePersonaBadge(
                activeStudent?.avatarEmoji ?? "",
                studentDisplayName,
                regionCode,
                locale
              )}
            </span>
          </div>

          {/* Photo / Screenshot Upload */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-slate-300 hover:border-indigo-400 transition">
            <div className="flex items-center gap-2.5">
              <Upload className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>
                {imageFileName
                  ? CAPTURE_COPY.uploadedImageStatus(imageFileName, locale)
                  : pick(CAPTURE_COPY.uploadPrompt)}
              </span>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-indigo-300 shrink-0">
              {pick(CAPTURE_COPY.chooseImageBtn)}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {imagePreviewUrl && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewUrl}
                alt={pick(CAPTURE_COPY.previewAlt)}
                className="max-h-36 mx-auto rounded-lg object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {pick(CAPTURE_COPY.subjectScopeLabel)}
              </label>
              <select
                value={subjectHint}
                onChange={(e) =>
                  setSubjectHint(e.target.value as SubjectId | "all")
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">{pick(CAPTURE_COPY.allSubjectsOption)}</option>
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {localizePlain(s.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                {pick(CAPTURE_COPY.wrongAttemptLabel)}
              </label>
              <input
                type="text"
                value={studentWrongAnswer}
                onChange={(e) => {
                  setUserEditedStem(true);
                  setStudentWrongAnswer(e.target.value);
                }}
                placeholder={pick(CAPTURE_COPY.wrongAttemptPlaceholder)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              {pick(CAPTURE_COPY.stemLabel)}
            </label>
            <textarea
              rows={5}
              value={rawQuestionText}
              onChange={(e) => {
                setUserEditedStem(true);
                setRawQuestionText(e.target.value);
              }}
              placeholder={pick(CAPTURE_COPY.stemPlaceholder)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => void runAnalyze()}
            disabled={analyzing || rawQuestionText.trim().length < 3}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {analyzing
                ? pick(CAPTURE_COPY.analyzingBtn)
                : pick(CAPTURE_COPY.runAnalyzeBtn)}
            </span>
          </button>
        </div>

        {/* Right 7 Cols: Attribution Output + Privacy Audit + Twin Arena */}
        <div className="lg:col-span-7 space-y-4">
          {!result ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center space-y-3">
              <Camera className="h-10 w-10 text-indigo-400 mx-auto opacity-80" />
              <div className="text-sm font-bold text-white">
                {pick(CAPTURE_COPY.waitingTitle)}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {CAPTURE_COPY.waitingBody(regionCode, locale)}
              </p>
            </div>
          ) : (
            <>
              {/* Privacy Shield Verification Banner */}
              {shieldInfo && (
                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/20 p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                      {CAPTURE_COPY.shieldActiveBanner(
                        localizedRegime.regulationName,
                        locale
                      )}
                    </span>
                    <span className="font-mono text-[11px] text-emerald-200/90">
                      {CAPTURE_COPY.anonTokenLabel(shieldInfo.anonToken, locale)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono bg-slate-950/80 rounded-lg px-3 py-2 break-words">
                    {CAPTURE_COPY.sanitizedPayloadLabel(
                      shieldInfo.sanitizedText,
                      locale
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {shieldInfo.redactedTypes.length > 0 ? (
                      shieldInfo.redactedTypes.map((rt) => (
                        <span
                          key={rt}
                          className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-emerald-200 font-semibold"
                        >
                          {CAPTURE_COPY.redactedFieldBadge(rt, locale)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">
                        {pick(CAPTURE_COPY.noPiiDetectedNote)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Matched Canonical Node & Upstream Root Causes */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 font-mono text-xs font-bold text-indigo-300">
                        {result.matchedPrimary.standardCode}
                      </span>
                      <span className="text-xs text-slate-400">
                        {regionCode} · {result.matchedPrimary.localStageLabel} ·{" "}
                        {result.matchedPrimary.localChapterTitle}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold text-white">
                      {pick(CAPTURE_COPY.matchedSkillPrefix)}
                      {result.matchedPrimary.title}
                    </h3>
                  </div>

                  <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                    {CAPTURE_COPY.confidenceBadge(
                      Math.round(result.matchedPrimary.confidence * 100),
                      locale
                    )}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">
                  {result.analysisSummary}
                </p>

                {/* Misconception Diagnosis */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>
                      {pick(CAPTURE_COPY.detectedMisconceptionPrefix)}
                      {result.detectedMisconception.label} (
                      <code>{result.detectedMisconception.tag}</code>)
                    </span>
                  </div>
                  <p className="text-slate-300">
                    {pick(CAPTURE_COPY.remediationTipPrefix)}
                    <MathText text={result.detectedMisconception.remediationTip} />
                  </p>
                </div>

                {/* Upstream DAG Root Causes */}
                {result.upstreamRootCauses.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 text-indigo-400" />
                      <span>{pick(CAPTURE_COPY.upstreamChainTitle)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {result.upstreamRootCauses.map((up) => (
                        <Link
                          key={up.topicId}
                          href={`/diagnose?topic=${up.topicId}`}
                          className="rounded-xl border border-slate-700/80 bg-slate-950/80 p-3 hover:border-indigo-400 transition block space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span
                              className={`rounded px-1.5 py-0.5 font-semibold ${
                                up.relationType === "cross_subject"
                                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                                  : "bg-indigo-500/20 text-indigo-300"
                              }`}
                            >
                              {up.relationType === "cross_subject"
                                ? pick(CAPTURE_COPY.crossSubjectBadge)
                                : pick(CAPTURE_COPY.directPrereqBadge)}
                            </span>
                            <span className="font-mono text-slate-400">
                              {up.standardCode}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">
                            {up.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {up.reason}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save to FSRS Wrong-Book Action */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  {savedWqId ? (
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        {pick(CAPTURE_COPY.savedPrefix)}
                        <code>{savedWqId}</code>
                        {pick(CAPTURE_COPY.savedSuffix)}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleSaveToWrongBook()}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-50"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                      <span>{pick(CAPTURE_COPY.saveToWrongBookBtn)}</span>
                    </button>
                  )}

                  <Link
                    href={`/explore?topic=${result.matchedPrimary.topicId}`}
                    className="text-xs font-semibold text-indigo-300 hover:underline"
                  >
                    {pick(CAPTURE_COPY.exploreNodeLink)}
                  </Link>
                </div>
              </div>

              {/* Instant Twin-Variant Verification Card */}
              <div className="rounded-2xl border border-violet-500/30 bg-slate-900/80 p-5 space-y-3">
                <div className="text-xs font-bold text-violet-300">
                  {pick(CAPTURE_COPY.instantTwinTitle)}
                </div>
                <div className="text-sm font-semibold text-white whitespace-pre-line">
                  <MathText
                    text={localizePrompt(result.twinVariant, locale, bilingual)}
                  />
                </div>
                {localizedTwinSvg && (
                  <div
                    className="flex justify-center rounded-xl border border-slate-800 bg-slate-950 p-3"
                    dangerouslySetInnerHTML={{
                      __html: localizedTwinSvg,
                    }}
                  />
                )}
                {result.twinVariant.choices ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.twinVariant.choices.map((ch) => (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() => {
                          setTwinTryInput(ch.key);
                          setTwinFeedback(
                            ch.key === result.twinVariant.answer
                              ? "right"
                              : "wrong"
                          );
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-left text-xs text-white hover:border-violet-400"
                      >
                        <strong className="text-violet-300 mr-2">
                          {ch.key}.
                        </strong>
                        <MathText
                          text={localizeChoice(ch, locale, bilingual)}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={twinTryInput}
                      onChange={(e) => setTwinTryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setTwinFeedback(
                            twinTryInput.trim() === result.twinVariant.answer
                              ? "right"
                              : "wrong"
                          );
                        }
                      }}
                      placeholder={pick(CAPTURE_COPY.instantTwinPlaceholder)}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setTwinFeedback(
                          twinTryInput.trim() === result.twinVariant.answer
                            ? "right"
                            : "wrong"
                        )
                      }
                      className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500"
                    >
                      {pick(CAPTURE_COPY.checkTwinBtn)}
                    </button>
                  </div>
                )}

                {twinFeedback === "right" && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                    {pick(CAPTURE_COPY.twinRightPrefix)}
                    <MathText
                      text={localizeExplanation(
                        result.twinVariant,
                        locale,
                        bilingual
                      )}
                    />
                  </div>
                )}
                {twinFeedback === "wrong" && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
                    {CAPTURE_COPY.twinWrongPrefix(
                      result.twinVariant.answer,
                      locale
                    )}
                    <MathText
                      text={localizeExplanation(
                        result.twinVariant,
                        locale,
                        bilingual
                      )}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
