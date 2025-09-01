import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Pobierz dane żywieniowe użytkownika
    const nutritionData = await db.collection("userNutrition").findOne({
      userId: session.user.id,
    });

    if (!nutritionData) {
      // Jeśli nie ma danych, zwróć domyślne
      return NextResponse.json({
        meals: [],
        waterIntake: {
          current: 0,
          goal: 2000,
          glasses: [],
        },
      });
    }

    return NextResponse.json({
      meals: nutritionData.meals || [],
      waterIntake: nutritionData.waterIntake || {
        current: 0,
        goal: 2000,
        glasses: [],
      },
    });
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { meals, waterIntake } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // Zapisz lub zaktualizuj dane żywieniowe użytkownika
    const result = await db.collection("userNutrition").updateOne(
      { userId: session.user.id },
      {
        $set: {
          userId: session.user.id,
          meals: meals || [],
          waterIntake: waterIntake || {
            current: 0,
            goal: 2000,
            glasses: [],
          },
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "Nutrition data saved successfully",
      result,
    });
  } catch (error) {
    console.error("Error saving nutrition data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
