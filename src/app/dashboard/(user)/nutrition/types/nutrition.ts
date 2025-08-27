export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving: string;
  quantity: number;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner";
  foods: FoodItem[];
  totalCalories: number;
}

export interface DailyNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface WaterIntake {
  current: number;
  goal: number;
  glasses: number[];
}
