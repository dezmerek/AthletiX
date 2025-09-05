"use client";

import { useState } from "react";

export default function MiniLineChart({
  labels,
  data,
  color = "#10b981",
  label,
  yUnit,
  formatValue,
  showGrid = true,
}: {
  labels: string[];
  data: number[];
  color?: string;
  label?: string;
  yUnit?: string;
  formatValue?: (v: number) => string;
  showGrid?: boolean;
}) {
  const width = 700;
  const height = 256;
  const padding = 32;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = Math.max(1, max - min);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const getXY = (v: number, i: number) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padding + innerH - ((v - min) / range) * innerH;
    return { x, y };
  };

  const handleMove = (e: any) => {
    const rect = (e.target as SVGRectElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const rel = Math.min(Math.max(x - padding, 0), innerW) / innerW;
    const idx = Math.round(rel * Math.max(1, data.length - 1));
    setHoverIdx(idx);
  };

  const handleLeave = () => setHoverIdx(null);

  const points = data.map((v, i) => {
    const { x, y } = getXY(v, i);
    return `${x},${y}`;
  });

  const hover =
    hoverIdx != null
      ? {
          idx: hoverIdx,
          label: labels[hoverIdx] ?? "",
          value: data[hoverIdx] ?? 0,
          ...getXY(data[hoverIdx] ?? 0, hoverIdx),
        }
      : null;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64">
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        className="fill-slate-50 dark:fill-slate-700/50 rounded-lg"
        rx={12}
      />
      {label && (
        <text
          x={padding}
          y={22}
          className="fill-slate-700 dark:fill-slate-200"
          fontSize="12"
          fontWeight="600"
        >
          {label}
        </text>
      )}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="#94a3b8"
        strokeOpacity={0.4}
      />
      <line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="#94a3b8"
        strokeOpacity={0.4}
      />
      {showGrid &&
        Array.from({ length: 5 }).map((_, i) => {
          const t = i / 4;
          const y = padding + t * innerH;
          const value = max - t * range;
          const label = Math.round(value).toLocaleString("pl-PL");
          return (
            <g key={`y-${i}`}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#cbd5e1"
                strokeOpacity={0.25}
              />
              <line
                x1={padding - 4}
                y1={y}
                x2={padding}
                y2={y}
                stroke="#94a3b8"
                strokeOpacity={0.6}
              />
              <text
                x={padding - 8}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                className="fill-slate-500"
              >
                {label}
              </text>
            </g>
          );
        })}
      {yUnit && (
        <text
          x={padding - 24}
          y={padding - 8}
          className="fill-slate-500"
          fontSize="10"
          textAnchor="start"
        >
          {yUnit}
        </text>
      )}
      {labels.map((l, i) => {
        const x = padding + (i / Math.max(1, labels.length - 1)) * innerW;
        const show =
          labels.length <= 12 || i % Math.ceil(labels.length / 12) === 0;
        return show ? (
          <text
            key={i}
            x={x}
            y={height - padding + 16}
            textAnchor="middle"
            fontSize="10"
            className="fill-slate-500"
          >
            {l}
          </text>
        ) : null;
      })}
      {points.length > 1 && (
        <polyline
          fill="none"
          stroke={color}
          strokeWidth={3}
          points={points.join(" ")}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      <rect
        x={padding}
        y={padding}
        width={innerW}
        height={innerH}
        fill="transparent"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      />
      {hover && (
        <g>
          <line
            x1={hover.x}
            y1={padding}
            x2={hover.x}
            y2={height - padding}
            stroke={color}
            strokeOpacity={0.4}
          />
          <circle cx={hover.x} cy={hover.y} r={4} fill={color} />
          <g>
            <rect
              x={Math.min(hover.x + 8, width - 140)}
              y={Math.max(hover.y - 30, padding)}
              width={132}
              height={36}
              rx={6}
              className="fill-white dark:fill-slate-800"
              stroke="#94a3b8"
              strokeOpacity={0.4}
            />
            <text
              x={Math.min(hover.x + 16, width - 132)}
              y={Math.max(hover.y - 16, padding + 12)}
              className="fill-slate-500"
              fontSize="10"
            >
              {hover.label}
            </text>
            <text
              x={Math.min(hover.x + 16, width - 132)}
              y={Math.max(hover.y, padding + 24)}
              className="fill-slate-900 dark:fill-slate-100"
              fontSize="12"
              fontWeight="600"
            >
              {formatValue ? formatValue(hover.value) : String(hover.value)}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
