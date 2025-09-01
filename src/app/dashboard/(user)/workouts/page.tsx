"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import EditWorkoutModal from "./EditWorkoutModal";
import PlanWorkoutModal from "./PlanWorkoutModal";
import PlanDetailsModal from "@/components/modals/PlanDetailsModal";

interface Exercise {
  id: string;
  name: string;
  nameEn?: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // for cardio exercises in minutes
  restTime?: number; // rest time in seconds
  notes?: string;
  notesEn?: string;
}

interface Workout {
  id: string;
  name: string;
  nameEn?: string;
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
  nameEn?: string;
  type: "strength" | "cardio" | "flexibility" | "mixed";
  exercises: Omit<Exercise, "id">[];
  estimatedDuration: number;
}

interface ProfessionalPlan {
  _id: string;
  name: string;
  description?: string;
  type: "training" | "nutrition" | "both";
  status: "active" | "inactive" | "draft";
  startDate: string;
  endDate?: string;
  goals: {
    weight?: number;
    targetWeight?: number;
    trainerTargetWeight?: string;
    strength?: string[];
    endurance?: string[];
    flexibility?: string[];
    nutrition?: string[];
  };
  trainingPlan?: {
    workouts: {
      day: number;
      name: string;
      exercises: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
        rest: number;
        notes?: string;
      }[];
      notes?: string;
    }[];
    trainingDays?: {
      day: number;
      name: string;
      exercises: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
        restTime: number;
        notes?: string;
      }[];
      notes?: string;
    }[];
  };
  nutritionPlan?: {
    dailyCalories: number;
    macronutrients: {
      protein: number;
      carbs: number;
      fats: number;
    };
    meals: {
      day: number;
      meals: {
        type: "breakfast" | "lunch" | "dinner" | "snack";
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        ingredients?: string[];
        notes?: string;
      }[];
    }[];
  };
  professional: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  // Nowe pola do śledzenia postępu
  progress?: {
    workoutsCompleted: number;
    totalWorkouts: number;
    lastWorkoutDate?: string;
    currentStreak: number;
    totalTimeSpent: number;
    workoutHistory: {
      workoutId: string;
      name: string;
      completedAt: string;
      duration: number;
      status: "completed" | "in-progress" | "skipped";
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export default function WorkoutsPage() {
  const t = useTranslations("workouts");
  const locale = useLocale();

  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>(
    []
  );
  const [professionalPlans, setProfessionalPlans] = useState<
    ProfessionalPlan[]
  >([]);

  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);

  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<ProfessionalPlan | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "recent" | "planned" | "templates" | "plans"
  >("recent");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeTimer, setActiveTimer] = useState<{
    workoutId: string;
    startTime: number;
    pausedTime: number;
    isPaused: boolean;
  } | null>(null);

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Timer functions
  const startTimer = (workoutId: string) => {
    setActiveTimer({
      workoutId,
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false,
    });
  };

  const pauseTimer = () => {
    if (activeTimer && !activeTimer.isPaused) {
      setActiveTimer((prev) =>
        prev
          ? {
              ...prev,
              pausedTime: Date.now() - prev.startTime,
              isPaused: true,
            }
          : null
      );
    }
  };

  const resumeTimer = () => {
    if (activeTimer && activeTimer.isPaused) {
      setActiveTimer((prev) =>
        prev
          ? {
              ...prev,
              startTime: Date.now() - prev.pausedTime,
              pausedTime: 0,
              isPaused: false,
            }
          : null
      );
    }
  };

  const stopTimer = () => {
    if (activeTimer) {
      const totalTime = activeTimer.isPaused
        ? activeTimer.pausedTime
        : Date.now() - activeTimer.startTime;
      const durationMinutes = Math.round(totalTime / (1000 * 60));

      // Complete the workout with calculated duration
      handleCompleteWorkout(activeTimer.workoutId, durationMinutes);
      setActiveTimer(null);
    }
  };

  const getCurrentTime = () => {
    if (!activeTimer) return 0;

    if (activeTimer.isPaused) {
      return activeTimer.pausedTime;
    }

    return Date.now() - activeTimer.startTime;
  };

  // Auto-start timer when workout status changes to in-progress
  useEffect(() => {
    const inProgressWorkout = workouts.find((w) => w.status === "in-progress");
    if (inProgressWorkout && !activeTimer) {
      startTimer(inProgressWorkout.id);
    } else if (!inProgressWorkout && activeTimer) {
      setActiveTimer(null);
    }
  }, [workouts, activeTimer]);

  // Update timer display every second
  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      // Force re-render to update timer display
      setWorkouts((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Helper function to get localized name
  const getLocalizedName = (workout: Workout) => {
    console.log("getLocalizedName:", {
      locale,
      name: workout.name,
      nameEn: workout.nameEn,
      hasNameEn: !!workout.nameEn,
    });
    return locale === "en" && workout.nameEn ? workout.nameEn : workout.name;
  };

  // Helper function to get localized exercise name
  const getLocalizedExerciseName = (exercise: Exercise) => {
    console.log("getLocalizedExerciseName:", {
      locale,
      name: exercise.name,
      nameEn: exercise.nameEn,
      hasNameEn: !!exercise.nameEn,
    });
    return locale === "en" && exercise.nameEn ? exercise.nameEn : exercise.name;
  };

  // Helper function to get localized exercise notes
  const getLocalizedExerciseNotes = (exercise: Exercise) => {
    return locale === "en" && exercise.notesEn
      ? exercise.notesEn
      : exercise.notes;
  };

  // Helper function to get localized template name
  const getLocalizedTemplateName = (template: WorkoutTemplate) => {
    return locale === "en" && template.nameEn ? template.nameEn : template.name;
  };

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

  const handleStartWorkoutFromTemplate = async (template: WorkoutTemplate) => {
    try {
      const res = await fetch(`/api/workouts/templates/${template.id}/use`, {
        method: "POST",
      });
      if (!res.ok) {
        let message = `Failed to create workout from template (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        alert(message);
        return;
      }
      const data = await res.json();
      const w = data.workout as any;
      const mapped: Workout = {
        id: w._id,
        name: w.name,
        nameEn: w.nameEn,
        date: new Date(w.date).toISOString().split("T")[0],
        type: w.type,
        duration: w.duration,
        status: w.status,
        exercises: (w.exercises || []).map((e: any) => ({ id: e._id, ...e })),
        notes: w.notes,
      };
      setWorkouts((prev) => [mapped, ...prev]);
      setShowTemplateModal(false);
      setActiveTab("planned");

      // Refresh professional plans to show updated progress
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    } catch (e) {
      alert("Network error while creating workout from template");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleViewPlan = (plan: ProfessionalPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetailsModal(true);
  };

  const handleConvertPlanToWorkouts = async (plan: ProfessionalPlan) => {
    try {
      const res = await fetch(
        `/api/user/plans/${plan._id}/convert-to-workouts`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        let message = `Failed to convert plan to workouts (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        alert(message);
        return;
      }
      const data = await res.json();
      alert(`Successfully converted plan to ${data.workouts} workouts!`);

      // Refresh workouts
      const wRes = await fetch("/api/workouts");
      if (wRes.ok) {
        const { workouts } = await wRes.json();
        setWorkouts(
          (workouts || []).map((w: any) => ({
            id: w._id,
            name: w.name,
            nameEn: w.nameEn,
            date: new Date(w.date).toISOString().split("T")[0],
            type: w.type,
            duration: w.duration,
            status: w.status,
            exercises: (w.exercises || []).map((e: any) => ({
              id: e._id,
              ...e,
            })),
            notes: w.notes,
          }))
        );
      }

      setActiveTab("planned");

      // Refresh professional plans to show updated progress
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    } catch (e) {
      alert("Network error while converting plan to workouts");
      console.error(e);
    }
  };

  const handleCompleteWorkout = async (workoutId: string, duration: number) => {
    try {
      // Complete the workout
      const res = await fetch(`/api/workouts/${workoutId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration }),
      });

      if (!res.ok) return;

      // Update local state
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId ? { ...w, status: "completed", duration } : w
        )
      );

      // Find if this workout is part of a professional plan
      const workout = workouts.find((w) => w.id === workoutId);
      if (workout && workout.notes && workout.notes.includes("Plan:")) {
        // Extract plan name from notes (format: "Plan: {planName}")
        const planName = workout.notes.replace("Plan: ", "");

        // Find the corresponding plan
        const plan = professionalPlans.find((p) => p.name === planName);
        if (plan) {
          // Update plan progress
          await fetch(`/api/user/plans/${plan._id}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workoutId,
              workoutName: workout.name,
              duration,
              status: "completed",
            }),
          });

          // Refresh professional plans to show updated progress
          const pRes = await fetch("/api/user/plans");
          if (pRes.ok) {
            const { plans } = await pRes.json();
            setProfessionalPlans(plans || []);
          }
        }
      }
    } catch (error) {
      console.error("Error completing workout:", error);
    }
  };

  const handleSkipWorkout = async (workoutId: string) => {
    try {
      // Find the workout
      const workout = workouts.find((w) => w.id === workoutId);
      if (!workout) return;

      // Update workout status to skipped
      setWorkouts((prev) =>
        prev.map((w) => (w.id === workoutId ? { ...w, status: "skipped" } : w))
      );

      // Find if this workout is part of a professional plan
      if (workout.notes && workout.notes.includes("Plan:")) {
        // Extract plan name from notes (format: "Plan: {planName}")
        const planName = workout.notes.replace("Plan: ", "");

        // Find the corresponding plan
        const plan = professionalPlans.find((p) => p.name === planName);
        if (plan) {
          // Update plan progress
          await fetch(`/api/user/plans/${plan._id}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workoutId,
              workoutName: workout.name,
              duration: 0,
              status: "skipped",
            }),
          });

          // Refresh professional plans to show updated progress
          const pRes = await fetch("/api/user/plans");
          if (pRes.ok) {
            const { plans } = await pRes.json();
            setProfessionalPlans(plans || []);
          }
        }
      }
    } catch (error) {
      console.error("Error skipping workout:", error);
    }
  };

  const handleStartPlannedWorkout = async (workoutId: string) => {
    // Check if there's already a workout in progress
    const workoutInProgress = workouts.find((w) => w.status === "in-progress");
    if (workoutInProgress) {
      alert(
        `Masz już rozpoczęty trening: "${workoutInProgress.name}". Zakończ go najpierw, zanim rozpoczniesz nowy.`
      );
      return;
    }

    try {
      const res = await fetch(`/api/workouts/${workoutId}/start`, {
        method: "POST",
      });
      if (!res.ok) {
        let message = `Failed to start workout (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        alert(message);
        return;
      }
      setWorkouts((prev) =>
        prev.map((w) =>
          w.id === workoutId ? { ...w, status: "in-progress" } : w
        )
      );
      setActiveTab("recent");

      // Refresh professional plans to show updated progress
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    } catch (e) {
      alert("Network error while starting workout");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleCreatePlannedWorkout = async (workoutData: {
    name: string;
    nameEn?: string;
    date: string;
    type: string;
    exercises: Array<{
      name: string;
      nameEn?: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
      restTime?: number;
      notes?: string;
    }>;
  }) => {
    try {
      const res = await fetch(`/api/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workoutData.name,
          nameEn: workoutData.nameEn,
          date: workoutData.date,
          type: workoutData.type,
          status: "planned",
          exercises: workoutData.exercises,
        }),
      });
      if (!res.ok) {
        let message = `Failed to plan workout (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        alert(message);
        return;
      }
      const { workout } = await res.json();
      const mapped: Workout = {
        id: workout._id,
        name: workout.name,
        date: new Date(workout.date).toISOString().split("T")[0],
        type: workout.type,
        duration: workout.duration,
        status: workout.status,
        exercises: workout.exercises || [],
        notes: workout.notes,
      };
      setWorkouts((prev) => [mapped, ...prev]);
      setShowWorkoutModal(false);
      setActiveTab("planned");

      // Refresh professional plans to show updated progress
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    } catch (e) {
      alert("Network error while planning workout");
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setShowEditModal(true);
  };

  const handleUpdateWorkout = async (
    workoutId: string,
    updatedData: {
      name: string;
      nameEn?: string;
      date: string;
      type: string;
      exercises: Array<{
        name: string;
        nameEn?: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
        restTime?: number;
        notes?: string;
      }>;
    }
  ) => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        let message = `Failed to update workout (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        alert(message);
        return;
      }
      const { workout } = await res.json();
      const updated: Workout = {
        id: workout._id,
        name: workout.name,
        nameEn: workout.nameEn,
        date: new Date(workout.date).toISOString().split("T")[0],
        type: workout.type,
        duration: workout.duration,
        status: workout.status,
        exercises: workout.exercises || [],
        notes: workout.notes,
      };
      setWorkouts((prev) =>
        prev.map((w) => (w.id === workoutId ? updated : w))
      );
      setShowEditModal(false);
      setEditingWorkout(null);

      // Refresh professional plans to show updated progress
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    } catch (e) {
      alert("Network error while updating workout");
      console.error(e);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (!confirm(t("actions.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let message = `Failed to delete workout (${res.status})`;
        try {
          const j = await res.json();
          if (j?.error) message = j.error;
        } catch {}
        alert(message);
        return;
      }
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));

      // Refresh professional plans to show updated progress
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    } catch (e) {
      alert("Network error while deleting workout");
      console.error(e);
    }
  };

  useEffect(() => {
    // initial fetch of workouts, templates, and professional plans
    const load = async () => {
      const [wRes, tRes, pRes] = await Promise.all([
        fetch("/api/workouts"),
        fetch(`/api/workouts/templates?lang=${encodeURIComponent(locale)}`),
        fetch("/api/user/plans"),
      ]);
      if (wRes.ok) {
        const { workouts } = await wRes.json();
        console.log("API workouts response:", workouts);
        setWorkouts(
          (workouts || []).map((w: any) => ({
            id: w._id,
            name: w.name,
            nameEn: w.nameEn,
            date: new Date(w.date).toISOString().split("T")[0],
            type: w.type,
            duration: w.duration,
            status: w.status,
            exercises: (w.exercises || []).map((e: any) => ({
              id: e._id,
              ...e,
            })),
            notes: w.notes,
          }))
        );
      }
      if (tRes.ok) {
        const { templates } = await tRes.json();
        setWorkoutTemplates(
          (templates || []).map((t: any) => ({
            id: t._id,
            name: t.name,
            nameEn: t.nameEn,
            type: t.type,
            estimatedDuration: t.estimatedDuration,
            exercises: t.exercises || [],
          }))
        );
      }
      if (pRes.ok) {
        const { plans } = await pRes.json();
        console.log("API professional plans response:", plans);
        setProfessionalPlans(plans || []);
      }
    };
    load();

    // Refresh professional plans every 30 seconds to show real-time progress
    const progressInterval = setInterval(async () => {
      try {
        const pRes = await fetch("/api/user/plans");
        if (pRes.ok) {
          const { plans } = await pRes.json();
          setProfessionalPlans(plans || []);
        }
      } catch (error) {
        console.error("Error refreshing plan progress:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(progressInterval);
  }, [locale]);

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
    <div className="p-6">
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
              {t("statistics.of")} {totalWorkouts} {t("statistics.total")}
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
              {Math.floor(totalDuration / 60)}:
              {String(totalDuration % 60).padStart(2, "0")}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("statistics.hours")}:{t("statistics.minutes")}
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
            {(["recent", "planned", "templates", "plans"] as const).map(
              (tab) => (
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
                  {tab === "plans" && "Plany Trenera"}
                </button>
              )
            )}
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
                .filter((w) => w.status !== "planned")
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
                            {getLocalizedName(workout)}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(workout.date).toLocaleDateString(locale, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
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
                        {workout.status === "in-progress" && (
                          <div className="mt-1 inline-block px-2 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {t("workout.inProgress")}
                          </div>
                        )}
                        {workout.status === "in-progress" && (
                          <div className="mt-2">
                            {activeTimer &&
                            activeTimer.workoutId === workout.id ? (
                              <div className="space-y-2">
                                <div className="text-center text-lg font-mono text-blue-600 dark:text-blue-400">
                                  {Math.floor(getCurrentTime() / (1000 * 60))}:
                                  {String(
                                    Math.floor(
                                      (getCurrentTime() % (1000 * 60)) / 1000
                                    )
                                  ).padStart(2, "0")}
                                </div>
                                <div className="flex gap-2 justify-center">
                                  {activeTimer.isPaused ? (
                                    <button
                                      onClick={resumeTimer}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                                    >
                                      {t("actions.resume")}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={pauseTimer}
                                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm"
                                    >
                                      {t("actions.pause")}
                                    </button>
                                  )}
                                  <button
                                    onClick={stopTimer}
                                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                                  >
                                    {t("actions.finish")}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                                Timer starting...
                              </div>
                            )}
                            <div className="mt-2 flex justify-center">
                              <button
                                onClick={() => handleDeleteWorkout(workout.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                              >
                                {t("actions.delete")}
                              </button>
                            </div>
                          </div>
                        )}
                        {workout.status === "completed" && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleDeleteWorkout(workout.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                            >
                              {t("actions.delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Toggle to show/hide exercises */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleExpanded(workout.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {expanded[workout.id]
                          ? t("actions.hideDetails")
                          : t("actions.showDetails")}
                      </button>
                    </div>
                    {expanded[workout.id] && (
                      <div className="grid gap-3 mt-3">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {getLocalizedExerciseName(exercise)}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {exercise.sets} {t("workout.sets")} ×{" "}
                                {exercise.reps} {t("workout.reps")}
                                {exercise.weight &&
                                  ` @ ${exercise.weight}${t("workout.weight")}`}
                                {exercise.duration &&
                                  ` ${exercise.duration}${t(
                                    "workout.duration"
                                  )}`}
                                {exercise.restTime &&
                                  ` • ${t("workout.restTime")}: ${
                                    exercise.restTime
                                  }s`}
                                {getLocalizedExerciseNotes(exercise) &&
                                  ` • ${getLocalizedExerciseNotes(exercise)}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                            {getLocalizedName(workout)}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {t("workout.plannedFor")}{" "}
                            {new Date(workout.date).toLocaleDateString(locale, {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {workout.status === "planned" ? (
                          <>
                            <button
                              onClick={() =>
                                handleStartPlannedWorkout(workout.id)
                              }
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                            >
                              {t("actions.start")}
                            </button>
                            <button
                              onClick={() => handleEditWorkout(workout)}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              {t("actions.edit")}
                            </button>
                            <button
                              onClick={() => handleSkipWorkout(workout.id)}
                              className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                              title="Pomiń trening"
                            >
                              ⏭️
                            </button>
                            <button
                              onClick={() => handleDeleteWorkout(workout.id)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              {t("actions.delete")}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              const input = prompt(
                                t("workout.enterDuration") + " (min)"
                              );
                              const d = input ? parseInt(input, 10) : NaN;
                              if (!isNaN(d) && d >= 0) {
                                handleCompleteWorkout(workout.id, d);
                              }
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                          >
                            {t("actions.finish")}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {(expanded[workout.id]
                        ? workout.exercises
                        : workout.exercises.slice(0, 3)
                      ).map((exercise) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {getLocalizedExerciseName(exercise)}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {exercise.sets} {t("workout.sets")} ×{" "}
                              {exercise.reps} {t("workout.reps")}
                              {exercise.weight &&
                                ` @ ${exercise.weight}${t("workout.weight")}`}
                              {exercise.duration &&
                                ` ${exercise.duration}${t("workout.duration")}`}
                              {exercise.restTime &&
                                ` • ${t("workout.restTime")}: ${
                                  exercise.restTime
                                }s`}
                              {getLocalizedExerciseNotes(exercise) &&
                                ` • ${getLocalizedExerciseNotes(exercise)}`}
                            </div>
                          </div>
                        </div>
                      ))}
                      {!expanded[workout.id] &&
                        workout.exercises.length > 3 && (
                          <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                            +{workout.exercises.length - 3}{" "}
                            {t("workout.moreExercises")}
                          </div>
                        )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => toggleExpanded(workout.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {expanded[workout.id]
                            ? t("actions.hideDetails")
                            : t("actions.showDetails")}
                        </button>
                      </div>
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
                        {getLocalizedTemplateName(template)}
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
                        •{" "}
                        {exercise.nameEn && locale === "en"
                          ? exercise.nameEn
                          : exercise.name}
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
        {activeTab === "plans" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Plany od Trenera
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Plany treningowe i żywieniowe stworzone przez Twojego trenera
              personalnego
            </p>

            {professionalPlans.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Brak planów od trenera
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Twój trener jeszcze nie stworzył dla Ciebie żadnych planów
                  treningowych lub żywieniowych.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {professionalPlans.map((plan) => (
                  <div
                    key={plan._id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            od {plan.professional.name}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          plan.status === "active"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : plan.status === "inactive"
                            ? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {plan.status === "active"
                          ? "Aktywny"
                          : plan.status === "inactive"
                          ? "Nieaktywny"
                          : "Szkic"}
                      </span>
                    </div>

                    {plan.description && (
                      <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                        {plan.description}
                      </p>
                    )}

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Typ:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {plan.type === "training"
                            ? "Trening"
                            : plan.type === "nutrition"
                            ? "Żywienie"
                            : "Oba"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Data rozpoczęcia:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {new Date(plan.startDate).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                      {plan.endDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">
                            Data zakończenia:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {new Date(plan.endDate).toLocaleDateString("pl-PL")}
                          </span>
                        </div>
                      )}
                    </div>

                    {plan.trainingPlan &&
                      (plan.trainingPlan.workouts ||
                        plan.trainingPlan.trainingDays) && (
                        <div className="mb-4">
                          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Treningi (
                            {(
                              plan.trainingPlan.workouts ||
                              plan.trainingPlan.trainingDays
                            )?.length || 0}
                            ):
                          </div>
                          <div className="space-y-1">
                            {/* Show workouts if they exist */}
                            {plan.trainingPlan.workouts &&
                              plan.trainingPlan.workouts
                                .slice(0, 3)
                                .map((workout, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    • {workout.name} ({workout.exercises.length}{" "}
                                    ćwiczeń)
                                  </div>
                                ))}
                            {/* Show trainingDays if they exist */}
                            {plan.trainingPlan.trainingDays &&
                              plan.trainingPlan.trainingDays
                                .slice(0, 3)
                                .map((day, index) => (
                                  <div
                                    key={index}
                                    className="text-sm text-slate-700 dark:text-slate-300"
                                  >
                                    • {day.name} ({day.exercises.length}{" "}
                                    ćwiczeń)
                                  </div>
                                ))}
                            {((plan.trainingPlan.workouts &&
                              plan.trainingPlan.workouts.length > 3) ||
                              (plan.trainingPlan.trainingDays &&
                                plan.trainingPlan.trainingDays.length > 3)) && (
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                +
                                {Math.max(
                                  (plan.trainingPlan.workouts?.length || 0) - 3,
                                  (plan.trainingPlan.trainingDays?.length ||
                                    0) - 3
                                )}{" "}
                                więcej...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                    {plan.nutritionPlan && (
                      <div className="mb-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          Żywienie:
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          {plan.nutritionPlan.dailyCalories} kcal/dzień
                        </div>
                      </div>
                    )}

                    {/* Progress Section */}
                    {plan.progress && (
                      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          Postęp treningów:
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              Ukończone:
                            </span>
                            <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                              {plan.progress.workoutsCompleted}/
                              {plan.progress.totalWorkouts ||
                                (plan.trainingPlan?.workouts?.length || 0) +
                                  (plan.trainingPlan?.trainingDays?.length ||
                                    0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600 dark:text-slate-400">
                              Seria:
                            </span>
                            <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                              {plan.progress.currentStreak} dni
                            </span>
                          </div>
                          {plan.progress.lastWorkoutDate && (
                            <div className="col-span-2">
                              <span className="text-slate-600 dark:text-slate-400">
                                Ostatni trening:
                              </span>
                              <span className="ml-2 font-medium text-slate-900 dark:text-white">
                                {new Date(
                                  plan.progress.lastWorkoutDate
                                ).toLocaleDateString("pl-PL")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {plan.trainingPlan &&
                        (plan.trainingPlan.workouts ||
                          plan.trainingPlan.trainingDays) && (
                          <button
                            onClick={() => handleConvertPlanToWorkouts(plan)}
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
                          >
                            Konwertuj na treningi
                          </button>
                        )}
                      <button
                        onClick={() => handleViewPlan(plan)}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium text-sm"
                      >
                        Zobacz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        {getLocalizedTemplateName(template)}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${getWorkoutTypeColor(
                          template.type
                        )}`}
                      >
                        {t(`types.${template.type}` as any)}
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
        {/* Plan Workout Modal */}
        <PlanWorkoutModal
          isOpen={showWorkoutModal}
          onClose={() => setShowWorkoutModal(false)}
          onPlan={handleCreatePlannedWorkout}
        />
        {/* Edit Workout Modal */}
        <EditWorkoutModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingWorkout(null);
          }}
          workout={editingWorkout}
          onUpdate={handleUpdateWorkout}
        />
        {/* Plan Details Modal */}
        <PlanDetailsModal
          isOpen={showPlanDetailsModal}
          onClose={() => {
            setShowPlanDetailsModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
        />
      </div>
    </div>
  );
}
