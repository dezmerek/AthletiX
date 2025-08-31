import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Usuń klienta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: clientId } = await params;

    if (!ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Usuń relację klient-profesjonalista
    const result = await db.collection("professionalClients").deleteOne({
      professionalId: new ObjectId(session.user.id),
      clientId: new ObjectId(clientId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client removed successfully" });
  } catch (error) {
    console.error("Error removing client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Aktualizuj klienta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: clientId } = await params;
    const { type, status, notes } = await request.json();

    if (!ObjectId.isValid(clientId)) {
      return NextResponse.json({ error: "Invalid client ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Aktualizuj relację klient-profesjonalista
    const updateData: any = { updatedAt: new Date() };

    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const result = await db.collection("professionalClients").updateOne(
      {
        professionalId: new ObjectId(session.user.id),
        clientId: new ObjectId(clientId),
      },
      {
        $set: updateData,
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Pobierz zaktualizowane dane klienta
    const updatedRelation = await db.collection("professionalClients").findOne({
      professionalId: new ObjectId(session.user.id),
      clientId: new ObjectId(clientId),
    });

    const user = await db.collection("users").findOne({
      _id: new ObjectId(clientId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedClient = {
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      type: updatedRelation?.type || "both",
      status: updatedRelation?.status || "active",
      addedAt: updatedRelation?.createdAt,
      notes: updatedRelation?.notes,
    };

    return NextResponse.json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
