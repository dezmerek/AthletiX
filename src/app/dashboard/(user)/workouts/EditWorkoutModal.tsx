"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Exercise {
  id: string;
  name: string;
  nameEn?: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
}

interface EditWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: {
    id: string;
    name: string;
    nameEn?: string;
    date: string;
    type: string;
    exercises: Exercise[];
  } | null;
  onUpdate: (
    workoutId: string,
    updatedData: {
      name: string;
      nameEn?: string;
      date: string;
      type: string;
      exercises: Exercise[];
    }
  ) => void;
}

export default function EditWorkoutModal({
  isOpen,
  onClose,
  workout,
  onUpdate,
}: EditWorkoutModalProps) {
  const t = useTranslations("workouts");

  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planType, setPlanType] = useState("strength");
  const [planExercises, setPlanExercises] = useState<Exercise[]>([]);
  const [editingExercises, setEditingExercises] = useState<boolean[]>([]);
  const [newExercise, setNewExercise] = useState<Exercise>({
    id: "",
    name: "",
    sets: 3,
    reps: 10,
    weight: undefined,
    duration: undefined,
    restTime: 60,
    notes: "",
  });

  // Initialize form when workout changes
  useEffect(() => {
    if (workout) {
      setPlanName(workout.name);
      setPlanDate(workout.date);
      setPlanType(workout.type);
      setPlanExercises(workout.exercises);
      setEditingExercises(new Array(workout.exercises.length).fill(false));
    }
  }, [workout]);

  const toggleExerciseEdit = (index: number) => {
    const updated = [...editingExercises];
    updated[index] = !updated[index];
    setEditingExercises(updated);
  };

  const removeExercise = (index: number) => {
    const updated = planExercises.filter((_, i) => i !== index);
    setPlanExercises(updated);
    const updatedEditing = editingExercises.filter((_, i) => i !== index);
    setEditingExercises(updatedEditing);
  };

  const addExercise = () => {
    if (newExercise.name.trim()) {
      setPlanExercises([
        ...planExercises,
        { ...newExercise, id: Date.now().toString() },
      ]);
      setNewExercise({
        id: "",
        name: "",
        sets: 3,
        reps: 10,
        weight: undefined,
        duration: undefined,
        restTime: 60,
        notes: "",
      });
    }
  };

  const handleUpdate = () => {
    if (workout) {
      onUpdate(workout.id, {
        name: planName,
        date: planDate,
        type: planType,
        exercises: planExercises,
      });
      onClose();
    }
  };

  if (!isOpen || !workout) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl shadow-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          {t("actions.editWorkout")}
        </h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Workout Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-slate-600 dark:text-slate-300">
                {t("workout.name")}
              </label>
              <input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder={t("workout.name")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-300">
                  {t("workout.plannedFor")}
                </label>
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-slate-600 dark:text-slate-300">
                  {t("workout.type")}
                </label>
                <select
                  value={planType}
                  onChange={(e) =>
                    setPlanType(
                      e.target.value as
                        | "strength"
                        | "cardio"
                        | "flexibility"
                        | "mixed"
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="strength">{t("types.strength")}</option>
                  <option value="cardio">{t("types.cardio")}</option>
                  <option value="flexibility">{t("types.flexibility")}</option>
                  <option value="mixed">{t("types.mixed")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column - Exercises */}
          <div className="space-y-4">
            {/* Exercise List */}
            {planExercises.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-medium text-slate-700 dark:text-slate-300">
                    {t("workout.exercises")} ({planExercises.length})
                  </h4>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {planExercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                    >
                      {editingExercises[index] ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              value={exercise.name}
                              onChange={(e) => {
                                const updated = [...planExercises];
                                updated[index] = {
                                  ...updated[index],
                                  name: e.target.value,
                                };
                                setPlanExercises(updated);
                              }}
                              className="flex-1 text-sm font-medium text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-500 focus:border-blue-500 dark:focus:border-blue-400 px-1 py-1"
                              placeholder={t("workout.exerciseName")}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleExerciseEdit(index)}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title={t("actions.save")}
                              >
                                💾
                              </button>
                              <button
                                onClick={() => removeExercise(index)}
                                className="p-1 text-red-500 hover:text-red-700"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {t("workout.sets")}
                              </label>
                              <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => {
                                  const updated = [...planExercises];
                                  updated[index] = {
                                    ...updated[index],
                                    sets: parseInt(e.target.value) || 0,
                                  };
                                  setPlanExercises(updated);
                                }}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                min="1"
                                max="20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {t("workout.reps")}
                              </label>
                              <input
                                type="number"
                                value={exercise.reps}
                                onChange={(e) => {
                                  const updated = [...planExercises];
                                  updated[index] = {
                                    ...updated[index],
                                    reps: parseInt(e.target.value) || 0,
                                  };
                                  setPlanExercises(updated);
                                }}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                min="1"
                                max="200"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {t("workout.weight")}
                              </label>
                              <input
                                type="number"
                                value={exercise.weight || ""}
                                onChange={(e) => {
                                  const updated = [...planExercises];
                                  updated[index] = {
                                    ...updated[index],
                                    weight: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  };
                                  setPlanExercises(updated);
                                }}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="kg"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                                {t("workout.duration")}
                              </label>
                              <input
                                type="number"
                                value={exercise.duration || ""}
                                onChange={(e) => {
                                  const updated = [...planExercises];
                                  updated[index] = {
                                    ...updated[index],
                                    duration: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  };
                                  setPlanExercises(updated);
                                }}
                                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                placeholder="min"
                                min="0"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                              {t("workout.notes")}
                            </label>
                            <input
                              value={exercise.notes || ""}
                              onChange={(e) => {
                                const updated = [...planExercises];
                                updated[index] = {
                                  ...updated[index],
                                  notes: e.target.value,
                                };
                                setPlanExercises(updated);
                              }}
                              className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                              placeholder={t("workout.notes")}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {exercise.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {exercise.sets} {t("workout.sets")} ×{" "}
                                {exercise.reps} {t("workout.reps")}
                                {exercise.weight &&
                                  ` @ ${exercise.weight}${t("workout.weight")}`}
                                {exercise.duration &&
                                  ` ${exercise.duration}${t(
                                    "workout.duration"
                                  )}`}
                                {exercise.notes && ` • ${exercise.notes}`}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleExerciseEdit(index)}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title={t("actions.edit")}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => removeExercise(index)}
                                className="p-1 text-red-500 hover:text-red-700"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Exercise Form */}
            <div className="mt-6 p-4 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800">
              <h4 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t("actions.addExercise")}
              </h4>
              <div className="space-y-3">
                <input
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder={t("workout.exerciseName")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t("workout.sets")}
                    </label>
                    <input
                      type="number"
                      value={newExercise.sets}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          sets: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="3"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t("workout.reps")}
                    </label>
                    <input
                      type="number"
                      value={newExercise.reps}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          reps: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="10"
                      min="1"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t("workout.weight")}
                    </label>
                    <input
                      type="number"
                      value={newExercise.weight || ""}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          weight: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="70"
                      min="0"
                      max="500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      {t("workout.duration")}
                    </label>
                    <input
                      type="number"
                      value={newExercise.duration || ""}
                      onChange={(e) =>
                        setNewExercise((prev) => ({
                          ...prev,
                          duration: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      placeholder="min"
                      min="0"
                    />
                  </div>
                </div>
                <input
                  value={newExercise.notes || ""}
                  onChange={(e) =>
                    setNewExercise((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder={t("workout.notes")}
                />
                <button
                  onClick={addExercise}
                  disabled={!newExercise.name}
                  className="w-full px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg transition-colors duration-200"
                >
                  {t("actions.addExercise")}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleUpdate}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            {t("actions.update")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            {t("actions.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
