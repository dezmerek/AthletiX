"use client";

import { useTranslations } from "next-intl";
import { ClientProgress } from "./types";
import { getProgressColor, getTypeColor } from "./utils";

export default function ClientProgressTable({
  rows,
}: {
  rows: ClientProgress[];
}) {
  const t = useTranslations("analytics");

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
                {t("clientProgress.table.activity")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {t("clientProgress.table.lastActivity")}
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900 dark:text-white">
                    {client.workoutsCompleted} {t("clientProgress.workouts")}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {client.nutritionLogged} {t("clientProgress.meals")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {new Date(client.lastActivity).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
