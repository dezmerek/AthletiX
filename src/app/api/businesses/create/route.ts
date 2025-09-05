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

    const { name, email, phone, address } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already has a business
    const existingBusiness = await db.collection("businesses").findOne({
      ownerId: new ObjectId(session.user.id),
    });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "User already has a business" },
        { status: 400 }
      );
    }

    // Create new business
    const business = {
      name,
      email,
      phone: phone || "",
      address: address || "",
      ownerId: new ObjectId(session.user.id),
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: "free",
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
      isPremiumBusiness: false,
    };

    const result = await db.collection("businesses").insertOne(business);

    return NextResponse.json({
      success: true,
      businessId: result.insertedId,
      message: "Business created successfully",
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}
