"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Plan {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  type: "training" | "nutrition" | "both";
  status: "active" | "draft" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
  progress: number;
  duration: number; // w tygodniach
  description?: string;
}

export default function PlansPage() {
  const t = useTranslations("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "training" | "nutrition" | "both"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "draft" | "completed" | "archived"
  >("all");
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  // Mock data - w prawdziwej aplikacji to będzie z API
  const [plans] = useState<Plan[]>([
    {
      id: "1",
      name: "Plan redukcji wagi - Anna K.",
      clientName: "Anna Kowalska",
      clientEmail: "anna.kowalska@email.com",
      type: "both",
      status: "active",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-15",
      progress: 65,
      duration: 12,
      description:
        "Kompleksowy plan redukcji wagi z treningami cardio i siłowymi oraz dietą niskokaloryczną",
    },
    {
      id: "2",
      name: "Plan budowy masy - Piotr N.",
      clientName: "Piotr Nowak",
      clientEmail: "piotr.nowak@email.com",
      type: "training",
      status: "active",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-14",
      progress: 40,
      duration: 16,
      description:
        "Plan treningowy skupiający się na budowie masy mięśniowej z progresją obciążeń",
    },
    {
      id: "3",
      name: "Dieta sportowa - Maria W.",
      clientName: "Maria Wiśniewska",
      clientEmail: "maria.wisniewska@email.com",
      type: "nutrition",
      status: "draft",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-12",
      progress: 0,
      duration: 8,
      description:
        "Plan żywieniowy dla biegacza długodystansowego z optymalizacją węglowodanów",
    },
    {
      id: "4",
      name: "Plan rehabilitacyjny - Tomasz Z.",
      clientName: "Tomasz Zieliński",
      clientEmail: "tomasz.zielinski@email.com",
      type: "training",
      status: "completed",
      createdAt: "2023-11-01",
      updatedAt: "2023-12-31",
      progress: 100,
      duration: 8,
      description:
        "Program rehabilitacyjny po kontuzji kolana z ćwiczeniami stabilizacyjnymi",
    },
    {
      id: "5",
      name: "Dieta wegańska - Katarzyna L.",
      clientName: "Katarzyna Lewandowska",
      clientEmail: "katarzyna.lewandowska@email.com",
      type: "nutrition",
      status: "archived",
      createdAt: "2023-09-01",
      updatedAt: "2023-10-31",
      progress: 100,
      duration: 6,
      description: "Plan żywieniowy wegański z suplementacją B12 i żelaza",
    },
  ]);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || plan.type === filterType;
    const matchesStatus =
      filterStatus === "all" || plan.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "archived":
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-blue-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-red-500";
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
          <button
            onClick={() => setShowCreatePlanModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            {t("createPlan")}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("stats.totalPlans")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.length}
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
                  {t("stats.activePlans")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.filter((p) => p.status === "active").length}
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
                  {t("stats.avgProgress")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {Math.round(
                    plans.reduce((sum, p) => sum + p.progress, 0) / plans.length
                  )}
                  %
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("stats.avgDuration")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {Math.round(
                    plans.reduce((sum, p) => sum + p.duration, 0) / plans.length
                  )}{" "}
                  {t("weeks")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="all">{t("filters.allTypes")}</option>
              <option value="nutrition">{t("filters.nutrition")}</option>
              <option value="training">{t("filters.training")}</option>
              <option value="both">{t("filters.both")}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="all">{t("filters.allStatuses")}</option>
              <option value="active">{t("filters.active")}</option>
              <option value="draft">{t("filters.draft")}</option>
              <option value="completed">{t("filters.completed")}</option>
              <option value="archived">{t("filters.archived")}</option>
            </select>
          </div>
        </div>

        {/* Plans List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {plan.clientName} • {plan.clientEmail}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                        plan.type
                      )}`}
                    >
                      {t(`types.${plan.type}`)}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        plan.status
                      )}`}
                    >
                      {t(`statuses.${plan.status}`)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      {t("progress")}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {plan.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                        plan.progress
                      )}`}
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span>
                    {t("duration")}: {plan.duration} {t("weeks")}
                  </span>
                  <span>
                    {t("updated")}:{" "}
                    {new Date(plan.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    {t("actions.view")}
                  </button>
                  <button className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    {t("actions.edit")}
                  </button>
                  <button className="px-3 py-2 text-sm bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    ⋯
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {t("noPlans.title")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {t("noPlans.description")}
            </p>
            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
            >
              {t("noPlans.createFirst")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
