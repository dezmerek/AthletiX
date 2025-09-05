"use client";

import React from "react";

type Series = {
  labels: string[];
  data: number[];
  color: string;
  title: string;
};

export default function ForecastModal({
  open,
  onClose,
  revenue,
  members,
}: {
  open: boolean;
  onClose: () => void;
  revenue?: Series | null;
  members?: Series | null;
}) {
  if (!open) return null;

  const computeLinearForecast = (values: number[], horizon: number) => {
    const n = values.length;
    if (n === 0) return { forecast: Array(horizon).fill(0), slope: 0 };
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - meanX) * (values[i] - meanY);
      den += (x[i] - meanX) * (x[i] - meanX);
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = meanY - slope * meanX;
    const forecast = Array.from({ length: horizon }, (_, k) => {
      const xi = n + (k + 1);
      return intercept + slope * xi;
    });
    return { forecast, slope };
  };

  const buildChart = (history: number[], forecast: number[], color: string) => {
    const width = 560;
    const height = 160;
    const padding = 28;
    const innerW = width - padding * 2;
    const innerH = height - padding * 2;
    const all = [...history, ...forecast];
    const max = Math.max(1, ...all);
    const min = Math.min(0, ...all);
    const range = Math.max(1, max - min);
    const toX = (i: number, total: number) =>
      padding + (i / Math.max(1, total - 1)) * innerW;
    const toY = (v: number) => padding + innerH - ((v - min) / range) * innerH;

    const histPts = history
      .map(
        (v, i) => `${i === 0 ? "M" : "L"} ${toX(i, history.length)} ${toY(v)}`
      )
      .join(" ");
    const base = history.length - 1;
    const fcPts = forecast
      .map(
        (v, k) =>
          `${k === 0 ? "M" : "L"} ${toX(
            base + k,
            base + forecast.length
          )} ${toY(v)}`
      )
      .join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          className="fill-slate-50 dark:fill-slate-700/40 rounded-lg"
          rx={10}
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#cbd5e1"
        />
        <path d={histPts} fill="none" stroke={color} strokeWidth={2.5} />
        <path
          d={fcPts}
          fill="none"
          stroke={color}
          strokeOpacity={0.6}
          strokeDasharray="6 6"
          strokeWidth={2}
        />
      </svg>
    );
  };

  const renderBlock = (series?: Series | null) => {
    if (!series) return null;
    const { forecast, slope } = computeLinearForecast(series.data, 3);
    const last = series.data[series.data.length - 1] ?? 0;
    const change = forecast[forecast.length - 1] - last;
    const sign = change === 0 ? "" : change > 0 ? "+" : "";
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {series.title}
          </h4>
          <span
            className={`text-xs font-medium ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {sign}
            {Math.round(change)}{" "}
            {series.title.includes("członk") ? "os." : "PLN"}
          </span>
        </div>
        {buildChart(series.data, forecast, series.color)}
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left pr-4 py-1">Okres</th>
                <th className="text-right py-1">Prognoza</th>
              </tr>
            </thead>
            <tbody>
              {forecast.map((v, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <td className="pr-4 py-1">Następny {i + 1}</td>
                  <td className="py-1 text-right">
                    {series.title.includes("PLN")
                      ? new Intl.NumberFormat("pl-PL").format(Math.round(v)) +
                        " PLN"
                      : Math.round(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Prognozy
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Zamknij
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderBlock(revenue)}
          {renderBlock(members)}
        </div>
      </div>
    </div>
  );
}
