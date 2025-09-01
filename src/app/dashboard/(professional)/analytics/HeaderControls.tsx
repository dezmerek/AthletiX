"use client";

import { useTranslations } from "next-intl";

interface Props {
  selectedPeriod: "7d" | "30d" | "90d" | "1y";
  setSelectedPeriod: (v: "7d" | "30d" | "90d" | "1y") => void;
  selectedMetric: "clients" | "progress" | "revenue";
  setSelectedMetric: (v: "clients" | "progress" | "revenue") => void;
}

export default function HeaderControls({
  selectedPeriod,
  setSelectedPeriod,
  selectedMetric,
  setSelectedMetric,
}: Props) {
  const t = useTranslations("analytics");

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {t("description")}
        </p>
      </div>
      <div className="flex space-x-2">
        <select
          value={selectedPeriod}
          onChange={(e) =>
            setSelectedPeriod(e.target.value as "7d" | "30d" | "90d" | "1y")
          }
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
        >
          <option value="7d">{t("periods.7d")}</option>
          <option value="30d">{t("periods.30d")}</option>
          <option value="90d">{t("periods.90d")}</option>
          <option value="1y">{t("periods.1y")}</option>
        </select>
        <select
          value={selectedMetric}
          onChange={(e) =>
            setSelectedMetric(
              e.target.value as "clients" | "progress" | "revenue"
            )
          }
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
        >
          <option value="clients">{t("metrics.clients")}</option>
          <option value="progress">{t("metrics.progress")}</option>
          <option value="revenue">{t("metrics.revenue")}</option>
        </select>
      </div>
    </div>
  );
}
