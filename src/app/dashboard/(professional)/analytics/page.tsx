"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface AnalyticsData {
  totalClients: number;
  activeClients: number;
  avgProgress: number;
  totalPlans: number;
  completedPlans: number;
  revenue: number;
  monthlyGrowth: number;
}

interface ClientProgress {
  id: string;
  name: string;
  type: "nutrition" | "training" | "both";
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  progress: number;
  workoutsCompleted: number;
  nutritionLogged: number;
  lastActivity: string;
}

interface MonthlyStats {
  month: string;
  newClients: number;
  completedPlans: number;
  avgProgress: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [selectedMetric, setSelectedMetric] = useState<
    "clients" | "progress" | "revenue"
  >("clients");

  // Mock data - w prawdziwej aplikacji to będzie z API
  const [analyticsData] = useState<AnalyticsData>({
    totalClients: 24,
    activeClients: 18,
    avgProgress: 73,
    totalPlans: 42,
    completedPlans: 28,
    revenue: 12450,
    monthlyGrowth: 12.5,
  });

  const [clientProgress] = useState<ClientProgress[]>([
    {
      id: "1",
      name: "Anna Kowalska",
      type: "both",
      startWeight: 72,
      currentWeight: 68,
      targetWeight: 65,
      progress: 85,
      workoutsCompleted: 15,
      nutritionLogged: 12,
      lastActivity: "2024-01-15",
    },
    {
      id: "2",
      name: "Piotr Nowak",
      type: "training",
      startWeight: 85,
      currentWeight: 82,
      targetWeight: 80,
      progress: 60,
      workoutsCompleted: 12,
      nutritionLogged: 0,
      lastActivity: "2024-01-14",
    },
    {
      id: "3",
      name: "Maria Wiśniewska",
      type: "nutrition",
      startWeight: 68,
      currentWeight: 66,
      targetWeight: 64,
      progress: 50,
      workoutsCompleted: 0,
      nutritionLogged: 8,
      lastActivity: "2024-01-12",
    },
    {
      id: "4",
      name: "Tomasz Zieliński",
      type: "both",
      startWeight: 78,
      currentWeight: 75,
      targetWeight: 72,
      progress: 75,
      workoutsCompleted: 10,
      nutritionLogged: 6,
      lastActivity: "2024-01-10",
    },
    {
      id: "5",
      name: "Katarzyna Lewandowska",
      type: "nutrition",
      startWeight: 65,
      currentWeight: 63,
      targetWeight: 60,
      progress: 40,
      workoutsCompleted: 0,
      nutritionLogged: 5,
      lastActivity: "2024-01-08",
    },
  ]);

  const [monthlyStats] = useState<MonthlyStats[]>([
    {
      month: "Sty",
      newClients: 3,
      completedPlans: 2,
      avgProgress: 65,
      revenue: 1200,
    },
    {
      month: "Lut",
      newClients: 5,
      completedPlans: 3,
      avgProgress: 68,
      revenue: 1800,
    },
    {
      month: "Mar",
      newClients: 4,
      completedPlans: 4,
      avgProgress: 71,
      revenue: 1600,
    },
    {
      month: "Kwi",
      newClients: 6,
      completedPlans: 5,
      avgProgress: 73,
      revenue: 2200,
    },
    {
      month: "Maj",
      newClients: 3,
      completedPlans: 3,
      avgProgress: 75,
      revenue: 1400,
    },
    {
      month: "Cze",
      newClients: 7,
      completedPlans: 6,
      avgProgress: 78,
      revenue: 2400,
    },
    {
      month: "Lip",
      newClients: 4,
      completedPlans: 4,
      avgProgress: 80,
      revenue: 1600,
    },
    {
      month: "Sie",
      newClients: 5,
      completedPlans: 5,
      avgProgress: 82,
      revenue: 1800,
    },
    {
      month: "Wrz",
      newClients: 6,
      completedPlans: 6,
      avgProgress: 84,
      revenue: 2200,
    },
    {
      month: "Paź",
      newClients: 4,
      completedPlans: 4,
      avgProgress: 86,
      revenue: 1600,
    },
    {
      month: "Lis",
      newClients: 5,
      completedPlans: 5,
      avgProgress: 88,
      revenue: 1800,
    },
    {
      month: "Gru",
      newClients: 6,
      completedPlans: 6,
      avgProgress: 90,
      revenue: 2200,
    },
  ]);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600 dark:text-green-400";
    if (progress >= 60) return "text-blue-600 dark:text-blue-400";
    if (progress >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "nutrition":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "training":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "both":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {t("description")}
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="7d">{t("periods.7d")}</option>
              <option value="30d">{t("periods.30d")}</option>
              <option value="90d">{t("periods.90d")}</option>
              <option value="1y">{t("periods.1y")}</option>
            </select>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="clients">{t("metrics.clients")}</option>
              <option value="progress">{t("metrics.progress")}</option>
              <option value="revenue">{t("metrics.revenue")}</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("metrics.totalClients")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {analyticsData.totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("metrics.activeClients")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {analyticsData.activeClients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("metrics.avgProgress")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {analyticsData.avgProgress}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("metrics.revenue")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(analyticsData.revenue)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  +{analyticsData.monthlyGrowth}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Progress Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("charts.monthlyProgress")}
            </h3>
            <div className="space-y-4">
              {monthlyStats.slice(-6).map((stat, index) => (
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
              {monthlyStats.slice(-6).map((stat, index) => (
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

        {/* Client Progress Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("clientProgress.title")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {t("clientProgress.description")}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("clientProgress.table.client")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("clientProgress.table.type")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("clientProgress.table.weight")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("clientProgress.table.progress")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("clientProgress.table.activity")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t("clientProgress.table.lastActivity")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {clientProgress.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {client.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                          client.type
                        )}`}
                      >
                        {t(`types.${client.type}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {client.startWeight}kg → {client.currentWeight}kg
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Cel: {client.targetWeight}kg
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                              client.progress
                            ).replace("text-", "bg-")}`}
                            style={{ width: `${client.progress}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${getProgressColor(
                            client.progress
                          )}`}
                        >
                          {client.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {client.workoutsCompleted}{" "}
                        {t("clientProgress.workouts")}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {client.nutritionLogged} {t("clientProgress.meals")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(client.lastActivity).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {t("quickActions.generateReport")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("quickActions.generateReportDesc")}
            </p>
            <button className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
              {t("quickActions.generate")}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {t("quickActions.clientInsights")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("quickActions.clientInsightsDesc")}
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              {t("quickActions.view")}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-purple-600 dark:text-purple-400"
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
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {t("quickActions.scheduleReview")}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("quickActions.scheduleReviewDesc")}
            </p>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              {t("quickActions.schedule")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
