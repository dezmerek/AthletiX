"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import NutritionStats from "./components/NutritionStats";
import MealCard from "./components/MealCard";
import WaterTracker from "./components/WaterTracker";
import MacroDistribution from "./components/MacroDistribution";
import NutritionTips from "./components/NutritionTips";
import AddFoodModal from "./components/AddFoodModal";
import { useNutrition, FoodItem } from "./hooks/useNutrition";

export default function NutritionPage() {
  const t = useTranslations("nutrition");
  const {
    waterIntake,
    dailyTotals,
    nutritionGoals,
    getMealsByType,
    getMealCalories,
    addFoodToMeal,
    removeFoodFromMeal,
    editFoodInMeal,
    addWater,
    resetWater,
    setWaterGoal,
  } = useNutrition();

  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner"
  >("breakfast");

  const handleAddFood = (mealType: "breakfast" | "lunch" | "dinner") => {
    setSelectedMealType(mealType);
    setShowAddFoodModal(true);
  };

  const handleAddFoodToMeal = (food: FoodItem) => {
    addFoodToMeal(selectedMealType, food);
  };

  const handleRemoveFood = (
    mealType: "breakfast" | "lunch" | "dinner",
    foodId: string
  ) => {
    removeFoodFromMeal(mealType, foodId);
  };

  const handleEditFood = (
    mealType: "breakfast" | "lunch" | "dinner",
    foodId: string,
    updatedFood: FoodItem
  ) => {
    editFoodInMeal(mealType, foodId, updatedFood);
  };

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

        {/* Statistics Cards */}
        <NutritionStats
          dailyTotals={dailyTotals}
          nutritionGoals={nutritionGoals}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Meals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breakfast */}
            <MealCard
              mealType="breakfast"
              foods={getMealsByType("breakfast").flatMap((meal) => meal.foods)}
              totalCalories={getMealCalories("breakfast")}
              onAddFood={handleAddFood}
              onRemoveFood={handleRemoveFood}
              onEditFood={handleEditFood}
            />

            {/* Lunch */}
            <MealCard
              mealType="lunch"
              foods={getMealsByType("lunch").flatMap((meal) => meal.foods)}
              totalCalories={getMealCalories("lunch")}
              onAddFood={handleAddFood}
              onRemoveFood={handleRemoveFood}
              onEditFood={handleEditFood}
            />

            {/* Dinner */}
            <MealCard
              mealType="dinner"
              foods={getMealsByType("dinner").flatMap((meal) => meal.foods)}
              totalCalories={getMealCalories("dinner")}
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

            {/* Macro Distribution */}
            <MacroDistribution dailyTotals={dailyTotals} />

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
      </div>
    </div>
  );
}
