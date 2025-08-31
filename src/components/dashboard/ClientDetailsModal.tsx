"use client";

import { useTranslations } from "next-intl";

interface Client {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  type: "nutrition" | "training" | "both";
  lastActivity?: string;
  progress?: {
    weight?: number;
    targetWeight?: number;
    workoutsCompleted: number;
    nutritionLogged: number;
  };
  nextSession?: string;
  addedAt: string;
  notes?: string;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientDetailsModal({
  isOpen,
  onClose,
  client,
}: ClientDetailsModalProps) {
  const t = useTranslations("clients");

  if (!isOpen || !client) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "pending":
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
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-blue-400";
      case "both":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("details.title")} - {client.name}
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

          {/* Content */}
          <div className="p-6">
            {/* Client Info */}
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                {client.avatar ? (
                  <img
                    src={client.avatar}
                    alt={client.name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 font-medium text-xl">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {client.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {client.email}
                </p>
              </div>
            </div>

            {/* Status and Type */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("details.status")}
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    client.status
                  )}`}
                >
                  {t(`statuses.${client.status}`)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("details.clientType")}
                </label>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(
                    client.type
                  )}`}
                >
                  {t(`types.${client.type}`)}
                </span>
              </div>
            </div>

            {/* Progress */}
            {client.progress && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t("details.progress")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {client.progress.workoutsCompleted}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t("progress.workouts")}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {client.progress.nutritionLogged}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t("progress.meals")}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t("details.notes")}
              </h4>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 min-h-[100px]">
                {client.notes ? (
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">
                    {t("details.noNotes")}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("details.addedDate")}
                </label>
                <p className="text-slate-600 dark:text-slate-400">
                  {new Date(client.addedAt).toLocaleDateString()}
                </p>
              </div>
              {client.nextSession && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t("details.nextSession")}
                  </label>
                  <p className="text-slate-600 dark:text-slate-400">
                    {new Date(client.nextSession).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              {t("details.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
