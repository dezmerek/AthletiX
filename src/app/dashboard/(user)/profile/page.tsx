"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface UserProfile {
  age: number;
  weight: number;
  targetWeight: number;
  height: number;
  gender: "male" | "female";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  // New calorie goal settings
  calorieGoal: {
    type: "lose_weight" | "gain_weight" | "maintain_weight";
    weeklyGoal: number; // kg per week (0.25, 0.5, 0.75, 1.0, or custom value)
    customWeeklyGoal?: number; // custom kg per week value
    customCalories?: number; // optional custom calorie target
  };
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const [profile, setProfile] = useState<UserProfile>({
    age: 0,
    weight: 0,
    targetWeight: 0,
    height: 0,
    gender: "male",
    activityLevel: "moderate",
    // New calorie goal settings
    calorieGoal: {
      type: "maintain_weight",
      weeklyGoal: 0.5, // 0.5 kg per week default
      customWeeklyGoal: undefined,
      customCalories: undefined,
    },
    macros: {
      protein: 30,
      carbs: 40,
      fats: 30,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/user/profile", {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            // User has an existing profile - load it
            setProfile((prev) => ({
              ...prev,
              ...data.profile,
              calorieGoal: {
                ...prev.calorieGoal,
                ...data.profile.calorieGoal,
              },
              macros: {
                ...prev.macros,
                ...data.profile.macros,
              },
            }));
          } else {
            // New user - keep empty profile
            console.log("New user - profile will remain empty");
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { age, weight, height, gender } = profile;

    // Return 0 if required values are missing
    if (!age || !weight || !height) {
      return 0;
    }

    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate TDEE based on activity level
  const calculateTDEE = () => {
    const bmr = calculateBMR();

    // Return 0 if BMR is 0 (missing data)
    if (bmr === 0) {
      return 0;
    }

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return bmr * multipliers[profile.activityLevel];
  };

  // Calculate calories based on weekly weight goal (FitAtu/Yazio style)
  const calculateCaloriesFromWeeklyGoal = () => {
    const tdee = calculateTDEE();

    // Return 0 if TDEE is 0 (missing data)
    if (tdee === 0) {
      return 0;
    }

    const { type, weeklyGoal, customWeeklyGoal, customCalories } =
      profile.calorieGoal;

    // If custom calories are set, use them
    if (customCalories && customCalories > 0) {
      return customCalories;
    }

    // Use custom weekly goal if set, otherwise use regular weeklyGoal
    const actualWeeklyGoal =
      customWeeklyGoal && customWeeklyGoal > 0 ? customWeeklyGoal : weeklyGoal;

    // 1 kg of fat = approximately 7700 calories
    // So daily calorie deficit/surplus needed = (weeklyGoal * 7700) / 7
    const dailyCalorieAdjustment = (actualWeeklyGoal * 7700) / 7;

    switch (type) {
      case "lose_weight":
        return Math.max(1200, tdee - dailyCalorieAdjustment); // Minimum 1200 calories
      case "gain_weight":
        return tdee + dailyCalorieAdjustment;
      case "maintain_weight":
        return tdee;
      default:
        return tdee;
    }
  };

  // Funkcja pomocnicza do wyliczania bezpiecznego procentu białka
  function getSafeProteinPercent(
    defaultPercent: number,
    calories: number,
    weight: number
  ) {
    const maxPercent = ((2 * weight * 4) / calories) * 100;
    return Math.min(defaultPercent, Math.floor(maxPercent));
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        console.log("Profile saved successfully!");
        // You could add a toast notification here
      } else {
        const errorData = await response.json();
        console.error("Failed to save profile:", errorData.error);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Funkcja do synchronizacji wagi z progress
  const syncWeightToProgress = async (newWeight: number) => {
    try {
      console.log("🔄 Rozpoczynam synchronizację wagi z progress:", newWeight);

      // Pobierz aktualne dane progress
      const response = await fetch("/api/user/progress");
      if (response.ok) {
        const data = await response.json();
        const currentWeightEntries = data.weightEntries || [];

        console.log("📥 Pobrane dane progress:", {
          weightEntriesCount: currentWeightEntries.length,
          lastWeight: currentWeightEntries[0]?.weight,
          newWeight: newWeight,
        });

        // Sprawdź czy waga się zmieniła
        const lastWeight = currentWeightEntries[0]?.weight;
        console.log("🔍 Porównanie wag:", {
          lastWeight,
          newWeight,
          isDifferent: lastWeight !== newWeight,
        });

        if (lastWeight !== newWeight && newWeight > 0) {
          // Dodaj nowy wpis wagi do progress
          const newWeightEntry = {
            id: Date.now().toString(),
            weight: newWeight,
            date: new Date().toISOString().split("T")[0],
            notes: "Zaktualizowano z profilu",
          };

          console.log("📤 Wysyłam zaktualizowane dane do progress:", {
            newWeightEntry,
            totalWeightEntries: [newWeightEntry, ...currentWeightEntries]
              .length,
            measurementsCount: data.measurements?.length || 0,
            goalsCount: data.goals?.length || 0,
          });

          // Wyślij zaktualizowane dane do progress
          const updateResponse = await fetch("/api/user/progress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              weightEntries: [newWeightEntry, ...currentWeightEntries],
              measurements: data.measurements || [],
              goals: data.goals || [],
            }),
          });

          if (updateResponse.ok) {
            console.log("✅ Waga zsynchronizowana z progress:", newWeight);
          } else {
            console.error("❌ Błąd synchronizacji wagi z progress");
            const errorData = await updateResponse.json();
            console.error("❌ Szczegóły błędu:", errorData);
          }
        } else {
          console.log("ℹ️ Waga się nie zmieniła lub jest nieprawidłowa:", {
            lastWeight,
            newWeight,
          });
        }
      }
    } catch (error) {
      console.error("Error syncing weight to progress:", error);
    }
  };

  // Add useEffect that reacts to weight change and calorie goal changes
  useEffect(() => {
    if (profile.weight > 0) {
      const calories = Math.round(calculateCaloriesFromWeeklyGoal());
      let macros;
      switch (profile.calorieGoal.type) {
        case "lose_weight": {
          const protein = getSafeProteinPercent(35, calories, profile.weight);
          macros = { protein, fats: 25, carbs: 100 - protein - 25 };
          break;
        }
        case "maintain_weight": {
          const protein = getSafeProteinPercent(30, calories, profile.weight);
          macros = { protein, fats: 30, carbs: 100 - protein - 30 };
          break;
        }
        case "gain_weight": {
          const protein = getSafeProteinPercent(32, calories, profile.weight);
          macros = { protein, fats: 23, carbs: 100 - protein - 23 };
          break;
        }
        default: {
          const protein = getSafeProteinPercent(30, calories, profile.weight);
          macros = { protein, fats: 30, carbs: 100 - protein - 30 };
        }
      }
      setProfile((prev) => ({ ...prev, macros }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    profile.weight,
    profile.calorieGoal.type,
    profile.calorieGoal.weeklyGoal,
    profile.calorieGoal.customWeeklyGoal,
    profile.calorieGoal.customCalories,
  ]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("description")}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-lg dark:bg-emerald-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  {t("personalDetails.title")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {t("personalDetails.age")}
                    </label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={profile.age}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          age: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {t("personalDetails.gender")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          value: "male",
                          icon: "👨",
                          color:
                            "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400",
                          hover: "hover:border-blue-400",
                        },
                        {
                          value: "female",
                          icon: "👩",
                          color:
                            "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400",
                          hover: "hover:border-red-400",
                        },
                      ].map((genderOption) => (
                        <button
                          key={genderOption.value}
                          type="button"
                          onClick={() =>
                            setProfile((prev) => ({
                              ...prev,
                              gender: genderOption.value as "male" | "female",
                            }))
                          }
                          className={`px-3 py-2 rounded-lg border transition-all text-center flex items-center justify-center space-x-2 ${
                            profile.gender === genderOption.value
                              ? genderOption.color
                              : `bg-white cursor-pointer dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 ${genderOption.hover}`
                          }`}
                        >
                          <span className="text-lg">{genderOption.icon}</span>
                          <span className="font-medium text-sm">
                            {t(`personalDetails.${genderOption.value}`)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {t("personalDetails.weight")} (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      step="0.1"
                      value={profile.weight}
                      onChange={(e) => {
                        const newWeight = parseFloat(e.target.value) || 0;
                        setProfile((prev) => ({
                          ...prev,
                          weight: newWeight,
                        }));
                      }}
                      onBlur={(e) => {
                        const newWeight = parseFloat(e.target.value) || 0;
                        // Synchronizuj z progress gdy użytkownik skończy wpisywać
                        if (newWeight > 0) {
                          syncWeightToProgress(newWeight);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {t("personalDetails.targetWeight")} (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      step="0.1"
                      value={profile.targetWeight}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          targetWeight: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {t("personalDetails.height")} (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={profile.height}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          height: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              {/* Activity Level */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-teal-600 dark:text-teal-400"
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
                  </div>
                  {t("goals.activityTitle")}
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                  {t("goals.activityDescription")}
                </p>

                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                    {t("goals.activityLevel")}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {[
                      {
                        value: "sedentary",
                        icon: "🛋️",
                        color:
                          "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950/50 dark:border-gray-800 dark:text-gray-400",
                        hover: "hover:border-gray-400",
                      },
                      {
                        value: "light",
                        icon: "🚶",
                        color:
                          "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400",
                        hover: "hover:border-blue-400",
                      },
                      {
                        value: "moderate",
                        icon: "🏃",
                        color:
                          "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-400",
                        hover: "hover:border-green-400",
                      },
                      {
                        value: "active",
                        icon: "🏋️",
                        color:
                          "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/50 dark:border-orange-800 dark:text-orange-400",
                        hover: "hover:border-orange-400",
                      },
                      {
                        value: "very_active",
                        icon: "🚴",
                        color:
                          "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400",
                        hover: "hover:border-red-400",
                      },
                    ].map((activityType) => (
                      <button
                        key={activityType.value}
                        type="button"
                        onClick={() =>
                          setProfile((prev) => ({
                            ...prev,
                            activityLevel:
                              activityType.value as UserProfile["activityLevel"],
                          }))
                        }
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          profile.activityLevel === activityType.value
                            ? activityType.color
                            : `bg-white cursor-pointer dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 ${activityType.hover}`
                        }`}
                      >
                        <div className="text-xl mb-2">{activityType.icon}</div>
                        <div className="font-medium text-sm leading-tight mb-1">
                          {t(`goals.activity.${activityType.value}`)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                          {t(
                            `goals.activityDescriptions.${activityType.value}`
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Calorie Goal Section */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3 text-emerald-600 dark:text-emerald-400">
                    <svg
                      className="w-5 h-5 text-orange-600 dark:text-orange-400"
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
                  {t("calorieGoal.title")}
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">
                  {t("calorieGoal.description")}
                </p>

                <div className="space-y-4">
                  {/* Goal Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                      {t("calorieGoal.goalType")}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          value: "lose_weight",
                          icon: "🔥",
                          color:
                            "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400",
                          hover: "hover:border-red-400",
                        },
                        {
                          value: "maintain_weight",
                          icon: "⚖️",
                          color:
                            "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400",
                          hover: "hover:border-blue-400",
                        },
                        {
                          value: "gain_weight",
                          icon: "📈",
                          color:
                            "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-400",
                          hover: "hover:border-green-400",
                        },
                      ].map((goalType) => (
                        <button
                          key={goalType.value}
                          type="button"
                          onClick={() => {
                            const newType = goalType.value as
                              | "lose_weight"
                              | "gain_weight"
                              | "maintain_weight";
                            setProfile((prev) => ({
                              ...prev,
                              calorieGoal: {
                                ...prev.calorieGoal,
                                type: newType,
                                // Reset custom values when switching to maintain_weight
                                weeklyGoal:
                                  newType === "maintain_weight"
                                    ? 0.5
                                    : prev.calorieGoal.weeklyGoal,
                                customWeeklyGoal:
                                  newType === "maintain_weight"
                                    ? undefined
                                    : prev.calorieGoal.customWeeklyGoal,
                              },
                            }));
                          }}
                          className={`p-3 rounded-lg border-2 transition-all text-center ${
                            profile.calorieGoal.type === goalType.value
                              ? goalType.color
                              : `bg-white cursor-pointer dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 ${goalType.hover}`
                          }`}
                        >
                          <div className="text-xl mb-1">{goalType.icon}</div>
                          <div className="font-medium text-sm">
                            {t(`calorieGoal.types.${goalType.value}`)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Goal - only show for lose_weight and gain_weight */}
                  {profile.calorieGoal.type !== "maintain_weight" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                        {t("calorieGoal.weeklyGoal")}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {[0.25, 0.5, 0.75, 1.0, "custom"].map((goal) => (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => {
                              if (goal === "custom") {
                                setProfile((prev) => ({
                                  ...prev,
                                  calorieGoal: {
                                    ...prev.calorieGoal,
                                    weeklyGoal: -1, // Use -1 to indicate custom mode
                                    customWeeklyGoal: 0.5, // Default custom value
                                  },
                                }));
                              } else {
                                setProfile((prev) => ({
                                  ...prev,
                                  calorieGoal: {
                                    ...prev.calorieGoal,
                                    weeklyGoal: goal as number,
                                    customWeeklyGoal: undefined,
                                  },
                                }));
                              }
                            }}
                            className={`p-2 rounded-lg border-2 transition-all text-center text-sm ${
                              (goal === "custom" &&
                                profile.calorieGoal.weeklyGoal === -1) ||
                              (goal !== "custom" &&
                                profile.calorieGoal.weeklyGoal === goal)
                                ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400"
                                : "bg-white cursor-pointer dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400"
                            }`}
                          >
                            {goal === "custom" ? (
                              <>
                                <div className="font-medium">
                                  {t("customGoal.title")}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {profile.calorieGoal.customWeeklyGoal &&
                                  profile.calorieGoal.weeklyGoal === -1
                                    ? `(${profile.calorieGoal.customWeeklyGoal} kg)`
                                    : `(${t("customGoal.placeholder")})`}
                                </div>
                              </>
                            ) : (
                              <>
                                {goal} kg/
                                {t("calorieGoal.weeklyGoal").toLowerCase()}
                                <div className="text-xs opacity-75 mt-1">
                                  {goal === 0.25 &&
                                    `(${
                                      t("calorieGoal.weekly.0_25")
                                        .split("(")[1]
                                        ?.split(")")[0] || "powoli"
                                    })`}
                                  {goal === 0.5 &&
                                    `(${
                                      t("calorieGoal.weekly.0_5")
                                        .split("(")[1]
                                        ?.split(")")[0] || "zalecane"
                                    })`}
                                  {goal === 0.75 &&
                                    `(${
                                      t("calorieGoal.weekly.0_75")
                                        .split("(")[1]
                                        ?.split(")")[0] || "umiarkowanie"
                                    })`}
                                  {goal === 1.0 &&
                                    `(${
                                      t("calorieGoal.weekly.1_0")
                                        .split("(")[1]
                                        ?.split(")")[0] || "szybko"
                                    })`}
                                </div>
                              </>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Custom Weekly Goal Input */}
                      {profile.calorieGoal.weeklyGoal === -1 && (
                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                            {t("customGoal.inputLabel")}
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={profile.calorieGoal.customWeeklyGoal || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (isNaN(value) || value <= 0) {
                                setProfile((prev) => ({
                                  ...prev,
                                  calorieGoal: {
                                    ...prev.calorieGoal,
                                    customWeeklyGoal: undefined,
                                  },
                                }));
                              } else {
                                const clampedValue = Math.min(
                                  Math.max(value, 0.1),
                                  1.0
                                );
                                setProfile((prev) => ({
                                  ...prev,
                                  calorieGoal: {
                                    ...prev.calorieGoal,
                                    customWeeklyGoal: clampedValue,
                                  },
                                }));
                              }
                            }}
                            placeholder="np. 0.6"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            <strong>
                              {t("customGoal.recommendedValues")}:
                            </strong>
                            <br />• {t("customGoal.loseWeightRange")}
                            <br />• {t("customGoal.gainWeightRange")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Calculated Calories Display */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {t("calorieGoal.calculatedCalories")}
                      </h3>
                      <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        {Math.round(calculateCaloriesFromWeeklyGoal())}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <div>
                        {t("calories.tdeeDescription")}:{" "}
                        {Math.round(calculateTDEE())} {t("calories.perDay")}
                      </div>
                      {profile.calorieGoal.type !== "maintain_weight" && (
                        <>
                          <div>
                            {profile.calorieGoal.type === "lose_weight"
                              ? t("calories.deficit")
                              : t("calories.surplus")}
                            :{" "}
                            {Math.abs(
                              Math.round(
                                calculateCaloriesFromWeeklyGoal() -
                                  calculateTDEE()
                              )
                            )}{" "}
                            {t("calories.perDay")}
                          </div>
                          <div>
                            {t("calories.goal")}:{" "}
                            {profile.calorieGoal.type === "lose_weight"
                              ? t("calories.loseWeight")
                              : t("calories.gainWeight")}{" "}
                            {profile.calorieGoal.customWeeklyGoal &&
                            profile.calorieGoal.customWeeklyGoal > 0
                              ? profile.calorieGoal.customWeeklyGoal
                              : profile.calorieGoal.weeklyGoal > 0
                              ? profile.calorieGoal.weeklyGoal
                              : "0.5"}{" "}
                            {t("calories.perWeek")}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800/50">
                    <div className="flex items-start space-x-2">
                      <div className="text-yellow-600 dark:text-yellow-400 mt-0.5 text-sm">
                        💡
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <div className="font-medium mb-1">
                          {t("tips.title")}
                        </div>
                        <div>
                          {profile.calorieGoal.type === "lose_weight" &&
                            t("tips.loseWeightSafe")}
                          {profile.calorieGoal.type === "gain_weight" &&
                            t("tips.gainWeightOptimal")}
                          {profile.calorieGoal.type === "maintain_weight" &&
                            t("tips.maintainWeight")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Macros */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center mb-3 md:mb-0">
                    <div className="text-emerald-600 dark:text-emerald-400 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                    {t("macros.title")}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      const calories = Math.round(
                        calculateCaloriesFromWeeklyGoal()
                      );
                      let macros;
                      switch (profile.calorieGoal.type) {
                        case "lose_weight": {
                          const protein = getSafeProteinPercent(
                            35,
                            calories,
                            profile.weight
                          );
                          macros = {
                            protein,
                            fats: 25,
                            carbs: 100 - protein - 25,
                          };
                          break;
                        }
                        case "maintain_weight": {
                          const protein = getSafeProteinPercent(
                            30,
                            calories,
                            profile.weight
                          );
                          macros = {
                            protein,
                            fats: 30,
                            carbs: 100 - protein - 30,
                          };
                          break;
                        }
                        case "gain_weight": {
                          const protein = getSafeProteinPercent(
                            32,
                            calories,
                            profile.weight
                          );
                          macros = {
                            protein,
                            fats: 23,
                            carbs: 100 - protein - 23,
                          };
                          break;
                        }
                        default: {
                          const protein = getSafeProteinPercent(
                            30,
                            calories,
                            profile.weight
                          );
                          macros = {
                            protein,
                            fats: 30,
                            carbs: 100 - protein - 30,
                          };
                        }
                      }
                      setProfile((prev) => ({ ...prev, macros }));
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                  >
                    {t("macros.reset")}
                  </button>
                </div>
                <div className="grid grid-cols-3 mb-4">
                  <div className="flex items-center justify-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("macros.protein")} ({profile.macros.protein}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("macros.carbs")} ({profile.macros.carbs}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("macros.fats")} ({profile.macros.fats}%)
                    </span>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={profile.macros.protein}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            macros: {
                              ...prev.macros,
                              protein: parseInt(e.target.value),
                            },
                          }))
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                      />
                      <div className="flex items-center mt-1">
                        <input
                          type="number"
                          min="0"
                          value={Math.round(
                            (calculateCaloriesFromWeeklyGoal() *
                              (profile.macros.protein / 100)) /
                              4
                          )}
                          onChange={(e) => {
                            const grams = parseInt(e.target.value) || 0;
                            const calories = calculateCaloriesFromWeeklyGoal();
                            let percent =
                              calories === 0
                                ? 0
                                : Math.round((grams * 4 * 100) / calories);
                            if (grams === 0) percent = 0;
                            if (percent > 50) percent = 50;
                            setProfile((prev) => ({
                              ...prev,
                              macros: {
                                ...prev.macros,
                                protein: percent,
                              },
                            }));
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors mr-1"
                          aria-label="Białko (g)"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          g
                        </span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        value={profile.macros.carbs}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            macros: {
                              ...prev.macros,
                              carbs: parseInt(e.target.value),
                            },
                          }))
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                      />
                      <div className="flex items-center mt-1">
                        <input
                          type="number"
                          min="0"
                          value={Math.round(
                            (calculateCaloriesFromWeeklyGoal() *
                              (profile.macros.carbs / 100)) /
                              4
                          )}
                          onChange={(e) => {
                            const grams = parseInt(e.target.value) || 0;
                            const calories = calculateCaloriesFromWeeklyGoal();
                            let percent =
                              calories === 0
                                ? 0
                                : Math.round((grams * 4 * 100) / calories);
                            if (grams === 0) percent = 0;
                            if (percent > 70) percent = 70;
                            setProfile((prev) => ({
                              ...prev,
                              macros: {
                                ...prev.macros,
                                carbs: percent,
                              },
                            }));
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors mr-1"
                          aria-label="Węglowodany (g)"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          g
                        </span>
                      </div>
                    </div>
                    <div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={profile.macros.fats}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            macros: {
                              ...prev.macros,
                              fats: parseInt(e.target.value),
                            },
                          }))
                        }
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                      />
                      <div className="flex items-center mt-1">
                        <input
                          type="number"
                          min="0"
                          value={Math.round(
                            (calculateCaloriesFromWeeklyGoal() *
                              (profile.macros.fats / 100)) /
                              9
                          )}
                          onChange={(e) => {
                            const grams = parseInt(e.target.value) || 0;
                            const calories = calculateCaloriesFromWeeklyGoal();
                            let percent =
                              calories === 0
                                ? 0
                                : Math.round((grams * 9 * 100) / calories);
                            if (grams === 0) percent = 0;
                            if (percent > 50) percent = 50;
                            setProfile((prev) => ({
                              ...prev,
                              macros: {
                                ...prev.macros,
                                fats: percent,
                              },
                            }));
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors mr-1"
                          aria-label="Tłuszcze (g)"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          g
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Macro Distribution Chart */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {t("macros.distribution")}
                      </span>{" "}
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {t("macros.total")}:{" "}
                        {profile.macros.protein +
                          profile.macros.carbs +
                          profile.macros.fats}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-red-500 transition-all duration-500"
                          style={{ width: `${profile.macros.protein}%` }}
                        ></div>
                        <div
                          className="bg-blue-500 transition-all duration-500"
                          style={{ width: `${profile.macros.carbs}%` }}
                        ></div>
                        <div
                          className="bg-yellow-500 transition-all duration-500"
                          style={{ width: `${profile.macros.fats}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Right Sidebar - Summary & BMI */}
            <div className="space-y-6">
              {/* BMI Calculator */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-lg  dark:bg-emerald-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
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
                  BMI
                </h3>

                {profile.weight > 0 &&
                  profile.height > 0 &&
                  (() => {
                    const bmi = profile.weight / (profile.height / 100) ** 2;
                    let bmiColor = "text-emerald-600";
                    if (bmi < 18.5) bmiColor = "text-red-500";
                    else if (bmi < 25) bmiColor = "text-emerald-600";
                    else if (bmi < 30) bmiColor = "text-yellow-500";
                    else bmiColor = "text-red-600";
                    const bmiRanges = [
                      {
                        label: t("bmi.underweight"),
                        range: "< 18.5",
                        active: bmi < 18.5,
                        color: "text-red-500",
                        bg: "bg-red-50",
                      },
                      {
                        label: t("bmi.normal"),
                        range: "18.5 - 24.9",
                        active: bmi >= 18.5 && bmi < 25,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50",
                      },
                      {
                        label: t("bmi.overweight"),
                        range: "25 - 29.9",
                        active: bmi >= 25 && bmi < 30,
                        color: "text-yellow-500",
                        bg: "bg-yellow-50",
                      },
                      {
                        label: t("bmi.obese"),
                        range: "> 30",
                        active: bmi >= 30,
                        color: "text-red-600",
                        bg: "bg-red-50",
                      },
                    ];
                    return (
                      <>
                        <div className="text-center mb-4">
                          <div className={`text-3xl font-bold ${bmiColor}`}>
                            {bmi.toFixed(1)}
                          </div>
                          <div className={`text-sm font-semibold ${bmiColor}`}>
                            {(() => {
                              if (bmi < 18.5) return t("bmi.underweight");
                              if (bmi < 25) return t("bmi.normal");
                              if (bmi < 30) return t("bmi.overweight");
                              return t("bmi.obese");
                            })()}
                          </div>
                        </div>
                        <div className="space-y-2 text-xs">
                          {bmiRanges.map((r, i) => (
                            <div
                              key={i}
                              className={`flex justify-between rounded-lg px-2 py-2 ${
                                r.active
                                  ? `${r.color} font-bold ${r.bg}`
                                  : "text-slate-700 dark:text-slate-400"
                              }`}
                            >
                              <span>{r.label}</span>
                              <span>{r.range}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
              </div>{" "}
              {/* Calorie Summary */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-teal-600 dark:text-teal-400"
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
                  </div>
                  {t("calories.title")}
                </h3>

                {profile.age > 0 &&
                  profile.weight > 0 &&
                  profile.height > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {t("calories.bmr")}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round(calculateBMR())}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {t("calories.tdee")}
                        </span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">
                          {Math.round(calculateTDEE())}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <span className="text-sm font-medium text-slate-900 dark:text-blue-300">
                          {t("calories.target")}
                        </span>
                        <span className="font-bold text-lg text-teal-600 dark:text-teal-400">
                          {Math.round(calculateCaloriesFromWeeklyGoal())}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? t("saving") || "Saving..." : t("saveProfile")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
