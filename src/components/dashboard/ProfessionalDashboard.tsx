"use client";

import { useTranslations } from "next-intl";

interface ProfessionalDashboardProps {
  userName: string;
}

export default function ProfessionalDashboard({
  userName,
}: ProfessionalDashboardProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("professional.welcome.title", { userName })}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("professional.welcome.subtitle")}
          </p>
        </div>

        {/* KPI Cards (styled like UserDashboard quick stats) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-600 text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("professional.kpis.activeClients")}
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              24
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-600 text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("professional.kpis.sessionsThisWeek")}
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              18
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-600 text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("professional.kpis.newPlans")}
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              6
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-emerald-600 text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 1.343-3 3v5H7a2 2 0 00-2 2v1h14v-1a2 2 0 00-2-2h-2v-5c0-1.657-1.343-3-3-3z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {t("professional.kpis.monthlyRevenue")}
            </h3>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              $3,420
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("professional.quickActions.title")}
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("professional.quickActions.newPlan")}
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72A6.983 6.983 0 013 12c0-3.866 3.134-7 7-7h4c3.866 0 7 3.134 7 7z"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("professional.quickActions.newMessage")}
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">
                    {t("professional.quickActions.scheduleSession")}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming + Messages */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("professional.upcoming.title")}
                </h3>
              </div>
              <div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Anna Kowalska
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Today • 17:00 • Training session
                      </p>
                    </div>
                    <button className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-gray-900 dark:text-white">
                      Details
                    </button>
                  </div>
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Piotr Nowak
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tomorrow • 09:30 • Nutrition check-in
                      </p>
                    </div>
                    <button className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-700 text-gray-900 dark:text-white">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("professional.messages.title")}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Marek Kowalczyk
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      “I completed today’s workout, felt great!”
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    2h
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Anna Nowak
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      “Could we adjust macros for dinner?”
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    5h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
