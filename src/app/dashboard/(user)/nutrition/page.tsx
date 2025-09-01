"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import NutritionStats from "./components/NutritionStats";
import MealCard from "./components/MealCard";
import WaterTracker from "./components/WaterTracker";
import MacroDistribution from "./components/MacroDistribution";
import NutritionTips from "./components/NutritionTips";
import AddFoodModal from "./components/AddFoodModal";
import { useNutrition } from "./hooks/useNutrition";
import { FoodItem } from "./types/nutrition";
import PlanDetailsModal from "@/components/dashboard/PlanDetailsModal";

export default function NutritionPage() {
  const t = useTranslations("nutrition");
  const {
    waterIntake,
    nutritionGoals,
    getMealsByTypeAndDate,
    getMealCalories,
    getDailyTotals,
    addFoodToMeal,
    removeFoodFromMeal,
    editFoodInMeal,
    addWater,
    resetWater,
    setWaterGoal,
  } = useNutrition();

  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showTrainerPlanModal, setShowTrainerPlanModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner"
  >("breakfast");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [trainerPlan, setTrainerPlan] = useState<any>(null);

  // Generuj daty wstecz i do przodu (ostatnie 7 dni + następne 3 dni)
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();

    // Ostatnie 7 dni (wstecz)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // Następne 3 dni (do przodu)
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  };

  const availableDates = generateDateRange();
  const currentDayTotals = getDailyTotals(selectedDate);

  // Pobierz plan od trenera
  useEffect(() => {
    const fetchTrainerPlan = async () => {
      try {
        console.log("Pobieranie planu od trenera...");
        const response = await fetch("/api/user/plans");
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Otrzymane dane:", data);

          if (data.plans && Array.isArray(data.plans)) {
            const nutritionPlan = data.plans.find(
              (plan: any) => plan.type === "nutrition" || plan.type === "both"
            );
            console.log("Znaleziony plan żywieniowy:", nutritionPlan);

            if (nutritionPlan) {
              setTrainerPlan(nutritionPlan);
            } else {
              console.log("Nie znaleziono planu żywieniowego");
            }
          } else {
            console.log("Nieprawidłowa struktura danych:", data);
          }
        } else {
          console.error("Błąd HTTP:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania planu od trenera:", error);
      }
    };

    fetchTrainerPlan();
  }, []);

  const handleAddFood = (mealType: "breakfast" | "lunch" | "dinner") => {
    setSelectedMealType(mealType);
    setShowAddFoodModal(true);
  };

  const handleAddFoodToMeal = (food: FoodItem) => {
    addFoodToMeal(selectedMealType, food, selectedDate);
  };

  const handleRemoveFood = (
    mealType: "breakfast" | "lunch" | "dinner",
    foodId: string
  ) => {
    removeFoodFromMeal(mealType, foodId, selectedDate);
  };

  const handleEditFood = (
    mealType: "breakfast" | "lunch" | "dinner",
    foodId: string,
    updatedFood: FoodItem
  ) => {
    editFoodInMeal(mealType, foodId, updatedFood, selectedDate);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {t("title")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {t("description")}
              </p>
            </div>

            {/* Plan od trenera button */}
            <div className="text-right">
              <button
                onClick={() =>
                  trainerPlan ? setShowTrainerPlanModal(true) : null
                }
                disabled={!trainerPlan}
                className={`px-6 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center space-x-2 ${
                  trainerPlan
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl cursor-pointer"
                    : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>🍎</span>
                <span>
                  {trainerPlan ? "Plan od trenera" : "Brak planu od trenera"}
                </span>
              </button>
              {!trainerPlan && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Twój trener jeszcze nie utworzył planu żywieniowego
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards for Selected Date */}
        <NutritionStats
          dailyTotals={currentDayTotals}
          nutritionGoals={nutritionGoals}
        />

        {/* Date Selector */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Wybierz dzień
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => handleDateChange(date)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  selectedDate === date
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Meals for Selected Date */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Date Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {new Date(selectedDate).toLocaleDateString("pl-PL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Łącznie: {Math.round(currentDayTotals.calories)} kcal
              </p>
            </div>

            {/* Breakfast */}
            <MealCard
              mealType="breakfast"
              foods={getMealsByTypeAndDate("breakfast", selectedDate).flatMap(
                (meal) => meal.foods
              )}
              totalCalories={getMealCalories("breakfast", selectedDate)}
              onAddFood={handleAddFood}
              onRemoveFood={handleRemoveFood}
              onEditFood={handleEditFood}
            />

            {/* Lunch */}
            <MealCard
              mealType="lunch"
              foods={getMealsByTypeAndDate("lunch", selectedDate).flatMap(
                (meal) => meal.foods
              )}
              totalCalories={getMealCalories("lunch", selectedDate)}
              onAddFood={handleAddFood}
              onRemoveFood={handleRemoveFood}
              onEditFood={handleEditFood}
            />

            {/* Dinner */}
            <MealCard
              mealType="dinner"
              foods={getMealsByTypeAndDate("dinner", selectedDate).flatMap(
                (meal) => meal.foods
              )}
              totalCalories={getMealCalories("dinner", selectedDate)}
              onAddFood={handleAddFood}
              onRemoveFood={handleRemoveFood}
              onEditFood={handleEditFood}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Water Tracker */}
            <WaterTracker
              waterIntake={waterIntake}
              onAddWater={addWater}
              onResetWater={resetWater}
              onSetGoal={setWaterGoal}
            />

            {/* Macro Distribution for Selected Date */}
            <MacroDistribution dailyTotals={currentDayTotals} />

            {/* Quick Tips */}
            <NutritionTips />
          </div>
        </div>

        {/* Add Food Modal */}
        <AddFoodModal
          isOpen={showAddFoodModal}
          onClose={() => setShowAddFoodModal(false)}
          selectedMealType={selectedMealType}
          onAddFood={handleAddFoodToMeal}
        />

        {/* Trainer Plan Modal */}
        {trainerPlan && (
          <PlanDetailsModal
            isOpen={showTrainerPlanModal}
            onClose={() => setShowTrainerPlanModal(false)}
            plan={trainerPlan}
            showOnlyNutrition={true}
          />
        )}
      </div>
    </div>
  );
}
