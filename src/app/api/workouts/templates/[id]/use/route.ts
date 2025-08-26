import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Workout from "@/models/Workout";
import WorkoutTemplate from "@/models/WorkoutTemplate";

interface Params {
  params: { id: string };
}

export async function POST(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();
  const template = await WorkoutTemplate.findById(params.id);
  if (!template) {
    return Response.json({ error: "Template not found" }, { status: 404 });
  }
  const now = new Date();

  // Debug logging
  console.log(
    "Template exercises:",
    JSON.stringify(template.exercises, null, 2)
  );

  // Deep copy exercises to ensure all fields are included
  const exercises = template.exercises.map((exercise: any) => {
    console.log(
      "Processing exercise:",
      exercise.name,
      "nameEn:",
      exercise.nameEn
    );
    return {
      name: exercise.name,
      nameEn: exercise.nameEn,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      duration: exercise.duration,
      restTime: exercise.restTime,
      notes: exercise.notes,
      notesEn: exercise.notesEn,
    };
  });

  console.log("Processed exercises:", JSON.stringify(exercises, null, 2));

  const workout = await Workout.create({
    userId: session.user.id,
    name: template.name,
    nameEn: template.nameEn,
    date: now,
    type: template.type,
    exercises: exercises,
    status: "planned",
    duration: 0,
  });
  return Response.json({ workout }, { status: 201 });
}
