"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface Transaction {
  id: string;
  type: "income" | "expense" | "subscription" | "refund";
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  category: string;
  memberId?: string;
  memberName?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired" | "pending";
  amount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  memberCount: number;
  features: string[];
}

interface FinancialStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerMember: number;
  growthRate: number;
}

export default function BusinessFinancesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz dane finansowe
      const [transactionsRes, subscriptionsRes, statsRes] = await Promise.all([
        fetch(`/api/business/finances/transactions?period=${selectedPeriod}`),
        fetch(`/api/business/finances/subscriptions`),
        fetch(`/api/business/finances/stats?period=${selectedPeriod}`),
      ]);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        const normalized = (subscriptionsData.subscriptions || []).map(
          (s: any) => ({
            id: s.id,
            plan: s.plan,
            status: s.status ?? "active",
            amount: s.amount ?? s.price ?? 0,
            currency: s.currency ?? "PLN",
            billingCycle: s.billingCycle ?? "monthly",
            nextBillingDate: s.nextBillingDate ?? null,
            memberCount: s.memberCount ?? 0,
            features: Array.isArray(s.features) ? s.features : [],
          })
        );
        setSubscriptions(normalized);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
      setError("Failed to fetch financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchFinancialData();
    }
  }, [session, selectedPeriod]);

  const formatCurrency = (amount: number, currency: string = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Brak danych";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pl-PL");
    } catch {
      return "Brak danych";
    }
  };

  const getTransactionTypeIcon = (type: Transaction["type"]) => {
    const icons = {
      income: (
        <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
      ),
      expense: (
        <ArrowTrendingDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
      ),
      subscription: (
        <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      ),
      refund: (
        <ArrowTrendingDownIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      ),
    };
    return icons[type];
  };

  const getTransactionTypeLabel = (type: Transaction["type"]) => {
    const labels = {
      income: "Przychód",
      expense: "Wydatek",
      subscription: "Subskrypcja",
      refund: "Zwrot",
    };
    return labels[type];
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    const labels = {
      completed: "Zakończone",
      pending: "Oczekujące",
      failed: "Nieudane",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getSubscriptionStatusBadge = (status: Subscription["status"]) => {
    const styles = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      expired:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };

    const labels = {
      active: "Aktywna",
      cancelled: "Anulowana",
      expired: "Wygasła",
      pending: "Oczekująca",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Ładowanie danych finansowych...
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
              Finanse firmy
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Zarządzaj finansami, subskrypcjami i analityką biznesową
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
              onClick={() => setShowAddTransactionModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Dodaj transakcję</span>
            </button>
            <button
              onClick={fetchFinancialData}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
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

      {/* Financial Overview Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Przychody
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <ArrowTrendingDownIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Wydatki
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Zysk netto
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.netProfit)}
                </p>
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
                  MRR
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(stats.monthlyRecurringRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Aktywne subskrypcje
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.activeSubscriptions}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Średni przychód na członka
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(stats.averageRevenuePerMember)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Tempo wzrostu
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.growthRate > 0 ? "+" : ""}
                {stats.growthRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Subskrypcje
          </h2>
          <div className="flex space-x-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <EyeIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Cykl
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Następna płatność
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Członkowie
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {subscriptions.map((subscription) => (
                <tr
                  key={subscription.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {subscription.plan}
                    </div>
                    {Array.isArray(subscription.features) &&
                      subscription.features.length > 0 && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {subscription.features.join(", ")}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSubscriptionStatusBadge(subscription.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {subscription.billingCycle === "monthly"
                      ? "Miesięcznie"
                      : "Rocznie"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(subscription.nextBillingDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {subscription.memberCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscriptions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Brak aktywnych subskrypcji
            </p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Ostatnie transakcje
          </h2>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            Zobacz wszystkie
          </button>
        </div>

        <div className="space-y-4">
          {transactions.slice(0, 10).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getTransactionTypeIcon(transaction.type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {getTransactionTypeLabel(transaction.type)} •{" "}
                    {transaction.category}
                    {transaction.memberName && ` • ${transaction.memberName}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      transaction.type === "income" ||
                      transaction.type === "refund"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {transaction.type === "income" ||
                    transaction.type === "refund"
                      ? "+"
                      : "-"}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(transaction.date)}
                  </div>
                </div>
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              Brak transakcji w wybranym okresie
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
              Raport finansowy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Wygeneruj szczegółowy raport finansowy
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Generuj raport
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Analityka biznesowa
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Szczegółowe analizy i prognozy
            </p>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Zobacz analitykę
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCardIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              Ustawienia płatności
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Zarządzaj metodami płatności
            </p>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Konfiguruj
            </button>
          </div>
        </div>
      </div>

      {/* Raporty finansowe */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Raporty finansowe
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Eksportuj raporty (CSV/PDF) za wybrany okres
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Eksport CSV</span>
            </button>
            <button className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5" />
              <span>Eksport PDF</span>
            </button>
          </div>
        </div>
        <div className="text-slate-600 dark:text-slate-400">
          Wybierz zakres w filtrze u góry i wygeneruj raport. (placeholder)
        </div>
      </div>

      {/* Add Transaction Modal - Placeholder */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Dodaj transakcję
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Funkcja będzie dostępna wkrótce
              </p>
              <button
                onClick={() => setShowAddTransactionModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
