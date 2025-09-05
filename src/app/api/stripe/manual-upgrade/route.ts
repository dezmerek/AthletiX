import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planType } = await request.json();

    if (
      !planType ||
      !["client", "professional", "business"].includes(planType)
    ) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Update user's premium status based on plan type
    const updateData: any = {};
    if (planType === "client") {
      updateData.isPremiumPersonal = true;
    } else if (planType === "professional") {
      updateData.isPremiumProfessional = true;
    } else if (planType === "business") {
      updateData.isPremiumBusiness = true;
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    // Store subscription info
    await db.collection("subscriptions").insertOne({
      userId: new ObjectId(session.user.id),
      stripeSubscriptionId: `manual_${Date.now()}`,
      planType: planType,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `User upgraded to ${planType} plan successfully`,
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}
