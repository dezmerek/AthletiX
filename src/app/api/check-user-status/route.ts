import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user from database
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's business if exists
    const business = await db.collection("businesses").findOne({
      ownerId: new ObjectId(session.user.id),
    });

    return NextResponse.json({
      userId: session.user.id,
      user: {
        isPremiumPersonal: user.isPremiumPersonal || false,
        isPremiumProfessional: user.isPremiumProfessional || false,
        isPremiumBusiness: user.isPremiumBusiness || false,
      },
      business: business
        ? {
            _id: business._id,
            name: business.name,
            isPremiumBusiness: business.isPremiumBusiness || false,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking user status:", error);
    return NextResponse.json(
      { error: "Failed to check user status" },
      { status: 500 }
    );
  }
}
