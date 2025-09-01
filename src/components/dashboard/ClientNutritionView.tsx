"use client";

import { useState, useEffect } from "react";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
  quantity: number;
}

interface MealEntry {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  foods: FoodItem[];
  totalCalories: number;
}

interface ClientNutritionData {
  meals: MealEntry[];
  waterIntake: {
    current: number;
    goal: number;
    glasses: number[];
  };
}

interface ClientNutritionViewProps {
  clientId: string;
  clientName: string;
  className?: string;
  showHeader?: boolean;
}

export default function ClientNutritionView({
  clientId,
  clientName,
  className = "",
  showHeader = true,
}: ClientNutritionViewProps) {
  const [nutritionData, setNutritionData] =
    useState<ClientNutritionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (clientId) {
      fetchClientNutrition(clientId);
    }
  }, [clientId]);

  const fetchClientNutrition = async (clientId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/professional/clients/${clientId}/nutrition`
      );
      if (response.ok) {
        const data = await response.json();
        setNutritionData(data);
      } else {
        console.error("❌ API Error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching client nutrition:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generuj dostępne daty (ostatnie 30 dni)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  };

  // Pobierz posiłki dla wybranej daty
  const getMealsForDate = (date: string) => {
    if (!nutritionData?.meals) return [];
    return nutritionData.meals.filter((meal) => meal.date === date);
  };

  // Pobierz dzienne podsumowanie dla wybranej daty
  const getDailyTotals = (date: string) => {
    const dayMeals = getMealsForDate(date);

    return dayMeals.reduce(
      (totals, meal) => {
        const mealTotals = meal.foods.reduce(
          (mealTotal, food) => {
            const quantityRatio = food.quantity / 100;
            return {
              calories: mealTotal.calories + food.calories * quantityRatio,
              protein: mealTotal.protein + food.protein * quantityRatio,
              carbs: mealTotal.carbs + food.carbs * quantityRatio,
              fats: mealTotal.fats + food.fats * quantityRatio,
            };
          },
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        return {
          calories: totals.calories + mealTotals.calories,
          protein: totals.protein + mealTotals.protein,
          carbs: totals.carbs + mealTotals.carbs,
          fats: totals.fats + mealTotals.fats,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  // Pobierz posiłki dla konkretnego typu i daty
  const getMealsByTypeAndDate = (
    mealType: "breakfast" | "lunch" | "dinner",
    date: string
  ) => {
    return getMealsForDate(date).filter((meal) => meal.mealType === mealType);
  };

  const availableDates = generateAvailableDates();
  const selectedDateMeals = getMealsForDate(selectedDate);
  const dailyTotals = getDailyTotals(selectedDate);

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header (opcjonalny) */}
      {showHeader && (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Żywienie: {clientName}
          </h3>
        </div>
      )}

      {/* Wybór daty */}
      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
        <h4 className="font-medium text-slate-900 dark:text-white mb-3">
          Wybierz dzień
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedDate === date
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-500"
              }`}
            >
              {new Date(date).toLocaleDateString("pl-PL", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </button>
          ))}
        </div>
      </div>

      {/* Wybrany dzień */}
      <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
          Wybrany dzień
        </h4>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <div className="font-medium">
            {new Date(selectedDate).toLocaleDateString("pl-PL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="mt-1">
            Łącznie: {Math.round(dailyTotals.calories)} kcal
          </div>
        </div>
      </div>

      {/* Posiłki z wybranego dnia */}
      {selectedDateMeals.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-slate-900 dark:text-white">
            Posiłki z{" "}
            {new Date(selectedDate).toLocaleDateString("pl-PL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>

          {/* Śniadanie */}
          {getMealsByTypeAndDate("breakfast", selectedDate).length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h5 className="font-medium text-slate-900 dark:text-white mb-3 text-green-600">
                🍳 Śniadanie
              </h5>
              <div className="space-y-2">
                {getMealsByTypeAndDate("breakfast", selectedDate).map(
                  (meal, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-3"
                    >
                      {meal.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            {food.name} ({food.quantity}g)
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {Math.round((food.calories * food.quantity) / 100)}{" "}
                            kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Obiad */}
          {getMealsByTypeAndDate("lunch", selectedDate).length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h5 className="font-medium text-slate-900 dark:text-white mb-3 text-orange-600">
                🍽️ Obiad
              </h5>
              <div className="space-y-2">
                {getMealsByTypeAndDate("lunch", selectedDate).map(
                  (meal, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-orange-500 pl-3"
                    >
                      {meal.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            {food.name} ({food.quantity}g)
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {Math.round((food.calories * food.quantity) / 100)}{" "}
                            kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Kolacja */}
          {getMealsByTypeAndDate("dinner", selectedDate).length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <h5 className="font-medium text-slate-900 dark:text-white mb-3 text-purple-600">
                🌙 Kolacja
              </h5>
              <div className="space-y-2">
                {getMealsByTypeAndDate("dinner", selectedDate).map(
                  (meal, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-500 pl-3"
                    >
                      {meal.foods.map((food, foodIndex) => (
                        <div
                          key={foodIndex}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-slate-700 dark:text-slate-300">
                            {food.name} ({food.quantity}g)
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {Math.round((food.calories * food.quantity) / 100)}{" "}
                            kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Dzienne podsumowanie makroskładników */}
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <h5 className="font-medium text-slate-900 dark:text-white mb-3">
              Dzienne podsumowanie
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {Math.round(dailyTotals.calories)}
                </div>
                <div className="text-slate-600 dark:text-slate-400">kcal</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {Math.round(dailyTotals.protein)}g
                </div>
                <div className="text-slate-600 dark:text-slate-400">Białko</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {Math.round(dailyTotals.carbs)}g
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Węglowodany
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-900 dark:text-white">
                  {Math.round(dailyTotals.fats)}g
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Tłuszcze
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-700 p-8 rounded-lg text-center">
          <div className="text-slate-500 dark:text-slate-400">
            Brak posiłków w dniu{" "}
            {new Date(selectedDate).toLocaleDateString("pl-PL")}
          </div>
        </div>
      )}

      {/* Woda */}
      {nutritionData?.waterIntake && (
        <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">
            Spożycie wody
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div>
              <div className="font-medium">Aktualne:</div>
              <div>{nutritionData.waterIntake.current}ml</div>
            </div>
            <div>
              <div className="font-medium">Cel:</div>
              <div>{nutritionData.waterIntake.goal}ml</div>
            </div>
            <div className="col-span-2">
              <div className="font-medium mb-2">Postęp:</div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div
                  className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      (nutritionData.waterIntake.current /
                        nutritionData.waterIntake.goal) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brak danych */}
      {(!nutritionData?.meals || nutritionData.meals.length === 0) && (
        <div className="bg-slate-50 dark:bg-slate-700 p-8 rounded-lg text-center">
          <div className="text-slate-500 dark:text-slate-400">
            Brak danych o żywieniu dla tego klienta
          </div>
        </div>
      )}
    </div>
  );
}
