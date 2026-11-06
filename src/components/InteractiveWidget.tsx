"use client";

import React, { useState } from "react";
import type { InteractiveWidgetConfig } from "@/types/taxonomy";

interface InteractiveWidgetProps {
  config: InteractiveWidgetConfig;
  onSelectValue?: (val: string) => void;
}

export function InteractiveWidget({
  config,
  onSelectValue,
}: InteractiveWidgetProps) {
  const [val, setVal] = useState<number>(config.initialValue);

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
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-indigo-300">
            🎛️ 交互数轴探针：{config.captionZh}
          </span>
          <span className="font-mono text-emerald-300 font-bold">
            当前位置 = {val} {config.unitLabel ?? ""}
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
        <div className="flex items-center justify-between">
          <span className="font-semibold text-amber-300">
            ⚡ 虚拟电学并联实验台：{config.captionZh}
          </span>
          <span className="font-mono text-emerald-300 font-bold">
            固定 R₁={rFixed}Ω ∥ 滑动变阻 R₂={val}Ω → 等效总电阻 R_eq = {rEq}Ω
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
        {onSelectValue && (
          <button
            type="button"
            onClick={() => onSelectValue(String(rEq))}
            className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/30"
          >
            将当前实验读数 {rEq} Ω 填入答案框
          </button>
        )}
      </div>
    );
  }

  // function_probe: y = a(x - h)^2 + k explorer
  const hFixed = config.fixedParamA ?? 3;
  const kFixed = config.fixedParamB ?? -2;
  const yAtVal = (val - hFixed) * (val - hFixed) + kFixed;
  return (
    <div className="rounded-xl border border-violet-500/30 bg-slate-950/80 p-4 space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-violet-300">
          📈 函数动态探针：{config.captionZh}
        </span>
        <span className="font-mono text-emerald-300 font-bold">
          当 x = {val} 时，y = {yAtVal}
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
      {onSelectValue && (
        <button
          type="button"
          onClick={() => onSelectValue(String(val))}
          className="rounded-lg bg-violet-500/20 border border-violet-500/40 px-2.5 py-1 text-[11px] font-semibold text-violet-200 hover:bg-violet-500/30"
        >
          锁定对称轴 x = {val} 填入答案框
        </button>
      )}
    </div>
  );
}
