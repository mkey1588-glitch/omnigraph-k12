"use client";

import React, { useMemo, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { MasteryStatus, RegionalAlignmentRecord } from "@/types/taxonomy";
import type { TopicSeedDefinition } from "@/data/canonical-topics-math";
import type { EdgeSeedDefinition } from "@/data/canonical-graph";
import { usePlatform, type StudentTopicStateRecord } from "./PlatformProvider";
import {
  CANVAS_COPY,
  getMasteryStatusLabel,
  getSubjectShortBadge,
} from "@/lib/i18n/ui-common";

interface KnowledgeGraphCanvasProps {
  topics: TopicSeedDefinition[];
  edges: EdgeSeedDefinition[];
  selectedTopicId: string;
  onSelectTopic: (id: string) => void;
  getAlignment: (topicId: string) => RegionalAlignmentRecord | undefined;
  getStudentState: (topicId: string) => StudentTopicStateRecord | undefined;
}

const STATUS_PALETTE: Record<
  MasteryStatus,
  { fill: string; stroke: string }
> = {
  mastered: { fill: "#064e3b", stroke: "#10b981" },
  inferred_mastered: { fill: "#0f3f3c", stroke: "#2dd4bf" },
  shaky: { fill: "#451a03", stroke: "#f59e0b" },
  weak: { fill: "#4c0519", stroke: "#f43f5e" },
  untested: { fill: "#0f172a", stroke: "#475569" },
};

export function KnowledgeGraphCanvas({
  topics,
  edges,
  selectedTopicId,
  onSelectTopic,
  getAlignment,
  getStudentState,
}: KnowledgeGraphCanvasProps) {
  const { locale, pick, localizePlain } = usePlatform();
  const [zoom, setZoom] = useState(1);

  const visibleIds = useMemo(() => new Set(topics.map((t) => t.id)), [topics]);
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleIds.has(e.topicId) && visibleIds.has(e.prerequisiteId)
      ),
    [edges, visibleIds]
  );

  const { upstreamSet, downstreamSet } = useMemo(() => {
    const up = new Set<string>();
    const qUp = [selectedTopicId];
    while (qUp.length > 0) {
      const curr = qUp.shift()!;
      for (const e of visibleEdges) {
        if (e.topicId === curr && !up.has(e.prerequisiteId)) {
          up.add(e.prerequisiteId);
          qUp.push(e.prerequisiteId);
        }
      }
    }

    const down = new Set<string>();
    const qDown = [selectedTopicId];
    while (qDown.length > 0) {
      const curr = qDown.shift()!;
      for (const e of visibleEdges) {
        if (e.prerequisiteId === curr && !down.has(e.topicId)) {
          down.add(e.topicId);
          qDown.push(e.topicId);
        }
      }
    }

    return { upstreamSet: up, downstreamSet: down };
  }, [selectedTopicId, visibleEdges]);

  const layout = useMemo(() => {
    const byGrade = new Map<number, TopicSeedDefinition[]>();
    for (const t of topics) {
      const g = getAlignment(t.id)?.localGrade ?? t.baselineGrade;
      if (!byGrade.has(g)) byGrade.set(g, []);
      byGrade.get(g)!.push(t);
    }

    const sortedGrades = [...byGrade.keys()].sort((a, b) => a - b);
    const coords = new Map<string, { x: number; y: number; grade: number }>();

    const colWidth = 235;
    const rowHeight = 98;
    let maxRows = 1;

    sortedGrades.forEach((g, colIdx) => {
      const colTopics = byGrade.get(g)!;
      colTopics.sort((a, b) => {
        if (a.subjectId !== b.subjectId) {
          if (a.subjectId === "math") return -1;
          if (b.subjectId === "math") return 1;
          return a.subjectId.localeCompare(b.subjectId);
        }
        return a.id.localeCompare(b.id);
      });
      maxRows = Math.max(maxRows, colTopics.length);
      colTopics.forEach((t, rowIdx) => {
        coords.set(t.id, {
          x: 40 + colIdx * colWidth,
          y: 56 + rowIdx * rowHeight,
          grade: g,
        });
      });
    });

    return {
      coords,
      sortedGrades,
      width: Math.max(760, 80 + sortedGrades.length * colWidth),
      height: Math.max(460, 90 + maxRows * rowHeight),
      colWidth,
    };
  }, [topics, getAlignment]);

  const nodeW = 192;
  const nodeH = 66;
  const maxChars = locale === "en" || locale === "ms" ? 22 : 13;

  return (
    <div className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden">
      {/* Top Toolbar & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/70 px-4 py-2.5 text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-300">{pick(CANVAS_COPY.legend)}</span>
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{" "}
            {pick(CANVAS_COPY.legendMastered)}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />{" "}
            {pick(CANVAS_COPY.legendShaky)}
          </span>
          <span className="inline-flex items-center gap-1 text-rose-300">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />{" "}
            {pick(CANVAS_COPY.legendWeak)}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-300">{pick(CANVAS_COPY.legendHard)}</span>
          <span className="text-slate-400">{pick(CANVAS_COPY.legendSoft)}</span>
          <span className="text-purple-300 font-semibold">{pick(CANVAS_COPY.legendCross)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.65, Math.round((z - 0.15) * 100) / 100))}
            className="rounded border border-slate-700 bg-slate-900 p-1 text-slate-300 hover:text-white"
            title={pick(CANVAS_COPY.zoomOut)}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="px-1.5 font-mono text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, Math.round((z + 0.15) * 100) / 100))}
            className="rounded border border-slate-700 bg-slate-900 p-1 text-slate-300 hover:text-white"
            title={pick(CANVAS_COPY.zoomIn)}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="rounded border border-slate-700 bg-slate-900 p-1 text-slate-300 hover:text-white"
            title={pick(CANVAS_COPY.zoomReset)}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Interactive SVG Star-Map */}
      <div className="overflow-auto max-h-[620px] p-2">
        <svg
          width={layout.width * zoom}
          height={layout.height * zoom}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="select-none"
        >
          <defs>
            <marker
              id="arrow-hard"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
            <marker
              id="arrow-cross"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
            </marker>
            <marker
              id="arrow-muted"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
            </marker>
          </defs>

          {/* Grade Column Headers */}
          {layout.sortedGrades.map((g, idx) => {
            const xCenter = 40 + idx * layout.colWidth + nodeW / 2;
            return (
              <g key={g}>
                <line
                  x1={xCenter}
                  y1={36}
                  x2={xCenter}
                  y2={layout.height - 20}
                  stroke="#1e293b"
                  strokeDasharray="3 5"
                />
                <rect
                  x={xCenter - 48}
                  y={10}
                  width={96}
                  height={22}
                  rx={11}
                  fill="#0f172a"
                  stroke="#334155"
                />
                <text
                  x={xCenter}
                  y={25}
                  textAnchor="middle"
                  fontSize={11}
                  fill="#94a3b8"
                  fontWeight={600}
                >
                  {CANVAS_COPY.gradeHeader(g, locale)}
                </text>
              </g>
            );
          })}

          {/* Directed Edges: prerequisite -> dependent */}
          {visibleEdges.map((edge) => {
            const src = layout.coords.get(edge.prerequisiteId);
            const dst = layout.coords.get(edge.topicId);
            if (!src || !dst) return null;

            const x1 = src.x + nodeW;
            const y1 = src.y + nodeH / 2;
            const x2 = dst.x;
            const y2 = dst.y + nodeH / 2;
            const dx = Math.max(45, Math.abs(x2 - x1) * 0.45);
            const dPath =
              src.x === dst.x
                ? `M ${src.x + nodeW / 2} ${src.y + nodeH} C ${src.x + nodeW + 36} ${(src.y + dst.y) / 2}, ${dst.x + nodeW + 36} ${(src.y + dst.y) / 2}, ${dst.x + nodeW / 2} ${dst.y}`
                : `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const isRelated =
              edge.topicId === selectedTopicId ||
              edge.prerequisiteId === selectedTopicId ||
              (upstreamSet.has(edge.topicId) && upstreamSet.has(edge.prerequisiteId)) ||
              (downstreamSet.has(edge.topicId) && downstreamSet.has(edge.prerequisiteId));

            const isCross = edge.relationType === "cross_subject";
            const strokeColor = isRelated
              ? isCross
                ? "#c084fc"
                : "#818cf8"
              : isCross
                ? "rgba(192,132,252,0.42)"
                : "rgba(71,85,105,0.45)";

            return (
              <path
                key={`${edge.prerequisiteId}->${edge.topicId}`}
                d={dPath}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isRelated ? 2.5 : 1.4}
                strokeDasharray={edge.relationType === "soft" ? "5 4" : undefined}
                markerEnd={
                  isRelated
                    ? isCross
                      ? "url(#arrow-cross)"
                      : "url(#arrow-hard)"
                    : "url(#arrow-muted)"
                }
              />
            );
          })}

          {/* Topic Nodes */}
          {topics.map((topic) => {
            const pos = layout.coords.get(topic.id);
            if (!pos) return null;

            const st = getStudentState(topic.id);
            const status: MasteryStatus = st?.status ?? "untested";
            const palette = STATUS_PALETTE[status];
            const aln = getAlignment(topic.id);

            const isSelected = topic.id === selectedTopicId;
            const isUpstream = upstreamSet.has(topic.id);
            const isDownstream = downstreamSet.has(topic.id);
            const dimmed =
              Boolean(selectedTopicId) &&
              !isSelected &&
              !isUpstream &&
              !isDownstream;

            const fullTitle = localizePlain(topic.title);
            const shortTitle =
              fullTitle.length > maxChars
                ? `${fullTitle.slice(0, maxChars)}…`
                : fullTitle;

            return (
              <g
                key={topic.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectTopic(topic.id)}
                className="cursor-pointer transition-opacity"
                style={{ opacity: dimmed ? 0.35 : 1 }}
              >
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={12}
                  fill={palette.fill}
                  stroke={
                    isSelected
                      ? "#ffffff"
                      : isUpstream
                        ? "#fbbf24"
                        : isDownstream
                          ? "#38bdf8"
                          : palette.stroke
                  }
                  strokeWidth={isSelected ? 2.8 : isUpstream || isDownstream ? 2.1 : 1.5}
                />

                <text x={10} y={19} fontSize={10} fill="#cbd5e1" fontWeight={600}>
                  {getSubjectShortBadge(topic.subjectId, locale)} ·{" "}
                  {aln?.standardCode.slice(0, 14)}
                </text>

                <text x={10} y={39} fontSize={11.5} fill="#ffffff" fontWeight={700}>
                  {shortTitle}
                </text>

                <text x={10} y={55} fontSize={10} fill={palette.stroke} fontWeight={600}>
                  {getMasteryStatusLabel(status, locale)}
                  {st?.isRootCause ? pick(CANVAS_COPY.rootTag) : ""}
                  {isUpstream ? pick(CANVAS_COPY.upstreamTag) : ""}
                  {isDownstream ? pick(CANVAS_COPY.downstreamTag) : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
