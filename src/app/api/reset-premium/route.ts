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

    const client = await clientPromise;
    const db = client.db();

    // Reset user's premium status
    const updateData: any = {};
    if (planType === "client") {
      updateData.isPremiumPersonal = false;
    } else if (planType === "professional") {
      updateData.isPremiumProfessional = false;
    } else if (planType === "all") {
      updateData.isPremiumPersonal = false;
      updateData.isPremiumProfessional = false;
    }
    // Note: For business plans, we only update the businesses collection, not users

    const userResult = await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    // Reset business premium status if business plan
    let businessResult = null;
    if (planType === "business" || planType === "all") {
      const business = await db.collection("businesses").findOne({
        ownerId: new ObjectId(session.user.id),
      });

      if (business) {
        businessResult = await db.collection("businesses").updateOne(
          { _id: business._id },
          {
            $set: {
              isPremiumBusiness: false,
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Premium status reset for ${planType} plan`,
      userUpdated: userResult.modifiedCount > 0,
      businessUpdated: businessResult ? businessResult.modifiedCount > 0 : null,
    });
  } catch (error) {
    console.error("Error resetting premium status:", error);
    return NextResponse.json(
      { error: "Failed to reset premium status" },
      { status: 500 }
    );
  }
}
