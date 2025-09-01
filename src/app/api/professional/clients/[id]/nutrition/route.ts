import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: clientId } = await params;
    const professionalId = session.user.id;

    // Sprawdź czy profesjonalista ma dostęp do tego klienta
    const client = await clientPromise;
    const db = client.db();

    const clientRelation = await db.collection("professionalClients").findOne({
      professionalId: new ObjectId(professionalId),
      clientId: new ObjectId(clientId),
    });

    if (!clientRelation) {
      return NextResponse.json(
        { error: "Client not found or access denied" },
        { status: 404 }
      );
    }

    // Pobierz dane żywieniowe klienta
    const [userNutrition, dailyNutrition] = await Promise.all([
      // Dane z kolekcji userNutrition (jeśli istnieje)
      db.collection("userNutrition").findOne({ userId: clientId }),

      // Dane z kolekcji dailynutritions (jeśli istnieje)
      db
        .collection("dailynutritions")
        .find({ userId: clientId })
        .sort({ date: -1 })
        .limit(10)
        .toArray(),
    ]);

    let meals: Array<{
      id: string;
      date: string;
      mealType: "breakfast" | "lunch" | "dinner";
      foods: Array<{
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        serving: string;
        quantity: number;
      }>;
      totalCalories: number;
    }> = [];

    let waterIntake = {
      current: 0,
      goal: 2000,
      glasses: [],
    };

    // Jeśli są dane w userNutrition, użyj ich
    if (userNutrition && userNutrition.meals) {
      meals = userNutrition.meals.map((meal: any) => ({
        id: meal.id || meal._id?.toString() || Date.now().toString(),
        date: meal.date,
        mealType: meal.mealType,
        foods: meal.foods || [],
        totalCalories: meal.totalCalories || 0,
      }));

      if (userNutrition.waterIntake) {
        waterIntake = userNutrition.waterIntake;
      }
    }
    // Jeśli nie ma userNutrition, spróbuj z dailynutritions
    else if (dailyNutrition.length > 0) {
      meals = dailyNutrition
        .map((daily: any) => {
          const mealEntries = daily.mealEntries || [];
          return mealEntries.map((meal: any) => ({
            id: meal.id || meal._id?.toString() || Date.now().toString(),
            date: daily.date,
            mealType: meal.mealType || "breakfast",
            foods: meal.foods || [],
            totalCalories: meal.totalCalories || 0,
          }));
        })
        .flat();
    }

    // Oblicz całkowite kalorie dla każdego posiłku
    meals = meals.map((meal) => ({
      ...meal,
      totalCalories: meal.foods.reduce((total, food) => {
        const quantityRatio = food.quantity / 100;
        return total + food.calories * quantityRatio;
      }, 0),
    }));

    // Sortuj posiłki po dacie (najnowsze pierwsze)
    meals.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      userId: clientId,
      meals: meals.slice(0, 20), // Ostatnie 20 posiłków
      waterIntake,
    });
  } catch (error) {
    console.error("Error fetching client nutrition:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
