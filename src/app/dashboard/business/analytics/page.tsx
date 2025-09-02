"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface BusinessMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  activeMembers: number;
  memberGrowth: number;
  averageRevenuePerMember: number;
  retentionRate: number;
  conversionRate: number;
  churnRate: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

interface TopPerformer {
  id: string;
  name: string;
  revenue: number;
  members: number;
  growth: number;
  status: "growing" | "stable" | "declining";
}

interface BusinessInsight {
  id: string;
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
}

export default function BusinessAnalyticsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [revenueChart, setRevenueChart] = useState<ChartData | null>(null);
  const [membersChart, setMembersChart] = useState<ChartData | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz dane analityczne
      const [metricsRes, chartsRes, performersRes, insightsRes] =
        await Promise.all([
          fetch(`/api/business/analytics/metrics?period=${selectedPeriod}`),
          fetch(`/api/business/analytics/charts?period=${selectedPeriod}`),
          fetch(`/api/business/analytics/performers`),
          fetch(`/api/business/analytics/insights`),
        ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics);
      }

      if (chartsRes.ok) {
        const chartsData = await chartsRes.json();
        setRevenueChart(chartsData.revenueChart);
        setMembersChart(chartsData.membersChart);
      }

      if (performersRes.ok) {
        const performersData = await performersRes.json();
        setTopPerformers(performersData.topPerformers);
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData.insights);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAnalyticsData();
    }
  }, [session, selectedPeriod]);

  const formatCurrency = (amount: number, currency: string = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatPercentage = (value: number | undefined | null) => {
    const v = typeof value === "number" && isFinite(value) ? value : 0;
    return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number | undefined | null) => {
    const v = typeof value === "number" && isFinite(value) ? value : 0;
    if (v > 0) {
      return <ArrowUpIcon className="w-4 h-4 text-green-600" />;
    } else if (v < 0) {
      return <ArrowDownIcon className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getGrowthColor = (value: number | undefined | null) => {
    const v = typeof value === "number" && isFinite(value) ? value : 0;
    if (v > 0) return "text-green-600";
    if (v < 0) return "text-red-600";
    return "text-slate-600";
  };

  const getStatusBadge = (status: TopPerformer["status"]) => {
    const styles = {
      growing:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      stable:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      declining: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    const labels = {
      growing: "Wzrost",
      stable: "Stabilny",
      declining: "Spadek",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getInsightIcon = (type: BusinessInsight["type"]) => {
    const icons = {
      positive: (
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
          <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      ),
      warning: (
        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      ),
      info: (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
    };
    return icons[type];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Ładowanie analityki biznesowej...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Błąd ładowania
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Analityka biznesowa
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Szczegółowe analizy, trendy i prognozy dla Twojej firmy
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Ostatnie 7 dni</option>
              <option value="30d">Ostatnie 30 dni</option>
              <option value="90d">Ostatnie 90 dni</option>
              <option value="1y">Ostatni rok</option>
            </select>
            <button
              onClick={fetchAnalyticsData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Odśwież</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Przychody
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(metrics.monthlyGrowth)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      metrics.monthlyGrowth
                    )}`}
                  >
                    {formatPercentage(metrics.monthlyGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Aktywni członkowie
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics.activeMembers}
                </p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(metrics.memberGrowth)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      metrics.memberGrowth
                    )}`}
                  >
                    {formatPercentage(metrics.memberGrowth)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Średni przychód
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(metrics.averageRevenuePerMember)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  na członka
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Wskaźnik retencji
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {metrics.retentionRate}%
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  członków
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Wskaźnik konwersji
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.conversionRate}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                odwiedzających → członków
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Wskaźnik churn
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {metrics.churnRate}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                utraconych członków
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                LTV/CAC Ratio
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                3.2x
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                wartość klienta / koszt pozyskania
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Trend przychodów
            </h2>
            <div className="flex space-x-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <EyeIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <DocumentTextIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {revenueChart ? (
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Wykres przychodów będzie dostępny wkrótce
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Brak danych do wyświetlenia
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Members Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Wzrost członków
            </h2>
            <div className="flex space-x-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <EyeIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <DocumentTextIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {membersChart ? (
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Wykres członków będzie dostępny wkrótce
                </p>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Brak danych do wyświetlenia
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Performers */}
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
              {topPerformers.map((performer) => (
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

        {topPerformers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Brak danych o wykonawcach
            </p>
          </div>
        )}
      </div>

      {/* Business Insights */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Wnioski biznesowe
          </h2>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            Generuj raport
          </button>
        </div>

        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
            >
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {insight.description}
                </p>
                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    <strong>Wpływ:</strong> {insight.impact}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    <strong>Rekomendacja:</strong> {insight.recommendation}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {insights.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Brak dostępnych wniosków
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Raport analityczny
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Wygeneruj szczegółowy raport PDF
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Generuj raport
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Prognozy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Zobacz prognozy na przyszłość
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Zobacz prognozy
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Segmentacja
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Analiza segmentów klientów
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Analizuj segmenty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
