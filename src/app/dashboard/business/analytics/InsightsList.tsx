"use client";

import React from "react";

type Insight = {
  id: string;
  type: "positive" | "warning" | "info";
  title: string;
  description: string;
  impact: string;
  recommendation: string;
};

export default function InsightsList({
  insights,
  getInsightIcon,
}: {
  insights: Insight[];
  getInsightIcon: (t: Insight["type"]) => React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Wnioski biznesowe
        </h2>
        <button
          onClick={async () => {
            try {
              const res = await fetch("/api/business/analytics/export/pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ insights }),
              });
              if (!res.ok) throw new Error("Błąd generowania PDF");
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "raport_wnioski.pdf";
              a.click();
              URL.revokeObjectURL(url);
            } catch (e) {
              console.error(e);
              alert("Nie udało się wygenerować raportu.");
            }
          }}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Generuj raport
        </button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
          >
            {getInsightIcon(insight.type)}
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                {insight.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {insight.description}
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  <strong>Wpływ:</strong> {insight.impact}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  <strong>Rekomendacja:</strong> {insight.recommendation}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500 dark:text-slate-400">
            Brak dostępnych wniosków
          </p>
        </div>
      )}
    </div>
  );
}
