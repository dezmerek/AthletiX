import { NextRequest } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Workout from "@/models/Workout";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();
  const workouts = await Workout.find({ userId: session.user.id })
    .sort({ date: -1 })
    .limit(100);
  return Response.json({ workouts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, nameEn, date, type, exercises, notes, status } = body ?? {};

  if (!name || !date || !type) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectMongoose();
  const workout = await Workout.create({
    userId: session.user.id,
    name,
    nameEn,
    date: new Date(date),
    type,
    exercises: exercises ?? [],
    notes: notes ?? undefined,
    status: status ?? "planned",
    duration: 0,
  });

  return Response.json({ workout }, { status: 201 });
}
