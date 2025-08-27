"use client";

import { useTranslations } from "next-intl";

interface MacroDistributionProps {
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function MacroDistribution({
  dailyTotals,
}: MacroDistributionProps) {
  const t = useTranslations("nutrition");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        {t("progress.macroDistribution")}
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            {t("nutrition.protein")}
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {Math.round(dailyTotals.protein)}
            {t("units.g")} (
            {Math.round(
              ((dailyTotals.protein * 4) / dailyTotals.calories) * 100 || 0
            )}
            %)
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            {t("nutrition.carbs")}
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {Math.round(dailyTotals.carbs)}
            {t("units.g")} (
            {Math.round(
              ((dailyTotals.carbs * 4) / dailyTotals.calories) * 100 || 0
            )}
            %)
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            {t("nutrition.fats")}
          </span>
          <span className="font-medium text-slate-900 dark:text-white">
            {Math.round(dailyTotals.fats)}
            {t("units.g")} (
            {Math.round(
              ((dailyTotals.fats * 9) / dailyTotals.calories) * 100 || 0
            )}
            %)
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-red-500 transition-all duration-500"
              style={{
                width: `${
                  ((dailyTotals.protein * 4) / dailyTotals.calories) * 100 || 0
                }%`,
              }}
            />
            <div
              className="bg-green-500 transition-all duration-500"
              style={{
                width: `${
                  ((dailyTotals.carbs * 4) / dailyTotals.calories) * 100 || 0
                }%`,
              }}
            />
            <div
              className="bg-yellow-500 transition-all duration-500"
              style={{
                width: `${
                  ((dailyTotals.fats * 9) / dailyTotals.calories) * 100 || 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
