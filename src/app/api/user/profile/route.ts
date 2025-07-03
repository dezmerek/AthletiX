import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const profile = await db.collection("userprofiles").findOne({
      userId: new ObjectId(session.user.id),
    });

    return NextResponse.json({
      profile: profile || null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileData = await request.json();

    // Validate data ranges only if fields are provided
    if (profileData.age && (profileData.age < 13 || profileData.age > 120)) {
      return NextResponse.json(
        { error: "Age must be between 13 and 120" },
        { status: 400 }
      );
    }

    if (
      profileData.weight &&
      (profileData.weight < 30 || profileData.weight > 300)
    ) {
      return NextResponse.json(
        { error: "Weight must be between 30 and 300 kg" },
        { status: 400 }
      );
    }

    if (
      profileData.height &&
      (profileData.height < 100 || profileData.height > 250)
    ) {
      return NextResponse.json(
        { error: "Height must be between 100 and 250 cm" },
        { status: 400 }
      );
    }

    if (
      profileData.targetWeight &&
      (profileData.targetWeight < 30 || profileData.targetWeight > 300)
    ) {
      return NextResponse.json(
        { error: "Target weight must be between 30 and 300 kg" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // Upsert profile (update if exists, create if not)
    const profile = await db.collection("userprofiles").findOneAndUpdate(
      { userId: new ObjectId(session.user.id) },
      {
        $set: {
          userId: new ObjectId(session.user.id),
          ...profileData,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: profile?.value || null,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection("userprofiles").deleteOne({
      userId: new ObjectId(session.user.id),
    });

    return NextResponse.json({
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
