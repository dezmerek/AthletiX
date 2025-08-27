import { useState, useCallback } from "react";
import { FoodItem, MealEntry, WaterIntake } from "../types/nutrition";

export function useNutrition() {
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({
    current: 0,
    goal: 2000, // 2000ml = 8 szklanek po 250ml
    glasses: [],
  });

  const [meals, setMeals] = useState<MealEntry[]>([
    {
      id: "1",
      date: "2024-01-15",
      mealType: "breakfast",
      foods: [
        {
          id: "1",
          name: "Płatki owsiane",
          calories: 389,
          protein: 16.9,
          carbs: 66.3,
          fats: 6.9,
          serving: "100g",
          quantity: 50,
        },
        {
          id: "2",
          name: "Banan",
          calories: 89,
          protein: 1.1,
          carbs: 22.8,
          fats: 0.3,
          serving: "100g",
          quantity: 120,
        },
      ],
      totalCalories: 0,
    },
    {
      id: "2",
      date: "2024-01-15",
      mealType: "lunch",
      foods: [
        {
          id: "3",
          name: "Pierś z kurczaka",
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
          quantity: 100,
        },
      ],
      totalCalories: 0,
    },
    {
      id: "3",
      date: "2024-01-15",
      mealType: "dinner",
      foods: [
        {
          id: "5",
          name: "Łosoś",
          calories: 208,
          protein: 25,
          carbs: 0,
          fats: 12,
          serving: "100g",
          quantity: 120,
        },
        {
          id: "6",
          name: "Brokuły",
          calories: 34,
          protein: 2.8,
          carbs: 7,
          fats: 0.4,
          serving: "100g",
          quantity: 150,
        },
      ],
      totalCalories: 0,
    },
  ]);

  // Calculate daily totals
  const dailyTotals = meals.reduce(
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

  // Nutrition goals (example values)
  const nutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  };

  const getMealsByType = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner") => {
      return meals.filter((meal) => meal.mealType === mealType);
    },
    [meals]
  );

  const getMealCalories = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner") => {
      const meal = meals.find((m) => m.mealType === mealType);
      if (!meal) return 0;

      return meal.foods.reduce((total, food) => {
        const quantityRatio = food.quantity / 100;
        return total + food.calories * quantityRatio;
      }, 0);
    },
    [meals]
  );

  const addFoodToMeal = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner", food: FoodItem) => {
      setMeals((prevMeals) => {
        const existingMeal = prevMeals.find(
          (meal) => meal.mealType === mealType
        );

        if (existingMeal) {
          // Update existing meal
          return prevMeals.map((meal) =>
            meal.mealType === mealType
              ? {
                  ...meal,
                  foods: [...meal.foods, food],
                }
              : meal
          );
        } else {
          // Create new meal
          const newMeal: MealEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString().split("T")[0],
            mealType,
            foods: [food],
            totalCalories: 0,
          };
          return [...prevMeals, newMeal];
        }
      });
    },
    []
  );

  const removeFoodFromMeal = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner", foodId: string) => {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.mealType === mealType
            ? {
                ...meal,
                foods: meal.foods.filter((food) => food.id !== foodId),
              }
            : meal
        )
      );
    },
    []
  );

  const editFoodInMeal = useCallback(
    (
      mealType: "breakfast" | "lunch" | "dinner",
      foodId: string,
      updatedFood: FoodItem
    ) => {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.mealType === mealType
            ? {
                ...meal,
                foods: meal.foods.map((food) =>
                  food.id === foodId ? updatedFood : food
                ),
              }
            : meal
        )
      );
    },
    []
  );

  const addWater = useCallback(() => {
    setWaterIntake((prev) => ({
      ...prev,
      current: prev.current + 250, // 250ml na szklankę
      glasses: [...prev.glasses, Date.now()],
    }));
  }, []);

  const resetWater = useCallback(() => {
    setWaterIntake((prev) => ({
      ...prev,
      current: 0,
      glasses: [],
    }));
  }, []);

  const setWaterGoal = useCallback((goal: number) => {
    setWaterIntake((prev) => ({
      ...prev,
      goal,
    }));
  }, []);

  return {
    waterIntake,
    meals,
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
  };
}
