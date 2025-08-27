"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FoodItem } from "../types/nutrition";

interface MealCardProps {
  mealType: "breakfast" | "lunch" | "dinner";
  foods: FoodItem[];
  totalCalories: number;
  onAddFood: (mealType: "breakfast" | "lunch" | "dinner") => void;
  onRemoveFood?: (
    mealType: "breakfast" | "lunch" | "dinner",
    foodId: string
  ) => void;
  onEditFood?: (
    mealType: "breakfast" | "lunch" | "dinner",
    foodId: string,
    updatedFood: FoodItem
  ) => void;
}

export default function MealCard({
  mealType,
  foods,
  totalCalories,
  onAddFood,
  onRemoveFood,
  onEditFood,
}: MealCardProps) {
  const t = useTranslations("nutrition");
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FoodItem | null>(null);

  const getMealIcon = (type: string) => {
    switch (type) {
      case "breakfast":
        return (
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
        );
      case "lunch":
        return (
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
        );
      case "dinner":
        return (
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
        );
      default:
        return null;
    }
  };

  const getMealColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-orange-100 dark:bg-orange-900/30";
      case "lunch":
        return "bg-blue-100 dark:bg-blue-900/30";
      case "dinner":
        return "bg-purple-100 dark:bg-purple-900/30";
      default:
        return "bg-slate-100 dark:bg-slate-900/30";
    }
  };

  const getMealButtonColor = (type: string) => {
    switch (type) {
      case "breakfast":
        return "bg-orange-600 hover:bg-orange-700";
      case "lunch":
        return "bg-blue-600 hover:bg-blue-700";
      case "dinner":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-slate-600 hover:bg-slate-700";
    }
  };

  const handleEditFood = (food: FoodItem) => {
    setEditingFoodId(food.id);
    setEditForm({ ...food });
  };

  const handleSaveEdit = () => {
    if (editForm && onEditFood) {
      // Recalculate calories and macros based on new quantity
      const originalFood = foods.find((f) => f.id === editForm.id);
      if (originalFood) {
        const quantityRatio = editForm.quantity / 100; // assuming original values are per 100g
        const updatedFood = {
          ...editForm,
          calories: Math.round(originalFood.calories * quantityRatio),
          protein: Math.round(originalFood.protein * quantityRatio * 10) / 10,
          carbs: Math.round(originalFood.carbs * quantityRatio * 10) / 10,
          fats: Math.round(originalFood.fats * quantityRatio * 10) / 10,
        };
        onEditFood(mealType, editForm.id, updatedFood);
      }
      setEditingFoodId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingFoodId(null);
    setEditForm(null);
  };

  const handleRemoveFood = (foodId: string) => {
    if (onRemoveFood) {
      onRemoveFood(mealType, foodId);
    }
  };

  const updateEditForm = (field: keyof FoodItem, value: string | number) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg ${getMealColor(
              mealType
            )} flex items-center justify-center`}
          >
            {getMealIcon(mealType)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t(`meals.${mealType}`)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {totalCalories} {t("units.kcal")}
            </p>
          </div>
        </div>
        <button
          onClick={() => onAddFood(mealType)}
          className={`px-4 py-2 ${getMealButtonColor(
            mealType
          )} text-white rounded-lg transition-colors text-sm font-medium`}
        >
          {t("meals.addFood")}
        </button>
      </div>

      <div className="space-y-3">
        {foods.length > 0 ? (
          foods.map((food) => (
            <div
              key={food.id}
              className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
            >
              {editingFoodId === food.id ? (
                // Edit Mode - Only Quantity
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {food.name}
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        {t("actions.save")}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
                      >
                        {t("actions.cancel")}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        {t("modals.quantity")} (g)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editForm?.quantity || 0}
                        onChange={(e) =>
                          updateEditForm(
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-600 dark:text-white"
                      />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      <div>
                        Kalorie:{" "}
                        {Math.round(
                          (food.calories * (editForm?.quantity || 0)) / 100
                        )}{" "}
                        kcal
                      </div>
                      <div>
                        B:{" "}
                        {Math.round(
                          ((food.protein * (editForm?.quantity || 0)) / 100) *
                            10
                        ) / 10}
                        g
                      </div>
                      <div>
                        W:{" "}
                        {Math.round(
                          ((food.carbs * (editForm?.quantity || 0)) / 100) * 10
                        ) / 10}
                        g
                      </div>
                      <div>
                        T:{" "}
                        {Math.round(
                          ((food.fats * (editForm?.quantity || 0)) / 100) * 10
                        ) / 10}
                        g
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {food.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {food.serving} • {food.calories} {t("units.kcal")}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {food.protein}
                        {t("units.g")} P | {food.carbs}
                        {t("units.g")} C | {food.fats}
                        {t("units.g")} F
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {onEditFood && (
                        <button
                          onClick={() => handleEditFood(food)}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-all duration-200"
                          title={t("actions.edit")}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {onRemoveFood && (
                        <button
                          onClick={() => handleRemoveFood(food.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-all duration-200"
                          title={t("actions.delete")}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-slate-400 dark:text-slate-500 mb-2">
              {t("meals.noMealsLogged")}
            </div>
            <button
              onClick={() => onAddFood(mealType)}
              className="text-orange-500 hover:text-orange-600 text-sm"
            >
              {t("meals.addFirstMeal")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
