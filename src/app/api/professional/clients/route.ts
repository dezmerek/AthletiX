import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Pobierz klientów profesjonalisty
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź czy użytkownik jest profesjonalistą
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("professional") && !userRoles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Pobierz relacje klient-profesjonalista
    const clientRelations = await db
      .collection("professionalClients")
      .find({
        professionalId: new ObjectId(session.user.id),
      })
      .toArray();

    if (clientRelations.length === 0) {
      return NextResponse.json({ clients: [] });
    }

    // Pobierz szczegóły klientów
    const clientIds = clientRelations.map((rel) => rel.clientId);
    const clients = await db
      .collection("users")
      .find(
        {
          _id: { $in: clientIds },
        },
        {
          projection: {
            _id: 1,
            name: 1,
            email: 1,
            image: 1,
            role: 1,
            createdAt: 1,
          },
        }
      )
      .toArray();

    // Pobierz plany dla każdego klienta
    const plans = await db
      .collection("plans")
      .find({
        professionalId: new ObjectId(session.user.id),
        clientId: { $in: clientIds },
      })
      .toArray();

    // Połącz dane klientów z relacjami i planami
    const clientsWithDetails = clients.map((client) => {
      const relation = clientRelations.find(
        (rel) => rel.clientId.toString() === client._id.toString()
      );

      // Znajdź plany dla tego klienta
      const clientPlans = plans.filter(
        (plan) => plan.clientId.toString() === client._id.toString()
      );

      // Oblicz statystyki planów
      const activePlans = clientPlans.filter(
        (plan) => plan.status === "active"
      ).length;
      const totalPlans = clientPlans.length;
      const lastPlanDate =
        clientPlans.length > 0
          ? Math.max(...clientPlans.map((p) => new Date(p.updatedAt).getTime()))
          : null;

      return {
        ...client,
        status: relation?.status || "active",
        type: relation?.type || "both",
        addedAt: relation?.createdAt,
        notes: relation?.notes,
        plans: {
          total: totalPlans,
          active: activePlans,
          lastUpdated: lastPlanDate ? new Date(lastPlanDate) : null,
        },
      };
    });

    return NextResponse.json({ clients: clientsWithDetails });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Dodaj nowego klienta
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sprawdź czy użytkownik jest profesjonalistą
    const userRoles = Array.isArray(session.user.role)
      ? session.user.role
      : [session.user.role];

    if (!userRoles.includes("professional") && !userRoles.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { clientId, type = "both", notes = "" } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Sprawdź czy klient już istnieje
    const existingRelation = await db
      .collection("professionalClients")
      .findOne({
        professionalId: new ObjectId(session.user.id),
        clientId: new ObjectId(clientId),
      });

    if (existingRelation) {
      return NextResponse.json(
        { error: "Client already added" },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik istnieje
    const user = await db.collection("users").findOne({
      _id: new ObjectId(clientId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Dodaj relację klient-profesjonalista
    const newRelation = {
      professionalId: new ObjectId(session.user.id),
      clientId: new ObjectId(clientId),
      type,
      notes,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("professionalClients").insertOne(newRelation);

    return NextResponse.json(
      {
        message: "Client added successfully",
        client: {
          _id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
          type,
          status: "active",
          addedAt: newRelation.createdAt,
          notes,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
