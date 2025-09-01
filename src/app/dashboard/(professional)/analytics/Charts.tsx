"use client";

import { useTranslations } from "next-intl";
import { MonthlyStats } from "./types";
import { formatCurrency } from "./utils";

export default function Charts({ stats }: { stats: MonthlyStats[] }) {
  const t = useTranslations("analytics");
  const lastSix = stats.slice(-6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Monthly Progress Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("charts.monthlyProgress")}
        </h3>
        <div className="space-y-4">
          {lastSix.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                {stat.month}
              </span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stat.avgProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white w-16 text-right">
                {stat.avgProgress}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          {t("charts.monthlyRevenue")}
        </h3>
        <div className="space-y-4">
          {lastSix.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400 w-12">
                {stat.month}
              </span>
              <div className="flex-1 mx-4">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stat.revenue / 2500) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white w-20 text-right">
                {formatCurrency(stat.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
