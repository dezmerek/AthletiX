import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Debug endpoint to check user plans and relationships
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user has any professional relationships
    const clientRelations = await db
      .collection("professionalClients")
      .find({
        clientId: new ObjectId(session.user.id),
      })
      .toArray();

    // Check if user has any plans
    const plans = await db
      .collection("plans")
      .find({
        clientId: new ObjectId(session.user.id),
      })
      .toArray();

    // Check if user has any plans where they are the professional
    const plansAsProfessional = await db
      .collection("plans")
      .find({
        professionalId: new ObjectId(session.user.id),
      })
      .toArray();

    // Check user's role
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session.user.id) });

    return NextResponse.json({
      debug: {
        userId: session.user.id,
        userRole: user?.role,
        clientRelations: clientRelations.length,
        plans: plans.length,
        plansAsProfessional: plansAsProfessional.length,
        clientRelationsDetails: clientRelations,
        plansDetails: plans,
        plansAsProfessionalDetails: plansAsProfessional,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
