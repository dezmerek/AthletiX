import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      address,
      ownerId,
      isPremiumBusiness = false,
    } = await request.json();

    if (!name || !email || !ownerId) {
      return NextResponse.json(
        { error: "Name, email, and ownerId are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if ownerId exists in users collection
    const user = await db.collection("users").findOne({
      _id: new ObjectId(ownerId),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User with provided ownerId not found" },
        { status: 404 }
      );
    }

    // Check if user already has a business
    const existingBusiness = await db.collection("businesses").findOne({
      ownerId: new ObjectId(ownerId),
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
      ownerId: new ObjectId(ownerId),
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: isPremiumBusiness ? "pro" : "free",
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
      isPremiumBusiness,
    };

    const result = await db.collection("businesses").insertOne(business);

    return NextResponse.json({
      success: true,
      businessId: result.insertedId,
      message: "Business created successfully",
      business: {
        _id: result.insertedId,
        name,
        email,
        phone,
        address,
        ownerId,
        isPremiumBusiness,
      },
    });
  } catch (error) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: "Failed to create business" },
      { status: 500 }
    );
  }
}
