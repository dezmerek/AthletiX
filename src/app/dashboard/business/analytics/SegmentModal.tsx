"use client";

import React, { useMemo } from "react";

type Performer = {
  id?: string;
  name: string;
  revenue: number;
  members?: number;
};

type Segment = {
  key: "Platinum" | "Gold" | "Silver" | "Bronze";
  color: string;
  items: Performer[];
  total: number;
  share: number; // 0..1
};

export default function SegmentModal({
  open,
  onClose,
  performers,
}: {
  open: boolean;
  onClose: () => void;
  performers: Performer[];
}) {
  const segments = useMemo<Segment[]>(() => {
    const list = [...(performers || [])].sort(
      (a, b) => (b.revenue || 0) - (a.revenue || 0)
    );
    const totalRevenue = list.reduce((s, p) => s + (p.revenue || 0), 0) || 1;
    const n = list.length;
    if (n === 0) return [] as Segment[];

    // Wyznacz rozkład na 4 koszyki z zachowaniem minimum 1 gdy to możliwe
    let sizes: number[];
    if (n < 4) {
      const first = Math.ceil(n / 2);
      sizes = [first, n - first, 0, 0];
    } else {
      const base = Math.floor(n / 4);
      const rem = n % 4;
      sizes = [base, base, base, base];
      for (let i = 0; i < rem; i++) sizes[i] += 1;
    }

    const ranges: [number, number][] = [];
    let start = 0;
    for (const sz of sizes) {
      const end = start + sz;
      ranges.push([start, end]);
      start = end;
    }

    const defs: Array<{ key: Segment["key"]; color: string }> = [
      { key: "Platinum", color: "#0ea5e9" },
      { key: "Gold", color: "#f59e0b" },
      { key: "Silver", color: "#94a3b8" },
      { key: "Bronze", color: "#b45309" },
    ];

    const slices = defs.map((d, i) => ({
      key: d.key,
      color: d.color,
      items: list.slice(ranges[i][0], ranges[i][1]),
    }));

    return slices
      .filter((s) => s.items.length > 0)
      .map((s) => {
        const segTotal = s.items.reduce(
          (acc, it) => acc + (it.revenue || 0),
          0
        );
        return {
          key: s.key,
          color: s.color,
          items: s.items,
          total: segTotal,
          share: segTotal / totalRevenue,
        };
      });
  }, [performers]);

  if (!open) return null;

  const total = performers.reduce((s, p) => s + (p.revenue || 0), 0) || 1;

  const Bar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded">
      <div
        className="h-2 rounded"
        style={{
          width: `${Math.max(2, Math.min(100, Math.round(value * 100)))}%`,
          background: color,
        }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Segmentacja klientów
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Zamknij
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {segments.map((s) => (
              <div
                key={s.key}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {s.key === "Platinum" ? "Pro" : "Klient"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {Math.round(s.share * 100)}%
                  </span>
                </div>
                <Bar value={s.share} color={s.color} />
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    Przychody:{" "}
                    {new Intl.NumberFormat("pl-PL").format(Math.round(s.total))}{" "}
                    PLN
                  </div>
                  <div>Liczba klientów: {s.items.length}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Klienci wg segmentów
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nazwa
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Przychody
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Członkowie
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {segments.flatMap((s) =>
                    s.items.slice(0, 10).map((p) => (
                      <tr key={`${s.key}-${p.name}`}>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center">
                            <span
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ background: s.color }}
                            />
                            {s.key === "Platinum" ? "Pro" : "Klient"}
                          </span>
                        </td>
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="px-4 py-2">
                          {new Intl.NumberFormat("pl-PL").format(
                            Math.round(p.revenue || 0)
                          )}{" "}
                          PLN
                        </td>
                        <td className="px-4 py-2">{p.members ?? "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
