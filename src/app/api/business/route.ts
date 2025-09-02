import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    let filter = {};
    if (ownerId) {
      try {
        const ownerObjectId = new ObjectId(ownerId);
        filter = { ownerId: ownerObjectId };
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid ownerId format" },
          { status: 400 }
        );
      }
    }

    const businesses = await db
      .collection("businesses")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const businessData = await request.json();

    // Debug logi
    console.log("Received business data:", businessData);
    console.log("OwnerId from request:", businessData.ownerId);
    console.log("OwnerId type:", typeof businessData.ownerId);

    // Walidacja wymaganych pól
    if (!businessData.name || !businessData.email || !businessData.ownerId) {
      console.log("Missing fields:", {
        name: !!businessData.name,
        email: !!businessData.email,
        ownerId: !!businessData.ownerId,
      });
      return NextResponse.json(
        { error: "Missing required fields: name, email, ownerId" },
        { status: 400 }
      );
    }

    // Konwertuj ownerId na ObjectId
    const ownerObjectId = new ObjectId(businessData.ownerId);

    // Sprawdź czy użytkownik już ma firmę
    const existingBusiness = await db
      .collection("businesses")
      .findOne({ ownerId: ownerObjectId });

    if (existingBusiness) {
      return NextResponse.json(
        { error: "User already owns a business" },
        { status: 400 }
      );
    }

    const newBusiness = {
      ...businessData,
      ownerId: ownerObjectId, // Użyj ObjectId
      createdAt: new Date(),
      updatedAt: new Date(),
      subscription: {
        plan: "free",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
        status: "active",
      },
      settings: {
        maxStaff: 5,
        maxMembers: 50,
        features: ["basic_management", "basic_analytics"],
      },
      staff: [],
      members: [],
    };

    const result = await db.collection("businesses").insertOne(newBusiness);

    // Zaktualizuj rolę użytkownika na business_owner
    await db.collection("users").updateOne(
      { _id: ownerObjectId }, // Użyj ObjectId
      {
        $addToSet: { role: "business_owner" },
        $set: { businessId: result.insertedId },
      }
    );

    return NextResponse.json({
      business: { ...newBusiness, _id: result.insertedId },
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
