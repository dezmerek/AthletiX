"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

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
  mealType: "breakfast" | "lunch" | "dinner";
  foods: FoodItem[];
  totalCalories: number;
  timestamp: Date;
}

interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface WaterIntake {
  glasses: number;
  goal: number;
  glassSize: number; // in ml
}

export default function NutritionPage() {
  const t = useTranslations("nutrition");

  // Mock data - in real app this would come from API/database
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({
    glasses: 6,
    goal: 8,
    glassSize: 250,
  });

  const [meals, setMeals] = useState<MealEntry[]>([
    {
      id: "1",
      mealType: "breakfast",
      foods: [
        {
          id: "1",
          name: "Płatki owsiane z mlekiem",
          calories: 320,
          protein: 12,
          carbs: 45,
          fats: 8,
          serving: "1 porcja",
          quantity: 1,
        },
        {
          id: "2",
          name: "Banan",
          calories: 95,
          protein: 1,
          carbs: 25,
          fats: 0,
          serving: "1 sztuka",
          quantity: 1,
        },
      ],
      totalCalories: 415,
      timestamp: new Date(),
    },
    {
      id: "2",
      mealType: "lunch",
      foods: [
        {
          id: "3",
          name: "Pierś z kurczaka grillowana",
          calories: 165,
          protein: 31,
          carbs: 0,
          fats: 3.6,
          serving: "100g",
          quantity: 150,
        },
        {
          id: "4",
          name: "Ryż brązowy",
          calories: 112,
          protein: 2.6,
          carbs: 22,
          fats: 0.9,
          serving: "100g",
          quantity: 80,
        },
      ],
      totalCalories: 337,
      timestamp: new Date(),
    },
  ]);

  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner"
  >("breakfast");
  const [showWaterModal, setShowWaterModal] = useState(false);

  // Calculate daily totals
  const dailyTotals = meals.reduce(
    (totals, meal) => {
      meal.foods.forEach((food) => {
        const multiplier = food.quantity / 100; // assuming base values are per 100g
        totals.calories += food.calories * multiplier;
        totals.protein += food.protein * multiplier;
        totals.carbs += food.carbs * multiplier;
        totals.fats += food.fats * multiplier;
      });
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Goals from profile (mock data)
  const nutritionGoals = {
    calories: 2200,
    protein: 132, // 24% of calories = 132g
    carbs: 275, // 50% of calories = 275g
    fats: 64, // 26% of calories = 64g
  };

  const getMealsByType = (mealType: string) => {
    return meals.filter((meal) => meal.mealType === mealType);
  };

  const getMealCalories = (mealType: string) => {
    return getMealsByType(mealType).reduce(
      (total, meal) => total + meal.totalCalories,
      0
    );
  };
  const handleAddFood = (mealType: "breakfast" | "lunch" | "dinner") => {
    setSelectedMealType(mealType);
    setShowAddFoodModal(true);
  };

  const handleAddWater = () => {
    setWaterIntake((prev) => ({
      ...prev,
      glasses: Math.min(prev.glasses + 1, prev.goal + 5),
    }));
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return "text-green-600 dark:text-green-400";
    if (percentage >= 80) return "text-yellow-600 dark:text-yellow-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getProgressBarColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-blue-500";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Calories */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("statistics.todayCalories")}
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(dailyTotals.calories)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              z {nutritionGoals.calories} {t("units.kcal")}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressBarColor(
                  dailyTotals.calories,
                  nutritionGoals.calories
                )}`}
                style={{
                  width: `${Math.min(
                    (dailyTotals.calories / nutritionGoals.calories) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>{" "}
          {/* Protein */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("nutrition.protein")}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(dailyTotals.protein)}
              {t("units.g")}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              z {nutritionGoals.protein}
              {t("units.g")}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (dailyTotals.protein / nutritionGoals.protein) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>{" "}
          {/* Carbs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("nutrition.carbs")}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(dailyTotals.carbs)}
              {t("units.g")}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              z {nutritionGoals.carbs}
              {t("units.g")}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (dailyTotals.carbs / nutritionGoals.carbs) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>{" "}
          {/* Fats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {t("nutrition.fats")}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(dailyTotals.fats)}
              {t("units.g")}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              z {nutritionGoals.fats}
              {t("units.g")}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 mt-3">
              <div
                className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (dailyTotals.fats / nutritionGoals.fats) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Meals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breakfast */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
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
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("meals.breakfast")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getMealCalories("breakfast")} {t("units.kcal")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFood("breakfast")}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t("meals.addFood")}
                </button>
              </div>

              <div className="space-y-3">
                {getMealsByType("breakfast").length > 0 ? (
                  getMealsByType("breakfast").map((meal) =>
                    meal.foods.map((food) => (
                      <div
                        key={food.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {food.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {food.serving} • {food.calories} {t("units.kcal")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {food.protein}
                            {t("units.g")} P | {food.carbs}
                            {t("units.g")} C | {food.fats}
                            {t("units.g")} F
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400 dark:text-slate-500 mb-2">
                      {t("meals.noMealsLogged")}
                    </div>
                    <button
                      onClick={() => handleAddFood("breakfast")}
                      className="text-orange-500 hover:text-orange-600 text-sm"
                    >
                      {t("meals.addFirstMeal")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Lunch */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
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
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("meals.lunch")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getMealCalories("lunch")} {t("units.kcal")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFood("lunch")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t("meals.addFood")}
                </button>
              </div>

              <div className="space-y-3">
                {getMealsByType("lunch").length > 0 ? (
                  getMealsByType("lunch").map((meal) =>
                    meal.foods.map((food) => (
                      <div
                        key={food.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {food.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {food.serving} • {food.calories} {t("units.kcal")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {food.protein}
                            {t("units.g")} P | {food.carbs}
                            {t("units.g")} C | {food.fats}
                            {t("units.g")} F
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400 dark:text-slate-500 mb-2">
                      {t("meals.noMealsLogged")}
                    </div>
                    <button
                      onClick={() => handleAddFood("lunch")}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      {t("meals.addFirstMeal")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dinner */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("meals.dinner")}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {getMealCalories("dinner")} {t("units.kcal")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddFood("dinner")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t("meals.addFood")}
                </button>
              </div>

              <div className="space-y-3">
                {getMealsByType("dinner").length > 0 ? (
                  getMealsByType("dinner").map((meal) =>
                    meal.foods.map((food) => (
                      <div
                        key={food.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {food.name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {food.serving} • {food.calories} {t("units.kcal")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {food.protein}
                            {t("units.g")} P | {food.carbs}
                            {t("units.g")} C | {food.fats}
                            {t("units.g")} F
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-400 dark:text-slate-500 mb-2">
                      {t("meals.noMealsLogged")}
                    </div>
                    <button
                      onClick={() => handleAddFood("dinner")}
                      className="text-purple-500 hover:text-purple-600 text-sm"
                    >
                      {t("meals.addFirstMeal")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Water Tracker */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                  </div>
                  {t("waterTracker.title")}
                </h3>
                <button
                  onClick={handleAddWater}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {t("waterTracker.addGlass")}
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {t("waterTracker.currentIntake")}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {waterIntake.glasses} / {waterIntake.goal}{" "}
                    {t("waterTracker.glassSize")}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (waterIntake.glasses / waterIntake.goal) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: waterIntake.goal }, (_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded-lg border-2 flex items-center justify-center ${
                        i < waterIntake.glasses
                          ? "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-600"
                          : "bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 ${
                          i < waterIntake.glasses
                            ? "text-cyan-600 dark:text-cyan-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 22 12 18.8 5.82 22 7 13.87 2 9l6.91-.74L12 2z" />
                      </svg>
                    </div>
                  ))}
                </div>

                {waterIntake.glasses >= waterIntake.goal && (
                  <div className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
                    🎉 {t("waterTracker.completed")}
                  </div>
                )}
              </div>
            </div>

            {/* Macro Distribution */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3">
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
                {t("progress.macroDistribution")}
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {t("nutrition.protein")}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {Math.round(dailyTotals.protein)}
                    {t("units.g")} (
                    {Math.round(
                      ((dailyTotals.protein * 4) / dailyTotals.calories) *
                        100 || 0
                    )}
                    %)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {t("nutrition.carbs")}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {Math.round(dailyTotals.carbs)}
                    {t("units.g")} (
                    {Math.round(
                      ((dailyTotals.carbs * 4) / dailyTotals.calories) * 100 ||
                        0
                    )}
                    %)
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    {t("nutrition.fats")}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {Math.round(dailyTotals.fats)}
                    {t("units.g")} (
                    {Math.round(
                      ((dailyTotals.fats * 9) / dailyTotals.calories) * 100 || 0
                    )}
                    %)
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-red-500 transition-all duration-500"
                      style={{
                        width: `${
                          ((dailyTotals.protein * 4) / dailyTotals.calories) *
                            100 || 0
                        }%`,
                      }}
                    />
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{
                        width: `${
                          ((dailyTotals.carbs * 4) / dailyTotals.calories) *
                            100 || 0
                        }%`,
                      }}
                    />
                    <div
                      className="bg-yellow-500 transition-all duration-500"
                      style={{
                        width: `${
                          ((dailyTotals.fats * 9) / dailyTotals.calories) *
                            100 || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                Wskazówki
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💧 {t("tips.hydrationTip")}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    🥗 {t("tips.fiberTip")}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800/50">
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    ⚖️ {t("tips.balanceTip")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Food Modal */}
        {showAddFoodModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {t("modals.addFoodTitle")} - {t(`meals.${selectedMealType}`)}
                </h3>
                <button
                  onClick={() => setShowAddFoodModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-500 dark:text-slate-400"
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

              <div className="mb-6">
                <input
                  type="text"
                  placeholder={t("modals.searchPlaceholder")}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div className="space-y-3">
                {[
                  "Płatki owsiane",
                  "Banan",
                  "Pierś z kurczaka",
                  "Ryż brązowy",
                  "Jajko",
                  "Awokado",
                ].map((food, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {food}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        100g • ~{100 + index * 50} kcal
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                      {t("actions.addFood")}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddFoodModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {t("actions.cancel")}
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  {t("actions.save")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
