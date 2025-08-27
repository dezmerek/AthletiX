"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { FoodItem } from "../types/nutrition";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMealType: "breakfast" | "lunch" | "dinner";
  onAddFood: (food: FoodItem) => void;
}

export default function AddFoodModal({
  isOpen,
  onClose,
  selectedMealType,
  onAddFood,
}: AddFoodModalProps) {
  const t = useTranslations("nutrition");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customFood, setCustomFood] = useState({
    name: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    serving: "100g",
    quantity: 100,
  });

  if (!isOpen) return null;

  const commonFoods = [
    {
      name: "Płatki owsiane",
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fats: 6.9,
      serving: "100g",
    },
    {
      name: "Banan",
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fats: 0.3,
      serving: "100g",
    },
    {
      name: "Pierś z kurczaka",
      calories: 165,
      protein: 31,
      carbs: 0,
      fats: 3.6,
      serving: "100g",
    },
    {
      name: "Ryż brązowy",
      calories: 112,
      protein: 2.6,
      carbs: 22,
      fats: 0.9,
      serving: "100g",
    },
    {
      name: "Jajko",
      calories: 155,
      protein: 12.6,
      carbs: 1.1,
      fats: 11.3,
      serving: "100g",
    },
    {
      name: "Awokado",
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fats: 14.7,
      serving: "100g",
    },
    {
      name: "Łosoś",
      calories: 208,
      protein: 25,
      carbs: 0,
      fats: 12,
      serving: "100g",
    },
    {
      name: "Brokuły",
      calories: 34,
      protein: 2.8,
      carbs: 7,
      fats: 0.4,
      serving: "100g",
    },
  ];

  const filteredFoods = commonFoods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = (food: Omit<FoodItem, "id" | "quantity">) => {
    onAddFood({
      ...food,
      id: Date.now().toString(),
      quantity: 100,
    });
    onClose();
  };

  const handleAddCustomFood = () => {
    if (customFood.name && customFood.calories > 0) {
      onAddFood({
        ...customFood,
        id: Date.now().toString(),
      });
      onClose();
      setCustomFood({
        name: "",
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        serving: "100g",
        quantity: 100,
      });
      setShowCustomForm(false);
    }
  };

  const updateCustomFood = (
    field: keyof typeof customFood,
    value: string | number
  ) => {
    setCustomFood((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t("modals.addFoodTitle")} - {t(`meals.${selectedMealType}`)}
          </h3>
          <button
            onClick={onClose}
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

        {!showCustomForm ? (
          <>
            {/* Search and Add Custom Food */}
            <div className="mb-6 space-y-3">
              <input
                type="text"
                placeholder={t("modals.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                ➕ {t("modals.customFood")}
              </button>
            </div>

            {/* Common Foods List */}
            <div className="space-y-3">
              {filteredFoods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {food.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {food.serving} • {food.calories} {t("units.kcal")}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFood(food)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t("actions.addFood")}
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Custom Food Form */
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white">
              {t("modals.customFood")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nazwa produktu
                </label>
                <input
                  type="text"
                  value={customFood.name}
                  onChange={(e) => updateCustomFood("name", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  placeholder="np. Makaron pełnoziarnisty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("units.kcal")} (na 100g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customFood.calories}
                  onChange={(e) =>
                    updateCustomFood(
                      "calories",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("nutrition.protein")} (g na 100g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customFood.protein}
                  onChange={(e) =>
                    updateCustomFood("protein", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("nutrition.carbs")} (g na 100g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customFood.carbs}
                  onChange={(e) =>
                    updateCustomFood("carbs", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("nutrition.fats")} (g na 100g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={customFood.fats}
                  onChange={(e) =>
                    updateCustomFood("fats", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Ilość do dodania (g)
                </label>
                <input
                  type="number"
                  min="1"
                  value={customFood.quantity}
                  onChange={(e) =>
                    updateCustomFood(
                      "quantity",
                      parseInt(e.target.value) || 100
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Preview */}
            {customFood.name && customFood.calories > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h5 className="font-medium text-slate-900 dark:text-white mb-2">
                  Podgląd:
                </h5>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <div>Nazwa: {customFood.name}</div>
                  <div>
                    Kalorie:{" "}
                    {Math.round(
                      (customFood.calories * customFood.quantity) / 100
                    )}{" "}
                    kcal
                  </div>
                  <div>
                    B:{" "}
                    {Math.round(
                      ((customFood.protein * customFood.quantity) / 100) * 10
                    ) / 10}
                    g
                  </div>
                  <div>
                    W:{" "}
                    {Math.round(
                      ((customFood.carbs * customFood.quantity) / 100) * 10
                    ) / 10}
                    g
                  </div>
                  <div>
                    T:{" "}
                    {Math.round(
                      ((customFood.fats * customFood.quantity) / 100) * 10
                    ) / 10}
                    g
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setShowCustomForm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t("actions.cancel")}
              </button>
              <button
                onClick={handleAddCustomFood}
                disabled={!customFood.name || customFood.calories <= 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {t("actions.addFood")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
