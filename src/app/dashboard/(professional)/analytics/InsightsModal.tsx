"use client";

import { useTranslations } from "next-intl";
import { ClientProgress } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  rows: ClientProgress[];
}

export default function InsightsModal({ open, onClose, rows }: Props) {
  const t = useTranslations("analytics");
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Szczegółowe Analizy Klientów
          </h3>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rows.map((client) => (
            <div
              key={client.id}
              className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg"
            >
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                {client.name}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Typ planu:
                  </span>
                  <span className="font-medium">
                    {t(`types.${client.type}`)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Postęp:
                  </span>
                  <span className="font-medium">{client.progress}%</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Posiłki:
                  </span>
                  <span className="font-medium">{client.nutritionLogged}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">
                    Ostatnia aktywność:
                  </span>
                  <span className="font-medium">
                    {new Date(client.lastActivity)
                      .toISOString()
                      .split("T")[0]
                      .split("-")
                      .reverse()
                      .join("/")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
