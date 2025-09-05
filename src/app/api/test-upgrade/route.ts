import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const { userId, planType } = await request.json();

    if (!userId || !planType) {
      return NextResponse.json(
        { error: "Missing userId or planType" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Update user's premium status
    const updateData: any = {};
    if (planType === "client") {
      updateData.isPremiumPersonal = true;
    } else if (planType === "professional") {
      updateData.isPremiumProfessional = true;
    } else if (planType === "business") {
      updateData.isPremiumBusiness = true;
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${userId} upgraded to ${planType} plan`,
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}
