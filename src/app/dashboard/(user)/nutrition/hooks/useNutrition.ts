import { useState, useCallback, useEffect } from "react";
import { FoodItem, MealEntry, WaterIntake } from "../types/nutrition";

export function useNutrition() {
  // Domyślne dane dla dzisiejszego dnia
  const today = new Date().toISOString().split("T")[0];

  // Najpierw zdefiniuj useState
  const [waterIntake, setWaterIntake] = useState<WaterIntake>({
    current: 0,
    goal: 2000, // 2000ml = 8 szklanek po 250ml
    glasses: [],
  });

  const [meals, setMeals] = useState<MealEntry[]>([]);

  // Wczytaj dane z bazy danych przy starcie
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        const response = await fetch("/api/user/nutrition");
        if (response.ok) {
          const data = await response.json();
          setMeals(data.meals || []);
          setWaterIntake(
            data.waterIntake || {
              current: 0,
              goal: 2000,
              glasses: [],
            }
          );
        }
      } catch (error) {
        console.error("Error fetching nutrition data:", error);
      }
    };

    fetchNutritionData();
  }, []);

  // Zapisz dane w bazie danych za każdym razem gdy się zmienią
  useEffect(() => {
    const saveNutritionData = async () => {
      try {
        await fetch("/api/user/nutrition", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meals,
            waterIntake,
          }),
        });
      } catch (error) {
        console.error("Error saving nutrition data:", error);
      }
    };

    // Zapisz tylko jeśli są jakieś dane (nie przy pierwszym renderze)
    if (meals.length > 0 || waterIntake.current > 0) {
      saveNutritionData();
    }
  }, [meals, waterIntake]);

  // Pobierz unikalne daty z posiłków
  const getUniqueDates = useCallback(() => {
    const dates = [...new Set(meals.map((meal) => meal.date))];
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [meals]);

  // Pobierz posiłki dla konkretnej daty
  const getMealsByDate = useCallback(
    (date: string) => {
      return meals.filter((meal) => meal.date === date);
    },
    [meals]
  );

  // Pobierz posiłki dla konkretnego typu i daty
  const getMealsByTypeAndDate = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner", date: string) => {
      return meals.filter(
        (meal) => meal.mealType === mealType && meal.date === date
      );
    },
    [meals]
  );

  // Pobierz posiłki dla konkretnego typu (wszystkie daty)
  const getMealsByType = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner") => {
      return meals.filter((meal) => meal.mealType === mealType);
    },
    [meals]
  );

  // Pobierz kalorie dla konkretnego typu posiłku i daty
  const getMealCalories = useCallback(
    (mealType: "breakfast" | "lunch" | "dinner", date: string = today) => {
      const meal = meals.find(
        (m) => m.mealType === mealType && m.date === date
      );
      if (!meal) return 0;

      return meal.foods.reduce((total, food) => {
        const quantityRatio = food.quantity / 100;
        return total + food.calories * quantityRatio;
      }, 0);
    },
    [meals, today]
  );

  // Pobierz dzienne podsumowanie dla konkretnej daty
  const getDailyTotals = useCallback(
    (date: string = today) => {
      const dayMeals = meals.filter((meal) => meal.date === date);

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
    },
    [meals, today]
  );

  // Oblicz dzienne podsumowanie dla wszystkich dni
  const dailyTotals = getDailyTotals(today);

  // Nutrition goals (example values)
  const nutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  };

  const addFoodToMeal = useCallback(
    (
      mealType: "breakfast" | "lunch" | "dinner",
      food: FoodItem,
      date: string = today
    ) => {
      setMeals((prevMeals) => {
        const existingMeal = prevMeals.find(
          (meal) => meal.mealType === mealType && meal.date === date
        );

        if (existingMeal) {
          // Update existing meal
          return prevMeals.map((meal) =>
            meal.mealType === mealType && meal.date === date
              ? {
                  ...meal,
                  foods: [...meal.foods, food],
                }
              : meal
          );
        } else {
          // Create new meal for this date
          const newMeal: MealEntry = {
            id: Date.now().toString(),
            date: date,
            mealType,
            foods: [food],
            totalCalories: 0,
          };
          return [...prevMeals, newMeal];
        }
      });
    },
    [today]
  );

  const removeFoodFromMeal = useCallback(
    (
      mealType: "breakfast" | "lunch" | "dinner",
      foodId: string,
      date: string = today
    ) => {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.mealType === mealType && meal.date === date
            ? {
                ...meal,
                foods: meal.foods.filter((food) => food.id !== foodId),
              }
            : meal
        )
      );
    },
    [today]
  );

  const editFoodInMeal = useCallback(
    (
      mealType: "breakfast" | "lunch" | "dinner",
      foodId: string,
      updatedFood: FoodItem,
      date: string = today
    ) => {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.mealType === mealType && meal.date === date
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
    [today]
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
    getMealsByTypeAndDate,
    getMealsByDate,
    getMealCalories,
    getDailyTotals,
    getUniqueDates,
    addFoodToMeal,
    removeFoodFromMeal,
    editFoodInMeal,
    addWater,
    resetWater,
    setWaterGoal,
  };
}
