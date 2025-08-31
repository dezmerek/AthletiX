"use client";

import { useState, useEffect } from "react";
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

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: (updatedClient: Client) => void;
}

export default function EditClientModal({
  isOpen,
  onClose,
  client,
  onClientUpdated,
}: EditClientModalProps) {
  const t = useTranslations("clients");
  const [clientType, setClientType] = useState<
    "nutrition" | "training" | "both"
  >("both");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(
    "active"
  );
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  // Inicjalizuj formularz gdy klient się zmieni
  useEffect(() => {
    if (client) {
      setClientType(client.type);
      setStatus(client.status);
      setNotes(client.notes || "");
    }
  }, [client]);

  const handleSubmit = async () => {
    if (!client) return;

    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(`/api/professional/clients/${client._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: clientType,
          status,
          notes: notes.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onClientUpdated(data.client);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update client");
      }
    } catch (error) {
      setError("Error updating client");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("editClientModal.title")}
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
          {/* Client Info */}
          <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
              {client.avatar ? (
                <img
                  src={client.avatar}
                  alt={client.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <span className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-slate-900 dark:text-white">
                {client.name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {client.email}
              </div>
            </div>
          </div>

          {/* Client Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("editClientModal.clientType")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["nutrition", "training", "both"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setClientType(type)}
                  className={`p-3 border rounded-lg transition-colors ${
                    clientType === type
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {t(`types.${type}`)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("editClientModal.status")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["active", "inactive", "pending"] as const).map(
                (statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => setStatus(statusOption)}
                    className={`p-3 border rounded-lg transition-colors ${
                      status === statusOption
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {t(`statuses.${statusOption}`)}
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("editClientModal.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("editClientModal.notesPlaceholder")}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t("editClientModal.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
          >
            {isUpdating
              ? t("editClientModal.updating")
              : t("editClientModal.update")}
          </button>
        </div>
      </div>
    </div>
  );
}
