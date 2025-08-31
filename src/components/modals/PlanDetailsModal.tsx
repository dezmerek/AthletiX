"use client";

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
  createdAt: string;
  updatedAt: string;
}

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

export default function PlanDetailsModal({
  isOpen,
  onClose,
  plan,
}: PlanDetailsModalProps) {
  const t = useTranslations("plans.details");

  if (!isOpen || !plan) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              {plan.description && (
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {plan.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(
                  plan.type
                )}`}
              >
                {t(`types.${plan.type}`)}
              </span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                  plan.status
                )}`}
              >
                {t(`statuses.${plan.status}`)}
              </span>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("clientInfo")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("clientName")}
                </h5>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {plan.client.name}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {plan.client.email}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("clientType")}
                </h5>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {t(`types.${plan.type}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("dates")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("startDate")}
                </h5>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {new Date(plan.startDate).toLocaleDateString()}
                </p>
              </div>
              {plan.endDate && (
                <div>
                  <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("endDate")}
                  </h5>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {new Date(plan.endDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("goals")}
            </h4>

            {/* Weight Goals */}
            {(plan.goals.weight || plan.goals.targetWeight) && (
              <div className="mb-6">
                <h5 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t("weightGoals")}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.goals.weight && (
                    <div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {t("currentWeight")}:
                      </span>
                      <span className="ml-2 font-medium text-slate-900 dark:text-white">
                        {plan.goals.weight} kg
                      </span>
                    </div>
                  )}
                  {plan.goals.targetWeight && (
                    <div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {t("targetWeight")}:
                      </span>
                      <span className="ml-2 font-medium text-slate-900 dark:text-white">
                        {plan.goals.targetWeight} kg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Other Goals */}
            {["strength", "endurance", "flexibility", "nutrition"].map(
              (goalType) => {
                const goals = plan.goals[goalType as keyof typeof plan.goals];
                if (
                  !goals ||
                  goals.length === 0 ||
                  (goals.length === 1 && goals[0] === "")
                ) {
                  return null;
                }

                return (
                  <div key={goalType} className="mb-4">
                    <h5 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t(`${goalType}Goals`)}
                    </h5>
                    <ul className="list-disc list-inside space-y-1">
                      {goals.map((goal, index) => (
                        <li
                          key={index}
                          className="text-slate-600 dark:text-slate-400"
                        >
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
            )}
          </div>

          {/* Current Progress */}
          {plan.clientProfile && (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {t("currentProgress")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("currentWeight")}
                  </h5>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {plan.clientProfile.weight
                      ? `${plan.clientProfile.weight} kg`
                      : t("notSet")}
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {t("targetWeight")}
                  </h5>
                  <p className="text-lg font-medium text-slate-900 dark:text-white">
                    {plan.clientProfile.targetWeight
                      ? `${plan.clientProfile.targetWeight} kg`
                      : t("notSet")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("timestamps")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("created")}
                </h5>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {t("updated")}
                </h5>
                <p className="text-lg font-medium text-slate-900 dark:text-white">
                  {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

