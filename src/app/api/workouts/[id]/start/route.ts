import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Workout from "@/models/Workout";

interface Params {
  params: { id: string };
}

export async function POST(_: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();
  const workout = await Workout.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { $set: { status: "in-progress" } },
    { new: true }
  );
  if (!workout) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ workout });
}
