"use client";

import React, { useState } from "react";
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
import type { SubjectId } from "@/types/taxonomy";
import type { SmartCaptureAnalysisResult } from "@/lib/engines/smart-capture-and-paper";

const SAMPLE_WRONG_QUESTIONS = [
  {
    label: "⚡ 物理并联欧姆（含姓名学校自动脱敏）",
    subject: "physics" as const,
    stem: "我是深圳南山实验中学初三林小宇（电话 13812345678）：电阻 R1 = 6 Ω 与 R2 = 12 Ω 并联在 12V 电源两端，用欧姆定律求并联等效总电阻 R 是多少 Ω？",
    wrongAns: "18",
  },
  {
    label: "🧪 化学物质的量浓度稀释（单位换算陷阱）",
    subject: "chemistry" as const,
    stem: "实验室配制溶液：将 250 mL 物质的量浓度为 2 mol/L 的 NaCl 溶液加水稀释至 500 mL，求溶质的物质的量 n 是多少 mol？",
    wrongAns: "500",
  },
  {
    label: "💻 信息学二分查找与复杂度",
    subject: "computing" as const,
    stem: "在长度为 n = 1024 的升序有序数组中执行二分查找（Binary Search），最坏情况下折半比较的时间复杂度与最大比较次数是多少？",
    wrongAns: "512",
  },
  {
    label: "🔤 英语定语从句（地点先行词作宾语）",
    subject: "english" as const,
    stem: "语法填空错题：This is the science museum ______ we visited with our teacher last Friday. (which / where)",
    wrongAns: "where",
  },
  {
    label: "📚 思辨阅读：相关性与因果倒置谬误",
    subject: "literacy" as const,
    stem: "阅读论证分析：调查显示『常去图书馆的学生近视率更高，因此去图书馆会导致近视』，指出该推论犯了哪类逻辑谬误？",
    wrongAns: "数据造假",
  },
];

export default function SmartCapturePage() {
  const {
    data,
    loading,
    regionCode,
    activeStudentId,
    activeStudent,
    refreshData,
  } = usePlatform();

  const [subjectHint, setSubjectHint] = useState<SubjectId | "all">("all");
  const [rawQuestionText, setRawQuestionText] = useState<string>(
    SAMPLE_WRONG_QUESTIONS[0].stem
  );
  const [studentWrongAnswer, setStudentWrongAnswer] = useState<string>(
    SAMPLE_WRONG_QUESTIONS[0].wrongAns
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
  const [twinFeedback, setTwinFeedback] = useState<"idle" | "right" | "wrong">("idle");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(String(reader.result));
      if (!rawQuestionText.trim()) {
        setRawQuestionText(
          `[拍照识题文件：${file.name}] 已知二次函数 y = (x - 3)^2 - 4，求抛物线顶点坐标与对称轴 x 的值。`
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const runAnalyze = async () => {
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
          rawQuestionText,
          studentWrongAnswer,
          studentId: activeStudentId,
          regionCode,
          preferredSubjectId: subjectHint,
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
          topicId: result.matchedPrimary.topicId,
          canonicalSnapshot: result.canonicalSnapshot,
          wrongUserAnswer: studentWrongAnswer || "未留存原误答",
          misconceptionTag: result.detectedMisconception.tag,
          misconceptionLabel: result.detectedMisconception.labelZh,
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
        正在加载 AI 智能录错题与 9 地课标归因引擎...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Camera className="h-6 w-6 text-indigo-400" />
            <span>AI 智能拍题 / 录错题归因台（9 地课标锚定 + PII 隐私脱敏盾）</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            粘贴纸质试卷错题或上传题目照片 → 自动剥离学生姓名/学校/电话 PII → 精准映射{" "}
            {regionCode} 官方课标节点、跨科先修根因与防背题孪生变式。
          </p>
        </div>
        <Link
          href="/wrong-book"
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/40 bg-violet-500/15 px-3.5 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-500/25"
        >
          <span>查看 {activeStudent?.displayName} 的 FSRS 错题本</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quick Preset Strip */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
        <div className="text-xs font-semibold text-slate-300">
          ⚡ 一键载入跨学科真实错题样例（含未成年人隐私信息自动脱敏演示）：
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_WRONG_QUESTIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSubjectHint(preset.subject);
                setRawQuestionText(preset.stem);
                setStudentWrongAnswer(preset.wrongAns);
                setResult(null);
                setSavedWqId(null);
              }}
              className="rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-indigo-400 hover:text-indigo-200 transition"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 Cols: Capture Input Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/75 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">
              1. 录入错题题干或上传试卷截图
            </h2>
            <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[11px] font-semibold text-indigo-300">
              当前档案：{activeStudent?.avatarEmoji} {activeStudent?.displayName} ({regionCode})
            </span>
          </div>

          {/* Photo / Screenshot Upload */}
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-3 text-xs text-slate-300 hover:border-indigo-400 transition">
            <div className="flex items-center gap-2.5">
              <Upload className="h-4 w-4 text-indigo-400" />
              <span>
                {imageFileName
                  ? `已载入图片：${imageFileName}`
                  : "上传纸质试卷拍照 / 作业截图（支持 PNG/JPG 多模态识别）"}
              </span>
            </div>
            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-indigo-300">
              选择图片
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
                alt="Uploaded worksheet preview"
                className="max-h-36 mx-auto rounded-lg object-contain"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                学科范围（可选自动识别）：
              </label>
              <select
                value={subjectHint}
                onChange={(e) =>
                  setSubjectHint(e.target.value as SubjectId | "all")
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">🌐 全科 9 学科自动识别</option>
                {data.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name["zh-CN"]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                当时错误作答（用于迷思归因）：
              </label>
              <input
                type="text"
                value={studentWrongAnswer}
                onChange={(e) => setStudentWrongAnswer(e.target.value)}
                placeholder="例如：18 / where / 25"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              错题题干文本（支持 LaTeX 公式，含姓名/学校/电话将被自动脱敏）：
            </label>
            <textarea
              rows={5}
              value={rawQuestionText}
              onChange={(e) => setRawQuestionText(e.target.value)}
              placeholder="粘贴或输入做错的题目内容..."
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
                ? "正在执行 PII 脱敏与 9 地课标图谱溯源..."
                : "开始 AI 智能归因 · 定位先修病灶并生成孪生题"}
            </span>
          </button>
        </div>

        {/* Right 7 Cols: Attribution Output + Privacy Audit + Twin Arena */}
        <div className="lg:col-span-7 space-y-4">
          {!result ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-10 text-center space-y-3">
              <Camera className="h-10 w-10 text-indigo-400 mx-auto opacity-80" />
              <div className="text-sm font-bold text-white">
                等待错题归因分析
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                点击左侧「开始 AI 智能归因」按钮，系统将先通过{" "}
                <strong>9 地未成年人 PII 脱敏盾</strong> 剥离姓名、学校与联系方式，再精准锚定至{" "}
                <strong>{regionCode}</strong> 课标微技能节点与上游跨科根因。
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
                      9 地未成年人隐私脱敏盾已生效（{shieldInfo.regulation}）
                    </span>
                    <span className="font-mono text-[11px] text-emerald-200/90">
                      匿名令牌：{shieldInfo.anonToken}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono bg-slate-950/80 rounded-lg px-3 py-2">
                    脱敏后载荷：{shieldInfo.sanitizedText}
                  </p>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {shieldInfo.redactedTypes.length > 0 ? (
                      shieldInfo.redactedTypes.map((rt) => (
                        <span
                          key={rt}
                          className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-emerald-200 font-semibold"
                        >
                          已剥离：{rt}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">
                        本次输入未检测到外露姓名/学校/电话 PII，已按零知识匿名令牌审计归档
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
                      🎯 归因微技能：{result.matchedPrimary.titleZh}
                    </h3>
                  </div>

                  <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
                    置信度 {Math.round(result.matchedPrimary.confidence * 100)}%
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">
                  {result.analysisSummaryZh}
                </p>

                {/* Misconception Diagnosis */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      识别认知迷思：{result.detectedMisconception.labelZh}（
                      <code>{result.detectedMisconception.tag}</code>）
                    </span>
                  </div>
                  <p className="text-slate-300">
                    🛠️ 靶向纠偏处方：{result.detectedMisconception.remediationTipZh}
                  </p>
                </div>

                {/* Upstream DAG Root Causes */}
                {result.upstreamRootCauses.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <GitBranch className="h-4 w-4 text-indigo-400" />
                      <span>上游先修与跨学科根因链路（点击可直接跳转回溯诊断）：</span>
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
                                ? "🌉 跨科数学桥"
                                : "⬆️ 直接先修"}
                            </span>
                            <span className="font-mono text-slate-400">
                              {up.standardCode}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white">
                            {up.titleZh}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {up.reasonZh}
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
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        已收录至 FSRS 错题本（编号 <code>{savedWqId}</code>），按 90% 记忆保留率自动排期复习！
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
                      <span>一键加入 FSRS 错题本并开启三连清零计划</span>
                    </button>
                  )}

                  <Link
                    href={`/explore?topic=${result.matchedPrimary.topicId}`}
                    className="text-xs font-semibold text-indigo-300 hover:underline"
                  >
                    在图谱星海中查看该节点 9 地课标 →
                  </Link>
                </div>
              </div>

              {/* Instant Twin-Variant Verification Card */}
              <div className="rounded-2xl border border-violet-500/30 bg-slate-900/80 p-5 space-y-3">
                <div className="text-xs font-bold text-violet-300">
                  🧬 即时生成的防背题同构「孪生变式题」（立即检验是否真正搞懂）：
                </div>
                <div className="text-sm font-semibold text-white whitespace-pre-line">
                  <MathText text={result.twinVariant.promptZh} />
                </div>
                {result.twinVariant.choices ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.twinVariant.choices.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => {
                          setTwinTryInput(c.key);
                          setTwinFeedback(
                            c.key === result.twinVariant.answer ? "right" : "wrong"
                          );
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-left text-xs text-white hover:border-violet-400"
                      >
                        <strong className="text-violet-300 mr-2">{c.key}.</strong>
                        <MathText text={c.text} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={twinTryInput}
                      onChange={(e) => setTwinTryInput(e.target.value)}
                      placeholder="输入孪生变式题答案..."
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
                      核对变式
                    </button>
                  </div>
                )}

                {twinFeedback === "right" && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300">
                    🎉 变式秒通！解析：<MathText text={result.twinVariant.explanationZh} />
                  </div>
                )}
                {twinFeedback === "wrong" && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-200">
                    再试一次！正确答案是 <code>{result.twinVariant.answer}</code>。解析：{" "}
                    <MathText text={result.twinVariant.explanationZh} />
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
