import { NextRequest } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Workout from "@/models/Workout";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { duration } = body ?? {};
  if (typeof duration !== "number" || duration < 0) {
    return Response.json({ error: "Invalid duration" }, { status: 400 });
  }
  await connectMongoose();
  const workout = await Workout.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { $set: { status: "completed", duration } },
    { new: true }
  );
  if (!workout) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ workout });
}
