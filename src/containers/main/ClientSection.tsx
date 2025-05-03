"use client";

import { useTranslations } from "next-intl";

export default function ClientSection() {
  const t = useTranslations("ClientSection");

  return (
    <section
      id="for-clients"
      className="relative py-20 bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300"
    >
      {/* Background gradient overlay that stays in both modes */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.07] via-transparent to-cyan-500/[0.07] opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <span className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
          {t("badge")}
        </span>
        <h2 className="text-4xl font-bold mb-16">
          <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
            {t("title.achieve")}{" "}
          </span>
          <span className="text-slate-800 dark:text-white">
            {t("title.with")}
          </span>
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {/* Training Plan Card */}
          <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border dark:border-slate-700/50">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
              {t("trainingPlan.title")}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("trainingPlan.personalizedPlans")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("trainingPlan.exerciseLibrary")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("trainingPlan.videoInstructions")}
              </li>
            </ul>
          </div>

          {/* Progress Tracking Card */}
          <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border dark:border-slate-700/50">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
              {t("progressTracking.title")}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("progressTracking.resultTracking")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("progressTracking.trainingStats")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("progressTracking.progressAnalysis")}
              </li>
            </ul>
          </div>

          {/* Diet Plan Card */}
          <div className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm dark:border dark:border-slate-700/50">
            <div className="text-3xl mb-4">🥗</div>
            <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white">
              {t("dietPlan.title")}
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("dietPlan.mealPlans")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("dietPlan.calorieTracking")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-teal-500">✓</span>
                {t("dietPlan.recipesAndTips")}
              </li>
            </ul>
          </div>
        </div>

        {/* App Preview */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">{t("allInOne.title")}</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>{t("allInOne.trainingCalendar")}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>{t("allInOne.foodDiary")}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>{t("allInOne.measurements")}</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-teal-300">✓</span>
                  <span>{t("allInOne.community")}</span>
                </li>
              </ul>
              <button
                type="button"
                className="mt-8 bg-white text-teal-600 px-6 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
              >
                {t("cta")}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl transform rotate-6"></div>
              <div className="relative bg-slate-800 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
