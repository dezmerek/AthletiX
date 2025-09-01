import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Params {
  params: Promise<{ id: string }>;
}

// Update plan progress when workout is completed/skipped
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: planId } = await params;
    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const { workoutId, workoutName, duration, status } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    // Get the plan
    const plan = await db.collection("plans").findOne({
      _id: new ObjectId(planId),
      clientId: new ObjectId(session.user.id),
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found or not authorized" },
        { status: 404 }
      );
    }

    // Get current progress or initialize
    const currentProgress = plan.progress || {
      workoutsCompleted: 0,
      totalWorkouts: 0,
      lastWorkoutDate: null,
      currentStreak: 0,
      totalTimeSpent: 0,
      workoutHistory: [],
    };

    // Calculate total workouts from training plan
    const totalWorkouts =
      (plan.trainingPlan?.workouts?.length || 0) +
      (plan.trainingPlan?.trainingDays?.length || 0);

    // Update progress based on workout status
    let updatedProgress = { ...currentProgress };

    if (status === "completed") {
      updatedProgress.workoutsCompleted += 1;
      updatedProgress.totalTimeSpent += duration;
      updatedProgress.lastWorkoutDate = new Date().toISOString();

      // Calculate current streak
      if (updatedProgress.lastWorkoutDate) {
        const lastDate = new Date(updatedProgress.lastWorkoutDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 1) {
          updatedProgress.currentStreak += 1;
        } else {
          updatedProgress.currentStreak = 1;
        }
      }
    }

    // Add workout to history
    updatedProgress.workoutHistory.push({
      workoutId,
      name: workoutName,
      completedAt: new Date().toISOString(),
      duration,
      status,
    });

    // Keep only last 20 workouts in history
    if (updatedProgress.workoutHistory.length > 20) {
      updatedProgress.workoutHistory =
        updatedProgress.workoutHistory.slice(-20);
    }

    // Update the plan with new progress
    await db.collection("plans").updateOne(
      { _id: new ObjectId(planId) },
      {
        $set: {
          progress: updatedProgress,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      message: "Progress updated successfully",
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("Error updating plan progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
