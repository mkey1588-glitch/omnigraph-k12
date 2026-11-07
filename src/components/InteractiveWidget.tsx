"use client";

import React, { useEffect, useState } from "react";
import type { InteractiveWidgetConfig } from "@/types/taxonomy";
import { usePlatform } from "./PlatformProvider";
import { localizeWidgetCaption } from "@/lib/i18n";
import { WIDGET_COPY } from "@/lib/i18n/ui-common";

interface InteractiveWidgetProps {
  config: InteractiveWidgetConfig;
  onSelectValue?: (val: string) => void;
}

export function InteractiveWidget({
  config,
  onSelectValue,
}: InteractiveWidgetProps) {
  const { locale, pick } = usePlatform();
  const [val, setVal] = useState<number>(config.initialValue);

  useEffect(() => {
    setVal(config.initialValue);
  }, [
    config.kind,
    config.initialValue,
    config.min,
    config.max,
    config.fixedParamA,
    config.fixedParamB,
    config.fixedParamC,
  ]);

  const caption = localizeWidgetCaption(config, locale);

  const handleChange = (next: number) => {
    setVal(next);
    if (config.bindToAnswer && onSelectValue) {
      onSelectValue(String(next));
    }
  };

  if (config.kind === "number_line_slider") {
    const span = config.max - config.min || 1;
    const pct = ((val - config.min) / span) * 240 + 30;
    const zeroX = ((0 - config.min) / span) * 240 + 30;
    return (
      <div className="rounded-xl border border-indigo-500/30 bg-slate-950/80 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="font-semibold text-indigo-300">
            {pick(WIDGET_COPY.numberLineTitle)}
            {caption}
          </span>
          <span className="font-mono text-emerald-300 font-bold">
            {pick(WIDGET_COPY.currentPos)} {val} {config.unitLabel ?? ""}
          </span>
        </div>
        <svg viewBox="0 0 300 58" className="w-full max-w-md mx-auto h-auto">
          <line x1="25" y1="30" x2="275" y2="30" stroke="#64748b" strokeWidth="2" />
          <line x1={zeroX} y1="20" x2={zeroX} y2="40" stroke="#94a3b8" strokeWidth="2" />
          <text x={zeroX} y="52" textAnchor="middle" fontSize="10" fill="#94a3b8">
            0
          </text>
          <circle cx={pct} cy="30" r="7" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
          <text x={pct} y="15" textAnchor="middle" fontSize="11" fill="#a5b4fc" fontWeight="700">
            {val}
          </text>
        </svg>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={val}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full accent-indigo-500 cursor-pointer"
        />
      </div>
    );
  }

  if (config.kind === "ohm_parallel_lab") {
    const rFixed = config.fixedParamA ?? 6;
    const rEq = Math.round(((rFixed * val) / (rFixed + val)) * 100) / 100;
    return (
      <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-amber-300">
            {pick(WIDGET_COPY.ohmLabTitle)}
            {caption}
          </span>
          <span className="font-mono text-emerald-300 font-bold">
            {WIDGET_COPY.ohmReadout(rFixed, val, rEq, locale)}
          </span>
        </div>
        <input
          type="range"
          min={config.min}
          max={config.max}
          step={config.step}
          value={val}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>
    );
  }

  // function_probe: y = a(x - h)^2 + k explorer (supports leading coefficient `a = fixedParamC ?? 1`)
  const hFixed = config.fixedParamA ?? 3;
  const kFixed = config.fixedParamB ?? -2;
  const aFixed = config.fixedParamC ?? 1;
  const yAtVal =
    Math.round((aFixed * (val - hFixed) * (val - hFixed) + kFixed) * 100) / 100;
  return (
    <div className="rounded-xl border border-violet-500/30 bg-slate-950/80 p-4 space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-violet-300">
          {pick(WIDGET_COPY.funcProbeTitle)}
          {caption}
        </span>
        <span className="font-mono text-emerald-300 font-bold">
          {WIDGET_COPY.funcReadout(val, yAtVal, locale)}
        </span>
      </div>
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={val}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full accent-violet-500 cursor-pointer"
      />
      {config.bindToAnswer && onSelectValue && (
        <button
          type="button"
          onClick={() => onSelectValue(String(val))}
          className="rounded-lg bg-violet-500/20 border border-violet-500/40 px-2.5 py-1 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/30"
        >
          {WIDGET_COPY.funcFillBtn(val, locale)}
        </button>
      )}
    </div>
  );
}
