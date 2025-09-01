import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Params {
  params: { id: string };
}

// Convert a professional plan to user workouts
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planId = params.id;
    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get the plan
    const plan = await db.collection("plans").findOne({
      _id: new ObjectId(planId),
      clientId: new ObjectId(session.user.id),
    });

    if (!plan) {
      return NextResponse.json(
        {
          error: "Plan not found or not authorized",
          details:
            "Plan może nie istnieć lub nie być przypisany do tego użytkownika",
        },
        { status: 404 }
      );
    }

    if (!plan.trainingPlan || !plan.trainingPlan.workouts) {
      return NextResponse.json(
        { error: "Plan has no training workouts" },
        { status: 400 }
      );
    }

    // Convert plan workouts to user workouts
    const workouts = [];
    const startDate = new Date(plan.startDate);

    for (const planWorkout of plan.trainingPlan.workouts) {
      // Calculate the date for this workout (day of week)
      const workoutDate = new Date(startDate);
      const dayOffset = planWorkout.day - 1; // Convert 1-7 to 0-6
      workoutDate.setDate(startDate.getDate() + dayOffset);

      // Convert exercises
      const exercises = planWorkout.exercises.map((exercise: any) => ({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight || 0,
        duration: exercise.duration || 0,
        restTime: exercise.rest * 60, // Convert minutes to seconds
        notes: exercise.notes || "",
      }));

      // Calculate estimated duration
      const estimatedDuration = exercises.reduce(
        (total: number, exercise: any) => {
          const exerciseTime =
            exercise.sets * exercise.reps * 3 +
            (exercise.sets * exercise.restTime) / 60;
          return total + exerciseTime;
        },
        0
      );

      const workout = {
        userId: new ObjectId(session.user.id),
        name: `${plan.name} - ${planWorkout.name}`,
        date: workoutDate,
        type: "strength", // Default to strength, could be determined by exercise types
        duration: Math.round(estimatedDuration),
        status: "planned",
        exercises: exercises,
        notes: planWorkout.notes || `Plan: ${plan.name}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      workouts.push(workout);
    }

    // Insert workouts into the database
    if (workouts.length > 0) {
      await db.collection("workouts").insertMany(workouts);
    }

    return NextResponse.json({
      message: `Successfully converted plan to ${workouts.length} workouts`,
      workouts: workouts.length,
    });
  } catch (error) {
    console.error("Error converting plan to workouts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
