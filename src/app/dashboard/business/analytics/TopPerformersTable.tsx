"use client";

import React from "react";

type Performer = {
  id: string;
  name: string;
  revenue: number;
  members?: number;
  growth?: number;
  status?: "growing" | "stable" | "declining";
};

export default function TopPerformersTable({
  performers,
  formatCurrency,
  getGrowthIcon,
  getGrowthColor,
  formatPercentage,
  getStatusBadge,
}: {
  performers: Performer[];
  formatCurrency: (v: number) => string;
  getGrowthIcon: (v?: number | null) => React.ReactNode;
  getGrowthColor: (v?: number | null) => string;
  formatPercentage: (v?: number | null) => string;
  getStatusBadge: (s?: Performer["status"]) => React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Najlepsi wykonawcy
        </h2>
        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
          Zobacz wszystkie
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Nazwa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Przychody
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Członkowie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Wzrost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {performers.map((performer) => (
              <tr
                key={performer.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {performer.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                  {formatCurrency(performer.revenue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {performer.members}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getGrowthIcon(performer.growth)}
                    <span
                      className={`text-sm font-medium ml-1 ${getGrowthColor(
                        performer.growth
                      )}`}
                    >
                      {formatPercentage(performer.growth)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(performer.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {performers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            Brak danych o wykonawcach
          </p>
        </div>
      )}
    </div>
  );
}
