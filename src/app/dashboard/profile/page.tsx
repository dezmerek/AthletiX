"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface UserProfile {
  age: number;
  weight: number;
  targetWeight: number;
  height: number;
  gender: "male" | "female";
  goal: "lose_weight" | "gain_muscle" | "maintain_weight";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const [profile, setProfile] = useState<UserProfile>({
    age: 25,
    weight: 70,
    targetWeight: 70,
    height: 175,
    gender: "male",
    goal: "maintain_weight",
    activityLevel: "moderate",
    macros: {
      protein: 30,
      carbs: 40,
      fats: 30,
    },
  });

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { age, weight, height, gender } = profile;
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate TDEE based on activity level
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return bmr * multipliers[profile.activityLevel];
  };

  // Calculate target calories based on goal
  type Goal = UserProfile["goal"];
  function calculateTargetCalories(goal: Goal) {
    const tdee = calculateTDEE();
    switch (goal) {
      case "lose_weight":
        return tdee - 500;
      case "gain_muscle":
        return tdee + 300;
      case "maintain_weight":
        return tdee;
      default:
        return tdee;
    }
  }

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
    // TODO: Save to database
    console.log("Saving profile:", profile);
  };

  // Add useEffect that reacts to weight change
  useEffect(() => {
    if (profile.weight > 0) {
      const calories = Math.round(calculateTargetCalories(profile.goal));
      let macros;
      switch (profile.goal) {
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
        case "gain_muscle": {
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
  }, [profile.weight]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-slate-700 dark:text-slate-400 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Basic Info */}{" "}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Details */}
            <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-emerald-500"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("personalDetails.gender")}
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        gender: e.target.value as "male" | "female",
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="male">{t("personalDetails.male")}</option>
                    <option value="female">
                      {t("personalDetails.female")}
                    </option>
                  </select>
                </div>{" "}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("personalDetails.weight")} (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    value={profile.weight}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        weight: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>{" "}
            {/* Goals & Activity */}
            <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center mr-3">
                  <svg
                    className="w-6 h-6 text-teal-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                {t("goals.title")}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {t("goals.fitnessGoal")}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        value: "lose_weight",
                        icon: "📉",
                        color:
                          "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-400",
                        hover: "hover:border-red-400",
                      },
                      {
                        value: "maintain_weight",
                        icon: "⚖️",
                        color:
                          "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-400",
                        hover: "hover:border-yellow-400",
                      },
                      {
                        value: "gain_muscle",
                        icon: "💪",
                        color:
                          "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-400",
                        hover: "hover:border-green-400",
                      },
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => {
                          const newGoal = goal.value as Goal;
                          const calories = Math.round(
                            calculateTargetCalories(newGoal)
                          );
                          let macros;
                          switch (newGoal) {
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
                            case "gain_muscle": {
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
                          setProfile((prev) => ({
                            ...prev,
                            goal: newGoal,
                            macros,
                          }));
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          profile.goal === goal.value
                            ? goal.color
                            : `bg-white cursor-pointer dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 ${goal.hover}`
                        }`}
                      >
                        <div className="text-2xl mb-2">{goal.icon}</div>
                        <div className="font-medium">
                          {t(`goals.options.${goal.value}`)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    {t("goals.activityLevel")}
                  </label>
                  <select
                    value={profile.activityLevel}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        activityLevel: e.target
                          .value as UserProfile["activityLevel"],
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  >
                    <option value="sedentary">
                      {t("goals.activity.sedentary")}
                    </option>
                    <option value="light">{t("goals.activity.light")}</option>
                    <option value="moderate">
                      {t("goals.activity.moderate")}
                    </option>
                    <option value="active">{t("goals.activity.active")}</option>
                    <option value="very_active">
                      {t("goals.activity.veryActive")}
                    </option>
                  </select>
                </div>
              </div>
            </div>{" "}
            {/* Macros */}
            <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center mb-4 md:mb-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mr-3">
                    <svg
                      className="w-6 h-6 text-blue-500"
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
                      calculateTargetCalories(profile.goal)
                    );
                    let macros;
                    switch (profile.goal) {
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
                      case "gain_muscle": {
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
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors font-medium shadow disabled:opacity-50 cursor-pointer"
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
                          (calculateTargetCalories(profile.goal) *
                            (profile.macros.protein / 100)) /
                            4
                        )}
                        onChange={(e) => {
                          const grams = parseInt(e.target.value) || 0;
                          const calories = calculateTargetCalories(
                            profile.goal
                          );
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
                          (calculateTargetCalories(profile.goal) *
                            (profile.macros.carbs / 100)) /
                            4
                        )}
                        onChange={(e) => {
                          const grams = parseInt(e.target.value) || 0;
                          const calories = calculateTargetCalories(
                            profile.goal
                          );
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
                          (calculateTargetCalories(profile.goal) *
                            (profile.macros.fats / 100)) /
                            9
                        )}
                        onChange={(e) => {
                          const grams = parseInt(e.target.value) || 0;
                          const calories = calculateTargetCalories(
                            profile.goal
                          );
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
          <div className="space-y-8">
            {" "}
            {/* BMI Calculator */}
            <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-2">
                  <svg
                    className="w-5 h-5 text-emerald-500"
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
                            className={`flex justify-between rounded-lg px-2 py-1 ${
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
            <div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center mr-2">
                  <svg
                    className="w-5 h-5 text-teal-500"
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

              {profile.age > 0 && profile.weight > 0 && profile.height > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-400">
                      {t("calories.bmr")}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round(calculateBMR())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-400">
                      {t("calories.tdee")}
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {Math.round(calculateTDEE())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <span className="text-sm font-medium text-slate-900 dark:text-emerald-300">
                      {t("calories.target")}
                    </span>
                    <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                      {Math.round(calculateTargetCalories(profile.goal))}
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveProfile}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl cursor-pointer"
            >
              {t("saveProfile")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
