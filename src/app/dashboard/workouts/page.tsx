"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // for cardio exercises in minutes
  restTime?: number; // rest time in seconds
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  date: string;
  type: "strength" | "cardio" | "flexibility" | "mixed";
  duration: number; // total workout duration in minutes
  exercises: Exercise[];
  notes?: string;
  status: "planned" | "in-progress" | "completed";
}

interface WorkoutTemplate {
  id: string;
  name: string;
  type: "strength" | "cardio" | "flexibility" | "mixed";
  exercises: Omit<Exercise, "id">[];
  estimatedDuration: number;
}

export default function WorkoutsPage() {
  const t = useTranslations("workouts");

  // Mock data - w prawdziwej aplikacji to będzie z API
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: "1",
      name: "Push Day - Klatka, ramiona, triceps",
      date: "2025-06-04",
      type: "strength",
      duration: 75,
      status: "completed",
      exercises: [
        {
          id: "1",
          name: "Wyciskanie sztangi na ławce płaskiej",
          sets: 4,
          reps: 8,
          weight: 80,
          restTime: 120,
        },
        {
          id: "2",
          name: "Pompki na poręczach",
          sets: 3,
          reps: 12,
          restTime: 90,
        },
        {
          id: "3",
          name: "Wyciskanie hantli nad głową",
          sets: 3,
          reps: 10,
          weight: 25,
          restTime: 90,
        },
        {
          id: "4",
          name: "Rozpiętki na ławce skośnej",
          sets: 3,
          reps: 12,
          weight: 15,
          restTime: 60,
        },
      ],
    },
    {
      id: "2",
      name: "Cardio - Bieganie",
      date: "2025-06-03",
      type: "cardio",
      duration: 45,
      status: "completed",
      exercises: [
        {
          id: "5",
          name: "Bieganie",
          sets: 1,
          reps: 1,
          duration: 45,
          notes: "Tempo 6:00/km, dystans 7.5km",
        },
      ],
    },
    {
      id: "3",
      name: "Pull Day - Plecy, biceps",
      date: "2025-06-02",
      type: "strength",
      duration: 80,
      status: "completed",
      exercises: [
        {
          id: "6",
          name: "Podciąganie na drążku",
          sets: 4,
          reps: 8,
          restTime: 120,
        },
        {
          id: "7",
          name: "Wiosłowanie sztangą",
          sets: 4,
          reps: 10,
          weight: 70,
          restTime: 90,
        },
        {
          id: "8",
          name: "Uginanie ramion ze sztangą",
          sets: 3,
          reps: 12,
          weight: 30,
          restTime: 60,
        },
      ],
    },
    {
      id: "4",
      name: "Legs Day - Nogi",
      date: "2025-06-06",
      type: "strength",
      duration: 0,
      status: "planned",
      exercises: [
        {
          id: "9",
          name: "Przysiady ze sztangą",
          sets: 4,
          reps: 10,
          weight: 90,
          restTime: 180,
        },
        {
          id: "10",
          name: "Martwy ciąg",
          sets: 4,
          reps: 8,
          weight: 100,
          restTime: 180,
        },
        {
          id: "11",
          name: "Wypady z hantlami",
          sets: 3,
          reps: 12,
          weight: 20,
          restTime: 90,
        },
      ],
    },
  ]);

  const [workoutTemplates] = useState<WorkoutTemplate[]>([
    {
      id: "1",
      name: "Push Day",
      type: "strength",
      estimatedDuration: 75,
      exercises: [
        {
          name: "Wyciskanie sztangi na ławce płaskiej",
          sets: 4,
          reps: 8,
          weight: 80,
          restTime: 120,
        },
        {
          name: "Pompki na poręczach",
          sets: 3,
          reps: 12,
          restTime: 90,
        },
        {
          name: "Wyciskanie hantli nad głową",
          sets: 3,
          reps: 10,
          weight: 25,
          restTime: 90,
        },
      ],
    },
    {
      id: "2",
      name: "Pull Day",
      type: "strength",
      estimatedDuration: 80,
      exercises: [
        {
          name: "Podciąganie na drążku",
          sets: 4,
          reps: 8,
          restTime: 120,
        },
        {
          name: "Wiosłowanie sztangą",
          sets: 4,
          reps: 10,
          weight: 70,
          restTime: 90,
        },
        {
          name: "Uginanie ramion ze sztangą",
          sets: 3,
          reps: 12,
          weight: 30,
          restTime: 60,
        },
      ],
    },
    {
      id: "3",
      name: "Cardio Base",
      type: "cardio",
      estimatedDuration: 45,
      exercises: [
        {
          name: "Bieganie",
          sets: 1,
          reps: 1,
          duration: 45,
        },
      ],
    },
  ]);

  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState<
    "recent" | "planned" | "templates"
  >("recent");

  // Statistics calculations
  const completedWorkouts = workouts.filter((w) => w.status === "completed");
  const totalWorkouts = completedWorkouts.length;
  const totalDuration = completedWorkouts.reduce(
    (sum, w) => sum + w.duration,
    0
  );
  const avgDuration =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
  const thisWeekWorkouts = completedWorkouts.filter((w) => {
    const workoutDate = new Date(w.date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return workoutDate >= weekAgo && workoutDate <= today;
  }).length;

  const handleStartWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: template.name,
      date: new Date().toISOString().split("T")[0],
      type: template.type,
      duration: 0,
      status: "in-progress",
      exercises: template.exercises.map((exercise, index) => ({
        ...exercise,
        id: `${Date.now()}-${index}`,
      })),
    };
    setWorkouts((prev) => [newWorkout, ...prev]);
    setCurrentWorkout(newWorkout);
    setShowTemplateModal(false);
  };

  const handleCompleteWorkout = (workoutId: string, duration: number) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === workoutId
          ? { ...w, status: "completed" as const, duration }
          : w
      )
    );
    setCurrentWorkout(null);
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case "strength":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        );
      case "cardio":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      case "flexibility":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case "strength":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "cardio":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "flexibility":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {t("description")}
          </p>
        </div>{" "}
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("statistics.weeklyWorkouts")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {thisWeekWorkouts}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              z {totalWorkouts} {t("statistics.total")}
            </div>
          </div>{" "}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("statistics.totalTime")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(totalDuration / 60)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("statistics.hours")}
            </div>
          </div>{" "}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("statistics.averageDuration")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-orange-600 dark:text-orange-400"
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
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {avgDuration}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("statistics.minutes")}
            </div>
          </div>{" "}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("statistics.plannedWorkouts")}
              </h3>
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {workouts.filter((w) => w.status === "planned").length}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("statistics.workouts")}
            </div>
          </div>
        </div>{" "}
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>{t("actions.startWorkout")}</span>
          </button>

          <button
            onClick={() => setShowWorkoutModal(true)}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>{t("actions.planWorkout")}</span>
          </button>
        </div>{" "}
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-1 mb-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex space-x-1">
            {(["recent", "planned", "templates"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {tab === "recent" && t("tabs.recent")}
                {tab === "planned" && t("tabs.planned")}
                {tab === "templates" && t("tabs.templates")}
              </button>
            ))}
          </div>
        </div>
        {/* Content based on active tab */}{" "}
        {activeTab === "recent" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("sections.recentWorkouts")}
            </h2>
            <div className="grid gap-6">
              {workouts
                .filter((w) => w.status === "completed")
                .map((workout) => (
                  <div
                    key={workout.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getWorkoutTypeColor(
                            workout.type
                          )}`}
                        >
                          {getWorkoutTypeIcon(workout.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {workout.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(workout.date).toLocaleDateString(
                              "pl-PL",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-slate-900 dark:text-white">
                          {workout.duration}
                          {t("workout.duration")}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {workout.exercises.length} {t("workout.exercises")}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {workout.exercises.slice(0, 3).map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {exercise.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {exercise.sets} {t("workout.sets")} ×{" "}
                              {exercise.reps} {t("workout.reps")}
                              {exercise.weight &&
                                ` @ ${exercise.weight}${t("workout.weight")}`}
                              {exercise.duration &&
                                ` ${exercise.duration}${t("workout.duration")}`}
                            </div>
                          </div>
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                          +{workout.exercises.length - 3}{" "}
                          {t("workout.moreExercises")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}{" "}
        {activeTab === "planned" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("sections.plannedWorkouts")}
            </h2>
            <div className="grid gap-6">
              {workouts
                .filter((w) => w.status === "planned")
                .map((workout) => (
                  <div
                    key={workout.id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getWorkoutTypeColor(
                            workout.type
                          )}`}
                        >
                          {getWorkoutTypeIcon(workout.type)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {workout.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t("workout.plannedFor")}{" "}
                            {new Date(workout.date).toLocaleDateString("pl-PL")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCompleteWorkout(workout.id, 75)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        {t("actions.start")}
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {workout.exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {exercise.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {exercise.sets} {t("workout.sets")} ×{" "}
                              {exercise.reps} {t("workout.reps")}
                              {exercise.weight &&
                                ` @ ${exercise.weight}${t("workout.weight")}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}{" "}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t("sections.workoutTemplates")}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {workoutTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getWorkoutTypeColor(
                        template.type
                      )}`}
                    >
                      {getWorkoutTypeIcon(template.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        ~{template.estimatedDuration}
                        {t("workout.duration")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {template.exercises.slice(0, 3).map((exercise, index) => (
                      <div
                        key={index}
                        className="text-sm text-slate-600 dark:text-slate-400"
                      >
                        • {exercise.name}
                      </div>
                    ))}
                    {template.exercises.length > 3 && (
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        +{template.exercises.length - 3}{" "}
                        {t("workout.moreExercises")}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartWorkoutFromTemplate(template)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    {t("actions.useTemplate")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}{" "}
        {/* Template Selection Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                {t("modals.selectTemplate")}
              </h3>

              <div className="grid gap-4 mb-6">
                {workoutTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    onClick={() => handleStartWorkoutFromTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {template.name}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getWorkoutTypeColor(
                          template.type
                        )}`}
                      >
                        {template.type}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {template.exercises.length} {t("workout.exercises")} • ~
                      {template.estimatedDuration}
                      {t("workout.duration")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t("actions.cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
