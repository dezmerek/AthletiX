"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import CreatePlanModal from "@/components/modals/CreatePlanModal";
import EditPlanModal from "@/components/modals/EditPlanModal";
import PlanDetailsModal from "@/components/modals/PlanDetailsModal";
import DeletePlanModal from "@/components/modals/DeletePlanModal";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
}

interface TrainingDay {
  day: number;
  name: string;
  exercises: Exercise[];
  notes?: string;
}

interface Plan {
  _id: string;
  name: string;
  description?: string;
  type: "training" | "nutrition" | "both";
  status: "active" | "inactive" | "draft";
  startDate: string;
  endDate?: string;
  goals: {
    weight?: number;
    targetWeight?: number;
    trainerTargetWeight?: string;
    strength?: string[];
    endurance?: string[];
    flexibility?: string[];
    nutrition?: string[];
  };
  // Nowe pola dla treningów
  trainingPlan?: {
    duration: number; // liczba tygodni
    frequency: number; // treningi na tydzień
    trainingDays: TrainingDay[];
  };
  client: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  clientProfile?: {
    weight?: number;
    targetWeight?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PlansPage() {
  const t = useTranslations("plans");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "training" | "nutrition" | "both"
  >("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive" | "draft"
  >("all");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);
  const [showDeletePlanModal, setShowDeletePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Pobierz plany z API
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/professional/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError("Failed to fetch plans");
      }
    } catch {
      setError("Error fetching plans");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description &&
        plan.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || plan.type === filterType;
    const matchesStatus =
      filterStatus === "all" || plan.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
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

  // Oblicz postęp na podstawie wagi
  const calculateProgress = (plan: Plan) => {
    if (!plan.clientProfile?.weight || !plan.clientProfile?.targetWeight) {
      return 0;
    }

    const currentWeight = plan.clientProfile.weight;
    const targetWeight = plan.clientProfile.targetWeight;

    // Sprawdzamy czy plan ma wagę docelową ustaloną przez trenera
    const trainerTargetWeight = plan.goals.trainerTargetWeight;

    // Jeśli trener ustawił wagę docelową, używamy jej
    if (trainerTargetWeight) {
      const targetWeightToUse = parseFloat(trainerTargetWeight);

      // Jeśli aktualna waga jest równa docelowej, postęp to 100%
      if (currentWeight === targetWeightToUse) return 100;

      // Obliczamy postęp na podstawie wagi aktualnej vs docelowej
      // Zakładamy, że waga początkowa to aktualna waga klienta
      const startWeight = plan.clientProfile.weight;
      const totalChange = Math.abs(targetWeightToUse - startWeight);

      if (totalChange === 0) return 100;

      const currentChange = Math.abs(targetWeightToUse - currentWeight);
      const progress = ((totalChange - currentChange) / totalChange) * 100;

      return Math.max(0, Math.min(100, Math.round(progress)));
    }

    // Jeśli trener nie ustawił wagi docelowej, używamy wagi z profilu klienta
    if (currentWeight === targetWeight) return 100;

    // Domyślnie postęp to 0% (klient nie rozpoczął jeszcze planu)
    return 0;
  };

  // Modal handlers
  const handleViewPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanDetailsModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowEditPlanModal(true);
  };

  const handleDeletePlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowDeletePlanModal(true);
  };

  const handlePlanCreated = () => {
    fetchPlans();
  };

  const handlePlanUpdated = () => {
    fetchPlans();
  };

  const handlePlanDeleted = () => {
    fetchPlans();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

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
            {/* Navigation Links */}
            <div className="flex space-x-4 mt-4">
              <a
                href="/dashboard/analytics"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
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
                Panel Analityczny
              </a>
              <a
                href="/dashboard/clients"
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Zarządzaj Klientami
              </a>
            </div>
          </div>
          <button
            onClick={() => setShowCreatePlanModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            {t("createPlan")}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("stats.avgProgress")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plans.length > 0
                    ? Math.round(
                        plans.reduce(
                          (sum, p) => sum + calculateProgress(p),
                          0
                        ) / plans.length
                      )
                    : 0}
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("stats.trainingPlans")}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {
                    plans.filter(
                      (p) => p.type === "training" || p.type === "both"
                    ).length
                  }
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
              onChange={(e) =>
                setFilterType(
                  e.target.value as "all" | "training" | "nutrition" | "both"
                )
              }
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="all">{t("filters.allTypes")}</option>
              <option value="training">{t("filters.training")}</option>
              <option value="nutrition">{t("filters.nutrition")}</option>
              <option value="both">{t("filters.both")}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as "all" | "active" | "inactive" | "draft"
                )
              }
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            >
              <option value="all">{t("filters.allStatuses")}</option>
              <option value="active">{t("filters.active")}</option>
              <option value="inactive">{t("filters.inactive")}</option>
              <option value="draft">{t("filters.draft")}</option>
            </select>
          </div>
        </div>

        {/* Plans List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => {
            const progress = calculateProgress(plan);
            return (
              <div
                key={plan._id}
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
                        {plan.client.name} • {plan.client.email}
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

                  {/* Weight Information */}
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          {t("weight.current")}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                          {plan.clientProfile?.weight
                            ? `${plan.clientProfile.weight} kg`
                            : t("weight.notSet")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">
                          {t("weight.target")}:
                        </span>
                        <span className="ml-2 font-medium text-slate-900 dark:text-white">
                          {plan.clientProfile?.targetWeight
                            ? `${plan.clientProfile.targetWeight} kg`
                            : t("weight.notSet")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">
                        {t("progress")}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                          progress
                        )}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span>
                      {t("dates.start")}:{" "}
                      {new Date(plan.startDate).toLocaleDateString()}
                    </span>
                    {plan.endDate && (
                      <span>
                        {t("dates.end")}:{" "}
                        {new Date(plan.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPlan(plan)}
                      className="flex-1 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      {t("actions.view")}
                    </button>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {t("actions.edit")}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      {t("actions.remove")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
              {searchQuery || filterStatus !== "all" || filterType !== "all"
                ? t("noResultsFound")
                : t("noPlansYet")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {searchQuery || filterStatus !== "all" || filterType !== "all"
                ? t("tryDifferentFilters")
                : t("startCreatingPlans")}
            </p>
            {!searchQuery && filterStatus === "all" && filterType === "all" && (
              <button
                onClick={() => setShowCreatePlanModal(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                {t("createFirstPlan")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePlanModal
        isOpen={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onPlanCreated={handlePlanCreated}
      />

      <EditPlanModal
        isOpen={showEditPlanModal}
        onClose={() => setShowEditPlanModal(false)}
        onPlanUpdated={handlePlanUpdated}
        plan={selectedPlan}
      />

      <PlanDetailsModal
        isOpen={showPlanDetailsModal}
        onClose={() => setShowPlanDetailsModal(false)}
        plan={selectedPlan}
      />

      <DeletePlanModal
        isOpen={showDeletePlanModal}
        onClose={() => setShowDeletePlanModal(false)}
        onPlanDeleted={handlePlanDeleted}
        plan={selectedPlan}
      />
    </div>
  );
}
