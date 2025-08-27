"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { WaterIntake } from "../types/nutrition";

interface WaterTrackerProps {
  waterIntake: WaterIntake;
  onAddWater: () => void;
  onResetWater?: () => void;
  onSetGoal?: (goal: number) => void;
}

export default function WaterTracker({
  waterIntake,
  onAddWater,
  onResetWater,
  onSetGoal,
}: WaterTrackerProps) {
  const t = useTranslations("nutrition");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [newGoal, setNewGoal] = useState(waterIntake.goal);

  const handleSetGoal = () => {
    if (onSetGoal && newGoal > 0) {
      onSetGoal(newGoal);
      setShowGoalInput(false);
    }
  };

  // Calculate number of glasses based on current intake (250ml per glass)
  const glassesCount = Math.floor(waterIntake.current / 250);
  const goalGlasses = Math.ceil(waterIntake.goal / 250);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
          <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
          </div>
          {t("waterTracker.title")}
        </h3>
        <div className="flex space-x-2">
          {onResetWater && (
            <button
              onClick={onResetWater}
              className="px-2 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs font-medium"
              title={t("actions.reset")}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          )}
          <button
            onClick={onAddWater}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {t("waterTracker.addGlass")}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {t("waterTracker.currentIntake")}
          </span>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-slate-900 dark:text-white">
              {waterIntake.current}ml / {waterIntake.goal}ml
            </span>
            {onSetGoal && (
              <button
                onClick={() => setShowGoalInput(!showGoalInput)}
                className="text-cyan-600 hover:text-cyan-700 text-xs"
                title={t("actions.edit")}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
          {glassesCount} szklanek po 250ml
        </div>

        {showGoalInput && onSetGoal && (
          <div className="flex space-x-2">
            <input
              type="number"
              min="250"
              step="250"
              value={newGoal}
              onChange={(e) => setNewGoal(parseInt(e.target.value) || 250)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
              placeholder="Cel w ml (np. 2000)"
            />
            <button
              onClick={handleSetGoal}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
            >
              {t("actions.save")}
            </button>
            <button
              onClick={() => setShowGoalInput(false)}
              className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
            >
              {t("actions.cancel")}
            </button>
          </div>
        )}

        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(
                (waterIntake.current / waterIntake.goal) * 100,
                100
              )}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: goalGlasses }, (_, i) => (
            <div
              key={i}
              className={`h-8 rounded-lg border-2 flex items-center justify-center ${
                i < glassesCount
                  ? "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-600"
                  : "bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600"
              }`}
            >
              <svg
                className={`w-4 h-4 ${
                  i < glassesCount
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.8 5.82 22 7 13.87 2 9l6.91-.74L12 2z" />
              </svg>
            </div>
          ))}
        </div>

        {waterIntake.current >= waterIntake.goal && (
          <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
            🎉 {t("waterTracker.completed")}
          </div>
        )}
      </div>
    </div>
  );
}
