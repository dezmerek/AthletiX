"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Client {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: any) => void;
}

export default function CreatePlanModal({
  isOpen,
  onClose,
  onPlanCreated,
}: CreatePlanModalProps) {
  const t = useTranslations("plans.createPlanModal");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [planType, setPlanType] = useState<"training" | "nutrition" | "both">(
    "both"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Goals
  const [targetWeight, setTargetWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [strengthGoals, setStrengthGoals] = useState<string[]>([""]);
  const [enduranceGoals, setEnduranceGoals] = useState<string[]>([""]);
  const [flexibilityGoals, setFlexibilityGoals] = useState<string[]>([""]);
  const [nutritionGoals, setNutritionGoals] = useState<string[]>([""]);

  // Pobierz listę klientów
  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/professional/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const resetForm = () => {
    setSelectedClientId("");
    setPlanName("");
    setDescription("");
    setPlanType("both");
    setStartDate("");
    setEndDate("");
    setTargetWeight("");
    setCurrentWeight("");
    setStrengthGoals([""]);
    setEnduranceGoals([""]);
    setFlexibilityGoals([""]);
    setNutritionGoals([""]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addGoal = (goals: string[], setGoals: (goals: string[]) => void) => {
    setGoals([...goals, ""]);
  };

  const removeGoal = (
    goals: string[],
    setGoals: (goals: string[]) => void,
    index: number
  ) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
    }
  };

  const updateGoal = (
    goals: string[],
    setGoals: (goals: string[]) => void,
    index: number,
    value: string
  ) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const createPlan = async () => {
    if (!selectedClientId || !planName || !startDate) {
      setError(t("validation.requiredFields"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Przygotuj cele
      const goals = {
        weight: currentWeight ? parseFloat(currentWeight) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        strength: strengthGoals.filter((goal) => goal.trim() !== ""),
        endurance: enduranceGoals.filter((goal) => goal.trim() !== ""),
        flexibility: flexibilityGoals.filter((goal) => goal.trim() !== ""),
        nutrition: nutritionGoals.filter((goal) => goal.trim() !== ""),
      };

      const planData = {
        clientId: selectedClientId,
        name: planName,
        description: description.trim() || undefined,
        type: planType,
        startDate,
        endDate: endDate.trim() || undefined,
        goals,
      };

      const response = await fetch("/api/professional/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        const data = await response.json();
        onPlanCreated(data.plan);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("error.createFailed"));
      }
    } catch (error) {
      setError(t("error.createFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("client")} *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                required
              >
                <option value="">{t("selectClient")}</option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name} ({client.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("planName")} *
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                placeholder={t("planNamePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("planType")} *
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              >
                <option value="both">{t("types.both")}</option>
                <option value="training">{t("types.training")}</option>
                <option value="nutrition">{t("types.nutrition")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("startDate")} *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("endDate")}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                min={startDate}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>

          {/* Weight Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("currentWeight")} (kg)
              </label>
              <input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                placeholder="70"
                step="0.1"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("targetWeight")} (kg)
              </label>
              <input
                type="number"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                placeholder="65"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          {/* Goals Sections */}
          <div className="space-y-6">
            {/* Strength Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {t("strengthGoals")}
                </h3>
                <button
                  type="button"
                  onClick={() => addGoal(strengthGoals, setStrengthGoals)}
                  className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  {t("addGoal")}
                </button>
              </div>
              <div className="space-y-2">
                {strengthGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        updateGoal(
                          strengthGoals,
                          setStrengthGoals,
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder={t("strengthGoalPlaceholder")}
                    />
                    {strengthGoals.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeGoal(strengthGoals, setStrengthGoals, index)
                        }
                        className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Endurance Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {t("enduranceGoals")}
                </h3>
                <button
                  type="button"
                  onClick={() => addGoal(enduranceGoals, setEnduranceGoals)}
                  className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  {t("addGoal")}
                </button>
              </div>
              <div className="space-y-2">
                {enduranceGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        updateGoal(
                          enduranceGoals,
                          setEnduranceGoals,
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder={t("enduranceGoalPlaceholder")}
                    />
                    {enduranceGoals.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeGoal(enduranceGoals, setEnduranceGoals, index)
                        }
                        className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Flexibility Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {t("flexibilityGoals")}
                </h3>
                <button
                  type="button"
                  onClick={() => addGoal(flexibilityGoals, setFlexibilityGoals)}
                  className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  {t("addGoal")}
                </button>
              </div>
              <div className="space-y-2">
                {flexibilityGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        updateGoal(
                          flexibilityGoals,
                          setFlexibilityGoals,
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder={t("flexibilityGoalPlaceholder")}
                    />
                    {flexibilityGoals.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeGoal(
                            flexibilityGoals,
                            setFlexibilityGoals,
                            index
                          )
                        }
                        className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nutrition Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {t("nutritionGoals")}
                </h3>
                <button
                  type="button"
                  onClick={() => addGoal(nutritionGoals, setNutritionGoals)}
                  className="px-3 py-1 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  {t("addGoal")}
                </button>
              </div>
              <div className="space-y-2">
                {nutritionGoals.map((goal, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        updateGoal(
                          nutritionGoals,
                          setNutritionGoals,
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      placeholder={t("nutritionGoalPlaceholder")}
                    />
                    {nutritionGoals.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeGoal(nutritionGoals, setNutritionGoals, index)
                        }
                        className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            disabled={isLoading}
          >
            {t("cancel")}
          </button>
          <button
            onClick={createPlan}
            disabled={isLoading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-colors font-medium"
          >
            {isLoading ? t("creating") : t("create")}
          </button>
        </div>
      </div>
    </div>
  );
}

