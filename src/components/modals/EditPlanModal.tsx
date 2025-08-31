"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

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
    strength?: string[];
    endurance?: string[];
    flexibility?: string[];
    nutrition?: string[];
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
}

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanUpdated: () => void;
  plan: Plan | null;
}

export default function EditPlanModal({
  isOpen,
  onClose,
  onPlanUpdated,
  plan,
}: EditPlanModalProps) {
  const t = useTranslations("plans.editPlanModal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "both" as "training" | "nutrition" | "both",
    status: "draft" as "active" | "inactive" | "draft",
    startDate: "",
    endDate: "",
    goals: {
      strength: [""],
      endurance: [""],
      flexibility: [""],
      nutrition: [""],
    },
  });

  // Aktualizuj formularz gdy plan się zmienia
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || "",
        type: plan.type,
        status: plan.status,
        startDate: plan.startDate.split("T")[0],
        endDate: plan.endDate ? plan.endDate.split("T")[0] : "",
        goals: {
          strength: plan.goals.strength?.length ? plan.goals.strength : [""],
          endurance: plan.goals.endurance?.length ? plan.goals.endurance : [""],
          flexibility: plan.goals.flexibility?.length
            ? plan.goals.flexibility
            : [""],
          nutrition: plan.goals.nutrition?.length ? plan.goals.nutrition : [""],
        },
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || !formData.name || !formData.type || !formData.startDate) {
      setError(t("validation.requiredFields"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/professional/plans/${plan._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          goals: {
            ...formData.goals,
            weight: plan.clientProfile?.weight || undefined,
            targetWeight: plan.clientProfile?.targetWeight || undefined,
          },
        }),
      });

      if (response.ok) {
        onPlanUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("error.updateFailed"));
      }
    } catch (error) {
      setError(t("error.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const addGoal = (type: keyof typeof formData.goals) => {
    if (type === "weight" || type === "targetWeight") return;
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [type]: [...prev.goals[type], ""],
      },
    }));
  };

  const removeGoal = (type: keyof typeof formData.goals, index: number) => {
    if (type === "weight" || type === "targetWeight") return;
    setFormData((prev) => ({
      ...prev,
      goals: {
        ...prev.goals,
        [type]: prev.goals[type].filter((_, i) => i !== index),
      },
    }));
  };

  const updateGoal = (
    type: keyof typeof formData.goals,
    index: number,
    value: string
  ) => {
    if (type === "weight" || type === "targetWeight") {
      setFormData((prev) => ({
        ...prev,
        goals: {
          ...prev.goals,
          [type]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        goals: {
          ...prev.goals,
          [type]: prev.goals[type].map((goal, i) =>
            i === index ? value : goal
          ),
        },
      }));
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("title")}
            </h2>
            <button
              onClick={onClose}
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Client Info (Read-only) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("clientInfo")}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {plan.client.name} ({plan.client.email})
            </p>
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("planName")}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("planNamePlaceholder")}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          {/* Plan Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("planType")}
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              required
            >
              <option value="training">{t("types.training")}</option>
              <option value="nutrition">{t("types.nutrition")}</option>
              <option value="both">{t("types.both")}</option>
            </select>
          </div>

          {/* Plan Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("planStatus")}
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as any,
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              required
            >
              <option value="draft">{t("statuses.draft")}</option>
              <option value="active">{t("statuses.active")}</option>
              <option value="inactive">{t("statuses.inactive")}</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("startDate")}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
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
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("description")}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Other Goals */}
          {["strength", "endurance", "flexibility", "nutrition"].map(
            (goalType) => (
              <div key={goalType}>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {t(`${goalType}Goals`)}
                  </label>
                  <button
                    type="button"
                    onClick={() => addGoal(goalType as any)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                  >
                    {t("addGoal")}
                  </button>
                </div>
                {formData.goals[goalType as keyof typeof formData.goals].map(
                  (goal, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) =>
                          updateGoal(goalType as any, index, e.target.value)
                        }
                        placeholder={t(`${goalType}GoalPlaceholder`)}
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeGoal(goalType as any, index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )
          )}

          {/* Note */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              {t("note.title")}
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {t("note.description")}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? t("updating") : t("update")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
