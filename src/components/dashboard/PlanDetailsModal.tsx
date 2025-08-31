"use client";

import { useTranslations } from "next-intl";

interface Plan {
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
  progress: {
    weight?: number;
    measurements?: {
      chest?: number;
      waist?: number;
      arms?: number;
      legs?: number;
    };
    notes?: string;
    date: Date;
  }[];
  client: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
}

export default function PlanDetailsModal({
  isOpen,
  onClose,
  plan,
}: PlanDetailsModalProps) {
  const t = useTranslations("plans.details");

  if (!isOpen || !plan) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "nutrition":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "training":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "both":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDayName = (day: number) => {
    const days = [
      "",
      "Poniedziałek",
      "Wtorek",
      "Środa",
      "Czwartek",
      "Piątek",
      "Sobota",
      "Niedziela",
    ];
    return days[day] || `Dzień ${day}`;
  };

  const getMealTypeName = (type: string) => {
    const types = {
      breakfast: "Śniadanie",
      lunch: "Obiad",
      dinner: "Kolacja",
      snack: "Przekąska",
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("title")} - {plan.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg
              className="w-6 h-6"
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

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Client Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
              {t("clientInfo")}
            </h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                {plan.client.image ? (
                  <img
                    src={plan.client.image}
                    alt={plan.client.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <span className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                    {plan.client.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-4">
                <div className="text-lg font-medium text-slate-900 dark:text-white">
                  {plan.client.name}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {plan.client.email}
                </div>
              </div>
            </div>
          </div>

          {/* Plan Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                {t("status")}
              </h4>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  plan.status
                )}`}
              >
                {t(`statuses.${plan.status}`)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                {t("clientType")}
              </h4>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                  plan.type
                )}`}
              >
                {t(`types.${plan.type}`)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                {t("dates")}
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>Start: {formatDate(plan.startDate)}</div>
                {plan.endDate && <div>Koniec: {formatDate(plan.endDate)}</div>}
              </div>
            </div>
          </div>

          {/* Description */}
          {plan.description && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                {t("description")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                {plan.description}
              </p>
            </div>
          )}

          {/* Goals */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              {t("goals")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weight Goals */}
              {(plan.goals.weight || plan.goals.targetWeight) && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    {t("weightGoals")}
                  </h4>
                  <div className="space-y-2">
                    {plan.goals.weight && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {t("currentWeight")}:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {plan.goals.weight} kg
                        </span>
                      </div>
                    )}
                    {plan.goals.targetWeight && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {t("targetWeight")}:
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {plan.goals.targetWeight} kg
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Other Goals */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  {t("otherGoals")}
                </h4>
                <div className="space-y-3">
                  {plan.goals.strength && plan.goals.strength.length > 0 && (
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("strength")}:
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {plan.goals.strength.map((goal, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.goals.endurance && plan.goals.endurance.length > 0 && (
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("endurance")}:
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {plan.goals.endurance.map((goal, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {plan.goals.flexibility &&
                    plan.goals.flexibility.length > 0 && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {t("flexibility")}:
                        </div>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          {plan.goals.flexibility.map((goal, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {plan.goals.nutrition && plan.goals.nutrition.length > 0 && (
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("nutrition")}:
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {plan.goals.nutrition.map((goal, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Training Plan */}
          {plan.trainingPlan &&
            plan.trainingPlan.workouts &&
            plan.trainingPlan.workouts.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  {t("trainingPlan")}
                </h3>
                <div className="space-y-4">
                  {plan.trainingPlan.workouts.map((workout, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {getDayName(workout.day)} - {workout.name}
                        </h4>
                      </div>

                      {workout.exercises && workout.exercises.length > 0 && (
                        <div className="space-y-2">
                          {workout.exercises.map((exercise, exIndex) => (
                            <div
                              key={exIndex}
                              className="bg-white dark:bg-slate-600 rounded p-3"
                            >
                              <div className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                                {exercise.name}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <div>Serie: {exercise.sets}</div>
                                <div>Powtórzenia: {exercise.reps}</div>
                                {exercise.weight && (
                                  <div>Waga: {exercise.weight} kg</div>
                                )}
                                {exercise.duration && (
                                  <div>Czas: {exercise.duration} min</div>
                                )}
                                <div>Odpoczynek: {exercise.rest} s</div>
                              </div>
                              {exercise.notes && (
                                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic">
                                  {exercise.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {workout.notes && (
                        <div className="mt-3 p-3 bg-white dark:bg-slate-600 rounded text-sm text-slate-600 dark:text-slate-400 italic">
                          {workout.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Nutrition Plan */}
          {plan.nutritionPlan && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                {t("nutritionPlan")}
              </h3>

              {/* Daily Overview */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  {t("dailyOverview")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {plan.nutritionPlan.dailyCalories}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t("calories")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {plan.nutritionPlan.macronutrients.protein}g
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t("protein")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {plan.nutritionPlan.macronutrients.carbs}g
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t("carbs")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {plan.nutritionPlan.macronutrients.fats}g
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t("fats")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals */}
              {plan.nutritionPlan.meals &&
                plan.nutritionPlan.meals.length > 0 && (
                  <div className="space-y-4">
                    {plan.nutritionPlan.meals.map((dayMeals, index) => (
                      <div
                        key={index}
                        className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                          {getDayName(dayMeals.day)}
                        </h4>
                        <div className="space-y-3">
                          {dayMeals.meals.map((meal, mealIndex) => (
                            <div
                              key={mealIndex}
                              className="bg-white dark:bg-slate-600 rounded p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {getMealTypeName(meal.type)}
                                </span>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {meal.calories} kcal
                                </span>
                              </div>
                              <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                                {meal.name}
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <div>P: {meal.protein}g</div>
                                <div>W: {meal.carbs}g</div>
                                <div>T: {meal.fats}g</div>
                              </div>
                              {meal.ingredients &&
                                meal.ingredients.length > 0 && (
                                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="font-medium">
                                      Składniki:
                                    </span>{" "}
                                    {meal.ingredients.join(", ")}
                                  </div>
                                )}
                              {meal.notes && (
                                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                  {meal.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Progress */}
          {plan.progress && plan.progress.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                {t("progress")}
              </h3>
              <div className="space-y-3">
                {plan.progress.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(entry.date.toString())}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entry.weight && (
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {t("weight")}:
                          </span>
                          <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {entry.weight} kg
                          </span>
                        </div>
                      )}
                      {entry.measurements && (
                        <div className="space-y-1">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {t("measurements")}:
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {entry.measurements.chest && (
                              <div>Klatka: {entry.measurements.chest} cm</div>
                            )}
                            {entry.measurements.waist && (
                              <div>Talia: {entry.measurements.waist} cm</div>
                            )}
                            {entry.measurements.arms && (
                              <div>Ręce: {entry.measurements.arms} cm</div>
                            )}
                            {entry.measurements.legs && (
                              <div>Nogi: {entry.measurements.legs} cm</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {entry.notes && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-600 rounded text-sm text-slate-600 dark:text-slate-400 italic">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Created/Updated Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-medium">{t("created")}:</span>{" "}
                {formatDate(plan.createdAt)}
              </div>
              <div>
                <span className="font-medium">{t("updated")}:</span>{" "}
                {formatDate(plan.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

