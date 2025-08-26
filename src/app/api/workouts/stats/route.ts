import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Workout from "@/models/Workout";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectMongoose();

  const userId = session.user.id;
  const completed = await Workout.countDocuments({
    userId,
    status: "completed",
  });
  const agg = await Workout.aggregate([
    {
      $match: {
        userId: new (require("mongoose").Types.ObjectId)(userId),
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalDuration: { $sum: "$duration" },
        avgDuration: { $avg: "$duration" },
      },
    },
  ]);

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekly = await Workout.countDocuments({
    userId,
    status: "completed",
    date: { $gte: weekAgo, $lte: today },
  });

  return Response.json({
    totalWorkouts: completed,
    totalDuration: agg[0]?.totalDuration ?? 0,
    avgDuration: Math.round(agg[0]?.avgDuration ?? 0),
    weeklyWorkouts: weekly,
  });
}
