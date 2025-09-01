"use client";

import { useState, useEffect } from "react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Workout {
  id: string;
  date: string;
  type: string;
  duration: number;
  caloriesBurned: number;
  exercises: Exercise[];
}

interface WeightEntry {
  date: string;
  weight: number;
  notes?: string;
}

interface Measurement {
  date: string;
  chest: number;
  waist: number;
  hips: number;
  arms: number;
  thighs: number;
}

interface ClientProgressData {
  workouts: Workout[];
  weightHistory: WeightEntry[];
  measurements: Measurement[];
  currentWeight?: number;
  targetWeight?: number;
}

interface ClientProgressViewProps {
  clientId: string;
  clientName: string;
  className?: string;
  showHeader?: boolean;
}

export default function ClientProgressView({
  clientId,
  clientName,
  className = "",
  showHeader = true,
}: ClientProgressViewProps) {
  const [progressData, setProgressData] = useState<ClientProgressData | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientProgress(clientId);
    }
  }, [clientId]);

  const fetchClientProgress = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/professional/clients/${clientId}/progress`
      );
      if (response.ok) {
        const data = await response.json();
        setProgressData(data);
      }
    } catch (error) {
      console.error("Error fetching client progress:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header (opcjonalny) */}
      {showHeader && (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Postęp: {clientName}
          </h3>
        </div>
      )}

      {/* Aktualna waga i cel */}
      {(progressData?.currentWeight || progressData?.targetWeight) && (
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
            🎯 Aktualna waga i cel
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progressData.currentWeight || "—"}kg
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Aktualna waga
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progressData.targetWeight || "—"}kg
              </div>
              <div className="text-slate-600 dark:text-slate-400">Cel wagi</div>
            </div>
          </div>
          {progressData.currentWeight && progressData.targetWeight && (
            <div className="mt-3 text-center">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Różnica:{" "}
                {Math.abs(
                  progressData.currentWeight - progressData.targetWeight
                )}
                kg
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {progressData.currentWeight > progressData.targetWeight
                  ? "Do zrzucenia"
                  : "Do przytycia"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historia wag */}
      {progressData?.weightHistory && progressData.weightHistory.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
            📊 Historia wag (ostatnie 10 pomiarów)
          </h4>
          <div className="space-y-2">
            {progressData.weightHistory
              .slice(-10)
              .reverse()
              .map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm p-2 bg-white dark:bg-slate-600 rounded"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(entry.date).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {entry.weight}kg
                  </span>
                  {entry.notes && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {entry.notes}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Ostatnie treningi */}
      {progressData?.workouts && progressData.workouts.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
            💪 Ostatnie treningi (ostatnie 5)
          </h4>
          <div className="space-y-3">
            {progressData.workouts
              .slice(-5)
              .reverse()
              .map((workout, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-3 bg-white dark:bg-slate-600 p-3 rounded"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {workout.type}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(workout.date).toLocaleDateString("pl-PL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-600 dark:text-slate-400">
                      <div className="font-medium">{workout.duration} min</div>
                      <div>{workout.caloriesBurned} kcal</div>
                    </div>
                  </div>
                  {workout.exercises && workout.exercises.length > 0 && (
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Ćwiczenia: {workout.exercises.length}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pomiary */}
      {progressData?.measurements && progressData.measurements.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
            📏 Pomiary ciała (ostatnie 5 pomiarów)
          </h4>
          <div className="space-y-3">
            {progressData.measurements
              .slice(-5)
              .reverse()
              .map((measurement, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-600 p-3 rounded"
                >
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {new Date(measurement.date).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {measurement.chest}cm
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Klatka
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {measurement.waist}cm
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Talia
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {measurement.hips}cm
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Biodra
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {measurement.arms}cm
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Ręce
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {measurement.thighs}cm
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Uda
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Brak danych */}
      {(!progressData?.workouts || progressData.workouts.length === 0) &&
        (!progressData?.weightHistory ||
          progressData.weightHistory.length === 0) &&
        (!progressData?.measurements ||
          progressData.measurements.length === 0) && (
          <div className="bg-slate-50 dark:bg-slate-700 p-8 rounded-lg text-center">
            <div className="text-slate-500 dark:text-slate-400">
              Brak danych o postępach dla tego klienta
            </div>
          </div>
        )}
    </div>
  );
}
