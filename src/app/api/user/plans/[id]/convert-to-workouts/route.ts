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

    if (!plan.trainingPlan) {
      return NextResponse.json(
        { error: "Plan has no training plan" },
        { status: 400 }
      );
    }

    // Check if plan has workouts (old structure) or trainingDays (new structure)
    const hasWorkouts =
      plan.trainingPlan.workouts && plan.trainingPlan.workouts.length > 0;
    const hasTrainingDays =
      plan.trainingPlan.trainingDays &&
      plan.trainingPlan.trainingDays.length > 0;

    if (!hasWorkouts && !hasTrainingDays) {
      return NextResponse.json(
        { error: "Plan has no training workouts or training days" },
        { status: 400 }
      );
    }

    // Convert plan workouts to user workouts
    const workouts = [];
    const startDate = new Date(plan.startDate);

    // Handle new structure (trainingDays)
    if (hasTrainingDays) {
      for (const trainingDay of plan.trainingPlan.trainingDays) {
        // Calculate the date for this workout (day of week)
        const workoutDate = new Date(startDate);
        const dayOffset = trainingDay.day - 1; // Convert 1-7 to 0-6
        workoutDate.setDate(startDate.getDate() + dayOffset);

        // Convert exercises
        const exercises = trainingDay.exercises.map((exercise: any) => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || 0,
          duration: exercise.duration || 0,
          restTime: exercise.restTime || 60, // Use restTime in seconds
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
          name: `${plan.name} - ${trainingDay.name}`,
          date: workoutDate,
          type: "strength", // Default to strength, could be determined by exercise types
          duration: Math.round(estimatedDuration),
          status: "planned",
          exercises: exercises,
          notes: trainingDay.notes || `Plan: ${plan.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        workouts.push(workout);
      }
    }

    // Handle old structure (workouts) - for backward compatibility
    if (hasWorkouts) {
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
