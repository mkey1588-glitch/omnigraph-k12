"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft, Eye, EyeOff, RefreshCw } from "lucide-react";
import { usePlatform } from "@/components/PlatformProvider";
import type { GeneratedQuestionInstance } from "@/types/taxonomy";

function PrintableWorksheetContent() {
  const searchParams = useSearchParams();
  const { data, loading, regionCode, activeStudentId, getAlignment } =
    usePlatform();

  const targetStudentId = searchParams.get("studentId") || activeStudentId;
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [seedTick, setSeedTick] = useState(1);
  const [twinItems, setTwinItems] = useState<
    Array<{
      topicId: string;
      misconceptionLabel: string | null;
      instance: GeneratedQuestionInstance;
    }>
  >([]);

  const student = data?.users.find((u) => u.id === targetStudentId);

  useEffect(() => {
    if (!data) return;
    const wqs = data.wrongQuestions.filter(
      (w) => w.studentId === targetStudentId && w.status !== "cleared"
    );

    let cancelled = false;
    async function loadFreshTwins() {
      const generated: Array<{
        topicId: string;
        misconceptionLabel: string | null;
        instance: GeneratedQuestionInstance;
      }> = [];

      for (let i = 0; i < wqs.length; i++) {
        const wq = wqs[i];
        const res = await fetch("/api/diagnose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "preview_question",
            topicId: wq.topicId,
            difficulty: "standard",
            regionCode,
            seed: `print_${targetStudentId}_${seedTick}_${i}`,
            variantIndex: seedTick + i,
          }),
        });
        const json = await res.json();
        if (json.ok) {
          generated.push({
            topicId: wq.topicId,
            misconceptionLabel: wq.misconceptionLabel,
            instance: json.instance as GeneratedQuestionInstance,
          });
        }
      }
      if (!cancelled) {
        setTwinItems(generated);
      }
    }

    void loadFreshTwins();
    return () => {
      cancelled = true;
    };
  }, [data, targetStudentId, regionCode, seedTick]);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400">
        正在排版 A4 双语防背题错题重练卷...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      {/* Screen-only Action Bar (hidden during @media print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <Link
          href="/parent"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回家长伴学空间</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSeedTick((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-indigo-300 hover:border-indigo-400"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>换一套全新孪生数字</span>
          </button>

          <button
            onClick={() => setShowAnswerKey((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200"
          >
            {showAnswerKey ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> 隐藏家长答案附页
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> 显示家长答案附页
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>打印 / 导出 PDF (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable A4 Sheet */}
      <div className="print-sheet rounded-2xl border border-slate-700 bg-white p-8 text-slate-900 shadow-2xl space-y-6">
        <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              OmniGraph K12 · Personalized Twin-Variant Redo Worksheet
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
              靶向错题孪生变式重练卷（中英双语对照）
            </h1>
          </div>
          <div className="text-right text-xs text-slate-600 space-y-0.5">
            <div>
              <strong>学生姓名：</strong>
              {student?.displayName} ({regionCode} 课标)
            </div>
            <div>
              <strong>建议用时：</strong>15 分钟 · 写出关键推导步骤
            </div>
          </div>
        </div>

        {twinItems.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">
            当前学生暂无待清零错题！
          </p>
        ) : (
          <div className="space-y-5">
            {twinItems.map((item, idx) => {
              const topic = data.topics.find((t) => t.id === item.topicId);
              const aln = getAlignment(item.topicId);
              return (
                <div
                  key={`${item.instance.instanceId}_${idx}`}
                  className="print-card rounded-xl border border-slate-300 p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
                    <span className="font-bold text-slate-900">
                      第 {idx + 1} 题 · {topic?.title["zh-CN"]} (
                      {aln?.standardCode})
                    </span>
                    {item.misconceptionLabel && (
                      <span className="text-amber-800">
                        ⚠️ 防错提醒：{item.misconceptionLabel}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 whitespace-pre-line">
                    {item.instance.promptZh}
                  </p>
                  <p className="text-xs text-slate-600 whitespace-pre-line">
                    {item.instance.promptEn}
                  </p>

                  {item.instance.svgDiagram && (
                    <div
                      className="py-2 text-slate-900 max-w-xs"
                      dangerouslySetInnerHTML={{
                        __html: item.instance.svgDiagram,
                      }}
                    />
                  )}

                  {/* Blank Workspace Box for Handwriting */}
                  <div className="mt-2 h-20 rounded-lg border border-dashed border-slate-300 p-2 text-[11px] text-slate-400">
                    手写分步推导区 / Show your step-by-step working here:
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Toggleable Parent Answer Key */}
        {showAnswerKey && twinItems.length > 0 && (
          <div className="border-t-2 border-dashed border-slate-400 pt-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              🔑 家长核对参考答案与分步解析附页（可沿虚线折叠）
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              {twinItems.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  <strong>
                    第 {idx + 1} 题答案：{item.instance.answer}{" "}
                    {item.instance.unit ?? ""}
                  </strong>{" "}
                  — {item.instance.explanationZh}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentPrintPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">生成打印卷中...</div>
      }
    >
      <PrintableWorksheetContent />
    </Suspense>
  );
}
