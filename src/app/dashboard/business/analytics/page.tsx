"use client";

import { useState, useEffect } from "react";
import MiniLineChart from "./MiniLineChart";
import TopPerformersTable from "./TopPerformersTable";
import InsightsList from "./InsightsList";
import ForecastModal from "./ForecastModal";
import SegmentModal from "./SegmentModal";
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
  monthlyGrowth?: number;
  activeMembers: number;
  memberGrowth?: number;
  averageRevenuePerMember: number;
  retentionRate: number;
  conversionRate?: number;
  churnRate?: number;
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
  members?: number;
  growth?: number;
  status?: "growing" | "stable" | "declining";
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
  const [finStats, setFinStats] = useState<{
    netProfit: number;
    monthlyRecurringRevenue: number;
  } | null>(null);
  const [revShowGrid, setRevShowGrid] = useState(true);
  const [memShowGrid, setMemShowGrid] = useState(true);
  const [showSegments, setShowSegments] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [seededAttempted, setSeededAttempted] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz dane analityczne
      const [metricsRes, chartsRes, performersRes, insightsRes, finStatsRes] =
        await Promise.all([
          fetch(`/api/business/analytics/metrics?period=${selectedPeriod}`),
          fetch(`/api/business/analytics/charts?period=${selectedPeriod}`),
          fetch(`/api/business/analytics/performers`),
          fetch(`/api/business/analytics/insights`),
          fetch(`/api/business/finances/stats?period=${selectedPeriod}`),
        ]);

      let chartsData: any = null;
      let performersData: any = null;
      let st: any = null;

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        const m = metricsData.metrics || {};
        const mapped: BusinessMetrics = {
          totalRevenue: m.totalRevenue || 0,
          monthlyGrowth: 0,
          activeMembers: m.activeMembers || 0,
          memberGrowth: 0,
          averageRevenuePerMember: m.averageRevenuePerMember || 0,
          retentionRate: m.retentionRate || 0,
          conversionRate: 0,
          churnRate: 0,
        };
        setMetrics(mapped);
      }

      if (chartsRes.ok) {
        chartsData = await chartsRes.json();
        setRevenueChart(chartsData.revenueChart);
        setMembersChart(chartsData.membersChart);
      }

      // Fallback: build members chart from subscriptions if missing/empty
      const needMembersFallback = !chartsData?.membersChart?.labels?.length;
      if (needMembersFallback) {
        try {
          const subsRes = await fetch("/api/business/finances/subscriptions");
          if (subsRes.ok) {
            const subsJson = await subsRes.json();
            const subs = Array.isArray(subsJson?.subscriptions)
              ? subsJson.subscriptions
              : [];
            if (subs.length) {
              const end = new Date();
              const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
              const monthKey = (dt: Date) =>
                `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
                  2,
                  "0"
                )}`;
              const keys: string[] = [];
              for (let i = 0; i < 12; i++) {
                const d = new Date(
                  start.getFullYear(),
                  start.getMonth() + i,
                  1
                );
                keys.push(monthKey(d));
              }
              const counts: Record<string, number> = Object.fromEntries(
                keys.map((k) => [k, 0])
              );
              subs.forEach((s: any) => {
                const dStr =
                  s?.startDate || s?.createdAt || s?.start || s?.date;
                if (!dStr) return;
                const dt = new Date(dStr);
                const k = monthKey(
                  new Date(dt.getFullYear(), dt.getMonth(), 1)
                );
                if (k in counts) counts[k] += 1;
              });
              setMembersChart({
                labels: keys,
                datasets: [
                  {
                    label: "Nowi członkowie [miesięcznie]",
                    data: keys.map((k) => counts[k] || 0),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59,130,246,0.15)",
                    tension: 0.3,
                  },
                ],
              });
            }
          }
          // second fallback: derive from transactions if subscriptions absent
          if (!membersChart || !membersChart.labels?.length) {
            const trxRes = await fetch("/api/business/finances/transactions");
            if (trxRes.ok) {
              const tj = await trxRes.json();
              const tx = Array.isArray(tj?.transactions) ? tj.transactions : [];
              if (tx.length) {
                const end = new Date();
                const start = new Date(
                  end.getFullYear(),
                  end.getMonth() - 11,
                  1
                );
                const monthKey = (dt: Date) =>
                  `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
                    2,
                    "0"
                  )}`;
                const keys: string[] = [];
                for (let i = 0; i < 12; i++)
                  keys.push(
                    monthKey(
                      new Date(start.getFullYear(), start.getMonth() + i, 1)
                    )
                  );
                const counts: Record<string, number> = Object.fromEntries(
                  keys.map((k) => [k, 0])
                );
                tx.forEach((t: any) => {
                  const dStr = t?.date || t?.createdAt;
                  const cat = (t?.category || "").toLowerCase();
                  if (!dStr) return;
                  // heurystyka: liczymy transakcje subskrypcyjne jako przyrost członków
                  if (cat.includes("subscription") || cat.includes("member")) {
                    const dt = new Date(dStr);
                    const k = monthKey(
                      new Date(dt.getFullYear(), dt.getMonth(), 1)
                    );
                    if (k in counts) counts[k] += 1;
                  }
                });
                setMembersChart({
                  labels: keys,
                  datasets: [
                    {
                      label: "Nowi członkowie [miesięcznie]",
                      data: keys.map((k) => counts[k] || 0),
                      borderColor: "#3b82f6",
                      backgroundColor: "rgba(59,130,246,0.15)",
                      tension: 0.3,
                    },
                  ],
                });
              }
            }
          }
        } catch (e) {
          // ignore fallback errors
        }
      }

      if (performersRes.ok) {
        performersData = await performersRes.json();
        const arr: TopPerformer[] = (performersData.topPerformers || []).map(
          (p: any) => ({
            id: String(p.id),
            name: p.name || "Członek",
            revenue: p.revenue || 0,
            members: p.members ?? p.memberCount ?? p.membersCount ?? 0,
          })
        );
        setTopPerformers(arr);
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData.insights);
      }

      if (finStatsRes.ok) {
        const s = await finStatsRes.json();
        st = s.stats || {};
        setFinStats({
          netProfit: st.netProfit || 0,
          monthlyRecurringRevenue: st.monthlyRecurringRevenue || 0,
        });
      }

      // Auto-seed once if analytics appear empty
      const chartsEmpty =
        (!chartsRes.ok || !chartsData?.revenueChart?.labels?.length) &&
        (!chartsRes.ok || !chartsData?.membersChart?.labels?.length);
      const performersEmpty = !(performersData?.topPerformers || []).length;
      const statsEmpty = !(
        finStatsRes.ok &&
        (st?.netProfit || st?.monthlyRecurringRevenue)
      );
      if (!seededAttempted && (chartsEmpty || performersEmpty || statsEmpty)) {
        try {
          setSeededAttempted(true);
          await fetch("/api/business/finances/seed", { method: "POST" });
          await new Promise((r) => setTimeout(r, 200));
          await fetchAnalyticsData();
          return;
        } catch (e) {
          // ignore
        }
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

      {/* Finance KPIs (MRR, Zysk netto) */}
      {finStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  MRR
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(finStats.monthlyRecurringRevenue)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  miesięczne przychody powtarzalne
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Zysk netto
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(finStats.netProfit)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  przychody - koszty
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
              <button
                onClick={() => setRevShowGrid((v) => !v)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={revShowGrid ? "Ukryj siatkę" : "Pokaż siatkę"}
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!revenueChart) return;
                  const rows = [
                    ["Okres", "Przychody"],
                    ...revenueChart.labels.map((l, i) => [
                      l,
                      String(revenueChart.datasets[0]?.data?.[i] ?? 0),
                    ]),
                  ];
                  const csv = rows
                    .map((r) =>
                      r
                        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
                        .join(",")
                    )
                    .join("\n");
                  const blob = new Blob(["\ufeff" + csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "trend_przychodow.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Pobierz CSV"
              >
                <DocumentTextIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {revenueChart ? (
            <MiniLineChart
              labels={revenueChart.labels}
              data={revenueChart.datasets[0]?.data || []}
              color="#10b981"
              label="Przychody [PLN]"
              yUnit="PLN"
              formatValue={(v) => formatCurrency(v)}
              showGrid={revShowGrid}
            />
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
              <button
                onClick={() => setMemShowGrid((v) => !v)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={memShowGrid ? "Ukryj siatkę" : "Pokaż siatkę"}
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!membersChart) return;
                  const rows = [
                    ["Okres", "Nowi członkowie"],
                    ...membersChart.labels.map((l, i) => [
                      l,
                      String(membersChart.datasets[0]?.data?.[i] ?? 0),
                    ]),
                  ];
                  const csv = rows
                    .map((r) =>
                      r
                        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
                        .join(",")
                    )
                    .join("\n");
                  const blob = new Blob(["\ufeff" + csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "wzrost_czlonkow.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Pobierz CSV"
              >
                <DocumentTextIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {membersChart ? (
            <MiniLineChart
              labels={membersChart.labels}
              data={membersChart.datasets[0]?.data || []}
              color="#3b82f6"
              label="Nowi członkowie [miesięcznie]"
              yUnit="os."
              formatValue={(v) => String(Math.round(v))}
              showGrid={memShowGrid}
            />
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
      <TopPerformersTable
        performers={topPerformers}
        formatCurrency={formatCurrency}
        getGrowthIcon={getGrowthIcon}
        getGrowthColor={getGrowthColor}
        formatPercentage={formatPercentage}
        getStatusBadge={getStatusBadge}
      />

      {/* Business Insights */}
      <InsightsList insights={insights} getInsightIcon={getInsightIcon} />

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
            <button
              onClick={async () => {
                try {
                  const performersPayload = topPerformers.map((p) => ({
                    name: p.name,
                    revenue: p.revenue,
                    members: p.members,
                  }));
                  const chartsPayload = {
                    revenue: revenueChart
                      ? {
                          labels: revenueChart.labels,
                          data: revenueChart.datasets[0]?.data || [],
                        }
                      : null,
                    members: membersChart
                      ? {
                          labels: membersChart.labels,
                          data: membersChart.datasets[0]?.data || [],
                        }
                      : null,
                  };

                  const res = await fetch(
                    "/api/business/analytics/export/pdf",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        metrics,
                        finStats,
                        performers: performersPayload,
                        charts: chartsPayload,
                        insights,
                      }),
                    }
                  );
                  if (!res.ok) throw new Error("Błąd generowania PDF");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "raport_analityczny.pdf";
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  console.error(e);
                  alert("Nie udało się wygenerować raportu.");
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
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
            <button
              onClick={() => setShowForecast(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
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
            <button
              onClick={() => setShowSegments(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Analizuj segmenty
            </button>
          </div>
        </div>
      </div>
      <ForecastModal
        open={showForecast}
        onClose={() => setShowForecast(false)}
        revenue={
          revenueChart
            ? {
                labels: revenueChart.labels,
                data: revenueChart.datasets[0]?.data || [],
                color: "#10b981",
                title: "Przychody [PLN]",
              }
            : null
        }
        members={
          membersChart
            ? {
                labels: membersChart.labels,
                data: membersChart.datasets[0]?.data || [],
                color: "#3b82f6",
                title: "Nowi członkowie",
              }
            : null
        }
      />
      <SegmentModal
        open={showSegments}
        onClose={() => setShowSegments(false)}
        performers={topPerformers.map((p) => ({
          name: p.name,
          revenue: p.revenue,
          members: p.members,
        }))}
      />
    </div>
  );
}
