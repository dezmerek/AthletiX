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

    // Update user's premium status and roles
    const updateData: any = {};
    if (planType === "client") {
      updateData.isPremiumPersonal = true;
    } else if (planType === "professional") {
      updateData.isPremiumProfessional = true;
    } else if (planType === "business") {
      // For business plans, add business_owner role
      updateData.$addToSet = { role: "business_owner" };
    }

    const userResult = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        ...updateData,
        $set: {
          updatedAt: new Date(),
        },
      }
    );

    let businessResult = null;
    if (planType === "business") {
      // Find existing business or create new one
      let business = null;
      try {
        business = await db.collection("businesses").findOne({
          ownerId: new ObjectId(userId),
        });
      } catch (error) {
        console.error("Error finding business:", error);
        // Continue to create new business if there's an error
      }

      if (business) {
        // Update existing business
        businessResult = await db.collection("businesses").updateOne(
          { _id: business._id },
          {
            $set: {
              isPremiumBusiness: true,
              updatedAt: new Date(),
            },
          }
        );
      } else {
        // Create new business
        const newBusiness = {
          name: "Test Firma",
          email: "test@example.com",
          phone: "",
          address: "",
          ownerId: new ObjectId(userId),
          createdAt: new Date(),
          updatedAt: new Date(),
          subscription: {
            plan: "pro",
            status: "active",
            startDate: new Date(),
          },
          settings: {
            timezone: "Europe/Warsaw",
            currency: "PLN",
            notifications: {
              email: true,
              sms: false,
            },
          },
          staff: [],
          members: [],
          isPremiumBusiness: true,
        };

        businessResult = await db
          .collection("businesses")
          .insertOne(newBusiness);
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${userId} upgraded to ${planType} plan`,
      userUpdated: userResult.modifiedCount > 0,
      businessUpdated: businessResult ? businessResult.modifiedCount > 0 : null,
      businessFound: businessResult !== null,
    });
  } catch (error) {
    console.error("Error upgrading user:", error);
    return NextResponse.json(
      { error: "Failed to upgrade user" },
      { status: 500 }
    );
  }
}
