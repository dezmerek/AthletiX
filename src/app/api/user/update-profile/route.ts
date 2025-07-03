import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileData = await request.json();

    // Validate profile data
    if (profileData.age && (profileData.age < 13 || profileData.age > 120)) {
      return NextResponse.json(
        { error: "Age must be between 13 and 120" },
        { status: 400 }
      );
    }

    if (
      profileData.weight &&
      (profileData.weight < 30 || profileData.weight > 300)
    ) {
      return NextResponse.json(
        { error: "Weight must be between 30 and 300 kg" },
        { status: 400 }
      );
    }

    if (
      profileData.height &&
      (profileData.height < 100 || profileData.height > 250)
    ) {
      return NextResponse.json(
        { error: "Height must be between 100 and 250 cm" },
        { status: 400 }
      );
    }

    if (
      profileData.gender &&
      !["male", "female"].includes(profileData.gender)
    ) {
      return NextResponse.json(
        { error: "Gender must be 'male' or 'female'" },
        { status: 400 }
      );
    }

    if (
      profileData.activityLevel &&
      !["sedentary", "light", "moderate", "active", "very_active"].includes(
        profileData.activityLevel
      )
    ) {
      return NextResponse.json(
        { error: "Invalid activity level" },
        { status: 400 }
      );
    }

    // Validate macros if provided
    if (profileData.macros) {
      const { protein, carbs, fats } = profileData.macros;
      if (
        protein < 10 ||
        protein > 50 ||
        carbs < 10 ||
        carbs > 70 ||
        fats < 10 ||
        fats > 50
      ) {
        return NextResponse.json(
          { error: "Macro percentages are out of valid range" },
          { status: 400 }
        );
      }

      const total = protein + carbs + fats;
      if (Math.abs(total - 100) > 1) {
        // Allow 1% tolerance
        return NextResponse.json(
          { error: "Macro percentages must sum to 100%" },
          { status: 400 }
        );
      }
    }

    // Validate calorie goal if provided
    if (profileData.calorieGoal) {
      const { type, weeklyGoal, customWeeklyGoal } = profileData.calorieGoal;

      if (!["lose_weight", "gain_weight", "maintain_weight"].includes(type)) {
        return NextResponse.json(
          { error: "Invalid calorie goal type" },
          { status: 400 }
        );
      }

      if (weeklyGoal !== undefined && (weeklyGoal < -1 || weeklyGoal > 2)) {
        return NextResponse.json(
          { error: "Weekly goal must be between -1 and 2 kg" },
          { status: 400 }
        );
      }

      if (
        customWeeklyGoal !== undefined &&
        (customWeeklyGoal < 0.1 || customWeeklyGoal > 1.5)
      ) {
        return NextResponse.json(
          { error: "Custom weekly goal must be between 0.1 and 1.5 kg" },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db();

    // Prepare update object - only update provided fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    // Update each profile field if provided
    Object.keys(profileData).forEach((key) => {
      if (profileData[key] !== undefined) {
        updateFields[`profile.${key}`] = profileData[key];
      }
    });

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(session.user.id) },
        { $set: updateFields }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { profile: 1 } }
      );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile: user.profile || {},
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
