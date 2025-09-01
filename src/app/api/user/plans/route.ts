import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get plans created by professionals for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all"; // Zmienione z "active" na "all"
    const type = searchParams.get("type") || "all";

    const client = await clientPromise;
    const db = client.db();

    // Build filter
    const filter: any = {
      clientId: new ObjectId(session.user.id),
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    // Get plans with professional information
    const plans = await db
      .collection("plans")
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "users",
            localField: "professionalId",
            foreignField: "_id",
            as: "professional",
          },
        },
        {
          $unwind: "$professional",
        },
        {
          $lookup: {
            from: "professionalClients",
            let: {
              clientId: "$clientId",
              professionalId: "$professionalId",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$clientId", "$$clientId"] },
                      { $eq: ["$professionalId", "$$professionalId"] },
                    ],
                  },
                },
              },
            ],
            as: "clientRelation",
          },
        },
        {
          $unwind: {
            path: "$clientRelation",
            preserveNullAndEmptyArrays: true,
          },
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
            "professional._id": 1,
            "professional.name": 1,
            "professional.email": 1,
            "professional.image": 1,
            "clientRelation.status": 1,
            "clientRelation.type": 1,
            "clientRelation.notes": 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Error fetching user plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
