import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("🔍 Fetching progress for userId:", userId);

    const client = await clientPromise;
    const db = client.db();

    // Pobierz dane postępów użytkownika
    const userProgress = await db.collection("userprogresses").findOne({
      userId: new ObjectId(userId),
    });

    console.log("📊 Found userProgress:", userProgress ? "YES" : "NO");
    if (userProgress) {
      console.log(
        "📈 weightEntries count:",
        userProgress.weightEntries?.length || 0
      );
      console.log(
        "📏 measurements count:",
        userProgress.measurements?.length || 0
      );
    }

    if (!userProgress) {
      return NextResponse.json({
        weightEntries: [],
        measurements: [],
        goals: [],
      });
    }

    return NextResponse.json({
      weightEntries: userProgress.weightEntries || [],
      measurements: userProgress.measurements || [],
      goals: userProgress.goals || [],
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
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

    const userId = session.user.id;
    console.log("💾 Saving progress for userId:", userId);

    const { weightEntries, measurements, goals } = await request.json();
    console.log("📊 Received data:", {
      weightEntriesCount: weightEntries?.length || 0,
      measurementsCount: measurements?.length || 0,
      goalsCount: goals?.length || 0,
    });

    const client = await clientPromise;
    const db = client.db();

    // Aktualizuj lub utwórz dokument postępów użytkownika
    console.log("🗄️ Attempting to save to database...");

    const result = await db.collection("userprogresses").updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          weightEntries: weightEntries || [],
          measurements: measurements || [],
          goals: goals || [],
          updatedAt: new Date(),
        },
        $setOnInsert: {
          userId: new ObjectId(userId),
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("✅ Database operation result:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId,
    });

    return NextResponse.json({
      success: true,
      message: "Progress data saved successfully",
      result,
    });
  } catch (error) {
    console.error("Error saving user progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
