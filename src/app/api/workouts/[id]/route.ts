import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Workout from "@/models/Workout";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const body = await request.json();
    const { name, nameEn, date, type, exercises } = body;

    if (!name || !date || !type) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const workout = await Workout.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
        name,
        nameEn,
        date: new Date(date),
        type,
        exercises: exercises || [],
      },
      { new: true }
    );

    if (!workout) {
      return Response.json({ error: "Workout not found" }, { status: 404 });
    }

    return Response.json({ workout });
  } catch (error) {
    console.error("Error updating workout:", error);
    return Response.json(
      { error: "Failed to update workout" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const workout = await Workout.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!workout) {
      return Response.json({ error: "Workout not found" }, { status: 404 });
    }

    return Response.json({ message: "Workout deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout:", error);
    return Response.json(
      { error: "Failed to delete workout" },
      { status: 500 }
    );
  }
}
