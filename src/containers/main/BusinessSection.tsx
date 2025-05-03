"use client";

import { useTranslations } from "next-intl";

export default function BusinessSection() {
  const t = useTranslations("BusinessSection");

  return (
    <section
      id="for-business"
      className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
            {t("badge")}
          </span>
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              {t("title.digital")}
            </span>
            <span className="text-slate-800 dark:text-white">
              {t("title.business")}
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xl max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="rounded-xl shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-3xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              {t("businessManagement.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessManagement.features.schedules")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessManagement.features.memberships")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessManagement.features.payments")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessManagement.features.staff")}
              </li>
            </ul>
          </div>

          <div className="rounded-xl shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              {t("businessAnalytics.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessAnalytics.features.financial")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessAnalytics.features.membership")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessAnalytics.features.trends")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("businessAnalytics.features.forecasts")}
              </li>
            </ul>
          </div>

          <div className="rounded-xl shadow-lg p-8 bg-white dark:bg-slate-800">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              {t("teamIntegration.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("teamIntegration.features.portal")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("teamIntegration.features.communication")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("teamIntegration.features.tasks")}
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300">
                <span className="mr-2 text-blue-500">✓</span>
                {t("teamIntegration.features.schedules")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
