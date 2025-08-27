"use client";

import { useTranslations } from "next-intl";

interface NutritionStatsProps {
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  nutritionGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function NutritionStats({
  dailyTotals,
  nutritionGoals,
}: NutritionStatsProps) {
  const t = useTranslations("nutrition");

  const getProgressBarColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Today's Calories */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t("statistics.todayCalories")}
          </h3>
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {Math.round(dailyTotals.calories)}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          z {nutritionGoals.calories} {t("units.kcal")}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
              dailyTotals.calories,
              nutritionGoals.calories
            )}`}
            style={{
              width: `${Math.min(
                (dailyTotals.calories / nutritionGoals.calories) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Protein */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t("nutrition.protein")}
          </h3>
          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {Math.round(dailyTotals.protein)}
          {t("units.g")}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          z {nutritionGoals.protein}
          {t("units.g")}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(
                (dailyTotals.protein / nutritionGoals.protein) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Carbs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t("nutrition.carbs")}
          </h3>
          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {Math.round(dailyTotals.carbs)}
          {t("units.g")}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          z {nutritionGoals.carbs}
          {t("units.g")}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(
                (dailyTotals.carbs / nutritionGoals.carbs) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Fats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t("nutrition.fats")}
          </h3>
          <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
              />
            </svg>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {Math.round(dailyTotals.fats)}
          {t("units.g")}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          z {nutritionGoals.fats}
          {t("units.g")}
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(
                (dailyTotals.fats / nutritionGoals.fats) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
