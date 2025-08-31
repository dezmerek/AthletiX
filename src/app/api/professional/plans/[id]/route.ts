import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Pobierz szczegóły planu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("professional") && !userRoles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: planId } = await params;

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Pobierz plan z danymi klienta
    const plan = await db
      .collection("plans")
      .aggregate([
        { $match: { _id: new ObjectId(planId) } },
        {
          $lookup: {
            from: "users",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $unwind: "$client",
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            type: 1,
            status: 1,
            startDate: 1,
            endDate: 1,
            goals: 1,
            trainingPlan: 1,
            nutritionPlan: 1,
            progress: 1,
            "client._id": 1,
            "client.name": 1,
            "client.email": 1,
            "client.image": 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray();

    if (plan.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Sprawdź czy plan należy do profesjonalisty
    if (plan[0].professionalId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ plan: plan[0] });
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Aktualizuj plan
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("professional") && !userRoles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: planId } = await params;
    const updateData = await request.json();

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Sprawdź czy plan istnieje i należy do profesjonalisty
    const existingPlan = await db.collection("plans").findOne({
      _id: new ObjectId(planId),
      professionalId: new ObjectId(session.user.id),
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Przygotuj dane do aktualizacji
    const updateFields: any = { updatedAt: new Date() };

    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.description !== undefined)
      updateFields.description = updateData.description;
    if (updateData.type !== undefined) updateFields.type = updateData.type;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status;
    if (updateData.startDate !== undefined)
      updateFields.startDate = new Date(updateData.startDate);
    if (updateData.endDate !== undefined)
      updateFields.endDate = updateData.endDate
        ? new Date(updateData.endDate)
        : undefined;
    if (updateData.goals !== undefined) updateFields.goals = updateData.goals;
    if (updateData.trainingPlan !== undefined)
      updateFields.trainingPlan = updateData.trainingPlan;
    if (updateData.nutritionPlan !== undefined)
      updateFields.nutritionPlan = updateData.nutritionPlan;
    if (updateData.progress !== undefined)
      updateFields.progress = updateData.progress;

    // Aktualizuj plan
    const result = await db
      .collection("plans")
      .updateOne({ _id: new ObjectId(planId) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Pobierz zaktualizowany plan
    const updatedPlan = await db
      .collection("plans")
      .aggregate([
        { $match: { _id: new ObjectId(planId) } },
        {
          $lookup: {
            from: "users",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        {
          $unwind: "$client",
        },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            type: 1,
            status: 1,
            startDate: 1,
            endDate: 1,
            goals: 1,
            trainingPlan: 1,
            nutritionPlan: 1,
            progress: 1,
            "client._id": 1,
            "client.name": 1,
            "client.email": 1,
            "client.image": 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      message: "Plan updated successfully",
      plan: updatedPlan[0],
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Usuń plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("professional") && !userRoles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: planId } = await params;

    if (!ObjectId.isValid(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Sprawdź czy plan istnieje i należy do profesjonalisty
    const existingPlan = await db.collection("plans").findOne({
      _id: new ObjectId(planId),
      professionalId: new ObjectId(session.user.id),
    });

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Usuń plan
    const result = await db.collection("plans").deleteOne({
      _id: new ObjectId(planId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

