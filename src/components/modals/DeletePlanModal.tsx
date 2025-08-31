"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Plan {
  _id: string;
  name: string;
  client: {
    name: string;
  };
}

interface DeletePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanDeleted: () => void;
  plan: Plan | null;
}

export default function DeletePlanModal({
  isOpen,
  onClose,
  onPlanDeleted,
  plan,
}: DeletePlanModalProps) {
  const t = useTranslations("plans.deleteModal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !plan) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/professional/plans/${plan._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onPlanDeleted();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("error.deleteFailed"));
      }
    } catch (error) {
      setError(t("error.deleteFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("title")}
          </h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("description")}
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                {plan.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("client")}: {plan.client.name}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? t("deleting") : t("delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
