"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ClientProgress } from "./types";
import { getProgressColor, getTypeColor } from "./utils";
import ClientProgressView from "@/components/dashboard/ClientProgressView";
import ClientNutritionView from "@/components/dashboard/ClientNutritionView";

// Modal dla postępów klienta - używający komponentu
function ClientProgressModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProgress | null;
}) {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Postęp klienta: {client.name}
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

        {/* Użyj komponentu ClientProgressView z danymi o treningach */}
        <ClientProgressView
          clientId={client.id}
          clientName={client.name}
          showHeader={false}
          lastWorkouts={client.lastWorkouts}
        />
      </div>
    </div>
  );
}

// Modal dla żywienia klienta - używający komponentu
function ClientNutritionModal({
  isOpen,
  onClose,
  client,
}: {
  isOpen: boolean;
  onClose: () => void;
  client: ClientProgress | null;
}) {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Żywienie klienta: {client.name}
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

        {/* Użyj komponentu ClientNutritionView */}
        <ClientNutritionView
          clientId={client.id}
          clientName={client.name}
          showHeader={false}
        />
      </div>
    </div>
  );
}

export default function ClientProgressTable({
  rows,
}: {
  rows: ClientProgress[];
}) {
  const t = useTranslations("analytics");
  const [selectedClient, setSelectedClient] = useState<ClientProgress | null>(
    null
  );
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);

  const handleClientProgressClick = (client: ClientProgress) => {
    setSelectedClient(client);
    setShowProgressModal(true);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setSelectedClient(null);
  };

  const handleClientNutritionClick = (client: ClientProgress) => {
    setSelectedClient(client);
    setShowNutritionModal(true);
  };

  const handleCloseNutritionModal = () => {
    setShowNutritionModal(false);
    setSelectedClient(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("clientProgress.title")}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {t("clientProgress.description")}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("clientProgress.table.client")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("clientProgress.table.type")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("clientProgress.table.weight")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("clientProgress.table.progress")}
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("clientProgress.table.lastActivity")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {rows.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {client.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                      client.type
                    )}`}
                  >
                    {t(`types.${client.type}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {client.startWeight}kg → {client.currentWeight}kg
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Cel: {client.targetWeight}kg
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                          client.progress
                        ).replace("text-", "bg-")}`}
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${getProgressColor(
                        client.progress
                      )}`}
                    >
                      {client.progress}%
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {new Date(client.lastActivity).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleClientProgressClick(client)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Zobacz postęp klienta"
                    >
                      <svg
                        className="w-4 h-4"
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
                    </button>
                    <button
                      onClick={() => handleClientNutritionClick(client)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      title="Zobacz żywienie klienta"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale */}
      <ClientProgressModal
        isOpen={showProgressModal}
        onClose={handleCloseProgressModal}
        client={selectedClient}
      />
      <ClientNutritionModal
        isOpen={showNutritionModal}
        onClose={handleCloseNutritionModal}
        client={selectedClient}
      />
    </div>
  );
}
