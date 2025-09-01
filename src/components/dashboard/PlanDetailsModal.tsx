"use client";

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
    workouts?: {
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
        rest: number;
        notes?: string;
      }[];
      notes?: string;
    }[];
    duration?: number;
    frequency?: number;
  };
  nutritionPlan?: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    mealPlan: {
      [day: string]: {
        breakfast: {
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          notes?: string;
        }[];
        lunch: {
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          notes?: string;
        }[];
        dinner: {
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          notes?: string;
        }[];
        snacks: {
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fats: number;
          notes?: string;
        }[];
      };
    };
    notes: string;
  };
  progress?: {
    workoutsCompleted?: number;
    totalWorkouts?: number;
    lastWorkoutDate?: string;
    currentStreak?: number;
    totalTimeSpent?: number;
    workoutHistory?: Array<{
      date: string;
      duration: number;
      calories: number;
    }>;
  };
  professional?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  clientRelation?: {
    status: string;
    type: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  showOnlyNutrition?: boolean;
}

export default function PlanDetailsModal({
  isOpen,
  onClose,
  plan,
  showOnlyNutrition = false,
}: PlanDetailsModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Szczegóły planu - {plan.name}
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
              Informacje o trenerze
            </h3>
            {plan.professional ? (
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                  {plan.professional.image ? (
                    <img
                      src={plan.professional.image}
                      alt={plan.professional.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <span className="text-slate-600 dark:text-slate-400 font-medium text-lg">
                      {plan.professional.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium text-slate-900 dark:text-white">
                    {plan.professional.name}
                  </div>
                  <div className="text-slate-600 dark:text-slate-400">
                    {plan.professional.email}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic">
                Brak informacji o trenerze
              </p>
            )}
          </div>

          {/* Plan Overview - ukryj gdy pokazujemy tylko plan żywieniowy */}
          {!showOnlyNutrition && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Status
                </h4>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    plan.status
                  )}`}
                >
                  {plan.status === "active"
                    ? "Aktywny"
                    : plan.status === "inactive"
                    ? "Nieaktywny"
                    : "Szkic"}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Typ planu
                </h4>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                    plan.type
                  )}`}
                >
                  {plan.type === "nutrition"
                    ? "Żywienie"
                    : plan.type === "training"
                    ? "Trening"
                    : "Oba"}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Daty
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <div>Start: {formatDate(plan.startDate)}</div>
                  {plan.endDate && (
                    <div>Koniec: {formatDate(plan.endDate)}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {plan.description && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">
                Opis
              </h3>
              <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                {plan.description}
              </p>
            </div>
          )}

          {/* Goals - ukryj gdy pokazujemy tylko plan żywieniowy */}
          {!showOnlyNutrition && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Cele
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weight Goals */}
                {(plan.goals.weight || plan.goals.targetWeight) && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                      Cele Wagowe
                    </h4>
                    <div className="space-y-2">
                      {plan.goals.weight && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Aktualna Waga:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {plan.goals.weight} kg
                          </span>
                        </div>
                      )}
                      {plan.goals.targetWeight && (
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Docelowa Waga:
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
                    Inne Cele
                  </h4>
                  <div className="space-y-3">
                    {plan.goals.strength && plan.goals.strength.length > 0 && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Siła:
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

                    {plan.goals.endurance &&
                      plan.goals.endurance.length > 0 && (
                        <div>
                          <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Wytrzymałość:
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
                            Elastyczność:
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

                    {plan.goals.nutrition &&
                      plan.goals.nutrition.length > 0 && (
                        <div>
                          <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Żywienie:
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
          )}

          {/* Training Plan - ukryj gdy pokazujemy tylko plan żywieniowy */}
          {!showOnlyNutrition &&
            plan.trainingPlan &&
            ((plan.trainingPlan.workouts &&
              plan.trainingPlan.workouts.length > 0) ||
            (plan.trainingPlan.trainingDays &&
              plan.trainingPlan.trainingDays.length > 0) ? (
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Plan treningowy
                </h3>

                {/* Plan Overview */}
                {(plan.trainingPlan.duration ||
                  plan.trainingPlan.frequency) && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      {plan.trainingPlan.duration && (
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Czas trwania:
                          </span>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {plan.trainingPlan.duration} tygodni
                          </div>
                        </div>
                      )}
                      {plan.trainingPlan.frequency && (
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Częstotliwość:
                          </span>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {plan.trainingPlan.frequency}x tygodniowo
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Render workouts or trainingDays */}
                  {(
                    plan.trainingPlan.workouts ||
                    plan.trainingPlan.trainingDays ||
                    []
                  ).map((workout, index) => (
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
            ) : null)}

          {/* Nutrition Plan */}
          {plan.nutritionPlan && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Plan żywieniowy
              </h3>

              {/* Daily Overview */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                  Przegląd dzienny
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {plan.nutritionPlan.dailyCalories}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Kalorie
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {plan.nutritionPlan.macros.protein}g
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Białko
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {plan.nutritionPlan.macros.carbs}g
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Węglowodany
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {plan.nutritionPlan.macros.fats}g
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Tłuszcze
                    </div>
                  </div>
                </div>

                {/* Plan Notes */}
                {plan.nutritionPlan.notes && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Notatki do planu
                    </h5>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                      {plan.nutritionPlan.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Meals */}
              {plan.nutritionPlan.mealPlan &&
                Object.keys(plan.nutritionPlan.mealPlan).length > 0 && (
                  <div className="space-y-4">
                    {Object.entries(plan.nutritionPlan.mealPlan).map(
                      ([dayNumber, dayMeals]) => (
                        <div
                          key={dayNumber}
                          className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
                        >
                          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                            Dzień {dayNumber}
                          </h4>
                          <div className="space-y-3">
                            {/* Breakfast */}
                            {dayMeals.breakfast.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  🍳 Śniadanie
                                </h5>
                                <div className="space-y-2">
                                  {dayMeals.breakfast.map((meal, mealIndex) => (
                                    <div
                                      key={mealIndex}
                                      className="bg-white dark:bg-slate-600 rounded p-3"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                          {meal.name}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {meal.calories} kcal
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <div>P: {meal.protein}g</div>
                                        <div>W: {meal.carbs}g</div>
                                        <div>T: {meal.fats}g</div>
                                      </div>
                                      {meal.notes && (
                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                          {meal.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Lunch */}
                            {dayMeals.lunch.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  🍽️ Obiad
                                </h5>
                                <div className="space-y-2">
                                  {dayMeals.lunch.map((meal, mealIndex) => (
                                    <div
                                      key={mealIndex}
                                      className="bg-white dark:bg-slate-600 rounded p-3"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                          {meal.name}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {meal.calories} kcal
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <div>P: {meal.protein}g</div>
                                        <div>W: {meal.carbs}g</div>
                                        <div>T: {meal.fats}g</div>
                                      </div>
                                      {meal.notes && (
                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                          {meal.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dinner */}
                            {dayMeals.dinner.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  🌙 Kolacja
                                </h5>
                                <div className="space-y-2">
                                  {dayMeals.dinner.map((meal, mealIndex) => (
                                    <div
                                      key={mealIndex}
                                      className="bg-white dark:bg-slate-600 rounded p-3"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                          {meal.name}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {meal.calories} kcal
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <div>P: {meal.protein}g</div>
                                        <div>W: {meal.carbs}g</div>
                                        <div>T: {meal.fats}g</div>
                                      </div>
                                      {meal.notes && (
                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                          {meal.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Snacks */}
                            {dayMeals.snacks.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  🍎 Przekąski
                                </h5>
                                <div className="space-y-2">
                                  {dayMeals.snacks.map((meal, mealIndex) => (
                                    <div
                                      key={mealIndex}
                                      className="bg-white dark:bg-slate-600 rounded p-3"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">
                                          {meal.name}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {meal.calories} kcal
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <div>P: {meal.protein}g</div>
                                        <div>W: {meal.carbs}g</div>
                                        <div>T: {meal.fats}g</div>
                                      </div>
                                      {meal.notes && (
                                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                                          {meal.notes}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          )}

          {/* Progress */}
          {plan.progress &&
            plan.progress.workoutHistory &&
            plan.progress.workoutHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                  Postęp
                </h3>
                <div className="space-y-3">
                  {plan.progress.workoutHistory.map((entry, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Czas:
                          </span>
                          <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {entry.duration} min
                          </span>
                        </div>
                        <div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            Kalorie:
                          </span>
                          <span className="ml-2 font-medium text-slate-900 dark:text-white">
                            {entry.calories} kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Created/Updated Info */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div>
                <span className="font-medium">Utworzono:</span>{" "}
                {formatDate(plan.createdAt)}
              </div>
              <div>
                <span className="font-medium">Zaktualizowano:</span>{" "}
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
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
