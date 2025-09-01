import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return NextResponse.json(
        { error: "businessId is required" },
        { status: 400 }
      );
    }

    const memberships = await db
      .collection("memberships")
      .find({ businessId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ memberships });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const membershipData = await request.json();

    // Walidacja wymaganych pól
    if (
      !membershipData.businessId ||
      !membershipData.memberId ||
      !membershipData.plan
    ) {
      return NextResponse.json(
        { error: "Missing required fields: businessId, memberId, plan" },
        { status: 400 }
      );
    }

    // Sprawdź czy członek już istnieje w tej firmie
    const existingMembership = await db.collection("memberships").findOne({
      businessId: membershipData.businessId,
      memberId: membershipData.memberId,
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "Member already exists in this business" },
        { status: 400 }
      );
    }

    const newMembership = {
      ...membershipData,
      status: "active",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
      createdAt: new Date(),
      updatedAt: new Date(),
      payments: [],
      attendance: [],
    };

    const result = await db.collection("memberships").insertOne(newMembership);

    // Dodaj członka do listy członków firmy
    await db
      .collection("businesses")
      .updateOne(
        { _id: membershipData.businessId },
        { $addToSet: { members: membershipData.memberId } }
      );

    return NextResponse.json({
      membership: { ...newMembership, _id: result.insertedId },
      message: "Membership created successfully",
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  }
}
