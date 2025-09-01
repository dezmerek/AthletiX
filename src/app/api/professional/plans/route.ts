import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Pobierz wszystkie plany profesjonalisty
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const client = await clientPromise;
    const db = client.db();

    // Buduj filtr
    const filter: {
      professionalId: ObjectId;
      clientId?: ObjectId;
      status?: string;
      type?: string;
    } = {
      professionalId: new ObjectId(session.user.id),
    };

    if (clientId) {
      filter.clientId = new ObjectId(clientId);
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    // Pobierz plany z danymi klientów, profilami i relacjami
    const plans = await db
      .collection("plans")
      .aggregate([
        { $match: filter },
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
          $lookup: {
            from: "userprofiles",
            localField: "clientId",
            foreignField: "userId",
            as: "clientProfile",
          },
        },
        {
          $unwind: {
            path: "$clientProfile",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "professionalClients",
            let: { clientId: "$clientId", professionalId: "$professionalId" },
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
            "client._id": 1,
            "client.name": 1,
            "client.email": 1,
            "client.image": 1,
            "clientProfile.weight": 1,
            "clientProfile.targetWeight": 1,
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
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Utwórz nowy plan
export async function POST(request: NextRequest) {
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

    const {
      clientId,
      name,
      description,
      type,
      startDate,
      endDate,
      goals,
      trainingPlan,
      nutritionPlan,
    } = await request.json();

    if (!clientId || !name || !type || !startDate) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Wymagane pola: clientId, name, type, startDate",
          received: { clientId, name, type, startDate },
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Sprawdź czy klient istnieje
    const clientUser = await db.collection("users").findOne({
      _id: new ObjectId(clientId),
    });

    if (!clientUser) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Sprawdź czy relacja klient-profesjonalista istnieje
    let clientRelation = await db.collection("professionalClients").findOne({
      professionalId: new ObjectId(session.user.id),
      clientId: new ObjectId(clientId),
    });

    // Jeśli relacja nie istnieje, utwórz ją automatycznie
    if (!clientRelation) {
      const newRelation = {
        professionalId: new ObjectId(session.user.id),
        clientId: new ObjectId(clientId),
        type: "both", // Domyślny typ
        notes: "Automatycznie utworzone przy tworzeniu planu",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db
        .collection("professionalClients")
        .insertOne(newRelation);
      clientRelation = {
        _id: result.insertedId,
        ...newRelation,
      };
    }

    // Utwórz nowy plan
    const newPlan = {
      professionalId: new ObjectId(session.user.id),
      clientId: new ObjectId(clientId),
      name,
      description,
      type,
      status: "draft",
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      goals: goals || {},
      trainingPlan: trainingPlan || undefined,
      nutritionPlan: nutritionPlan || undefined,
      progress: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("plans").insertOne(newPlan);

    // Pobierz utworzony plan z danymi klienta i profilem
    const createdPlan = await db
      .collection("plans")
      .aggregate([
        { $match: { _id: result.insertedId } },
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
          $lookup: {
            from: "userprofiles",
            localField: "clientId",
            foreignField: "userId",
            as: "clientProfile",
          },
        },
        {
          $unwind: {
            path: "$clientProfile",
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
            "client._id": 1,
            "client.name": 1,
            "client.email": 1,
            "client.image": 1,
            "clientProfile.weight": 1,
            "clientProfile.targetWeight": 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json(
      {
        message: "Plan created successfully",
        plan: createdPlan[0],
        clientRelationCreated:
          !clientRelation._id || clientRelation._id === result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
