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

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subscriptions = await db
      .collection("subscriptions")
      .find({
        userId: new ObjectId(session.user.id),
      })
      .toArray();

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        isPremiumPersonal: user.isPremiumPersonal || false,
        isPremiumProfessional: user.isPremiumProfessional || false,
        isPremiumBusiness: user.isPremiumBusiness || false,
      },
      subscriptions: subscriptions,
    });
  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
