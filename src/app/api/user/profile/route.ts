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

    // Log incoming data for debugging
    console.log("Incoming profile data:", JSON.stringify(profileData, null, 2));

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

    // Check if profile exists first
    const existingProfile = await db.collection("userprofiles").findOne({
      userId: new ObjectId(session.user.id),
    });

    let profile;

    if (existingProfile) {
      // Update existing profile - remove _id and other protected fields
      const { _id, userId, createdAt, ...safeProfileData } = profileData;

      profile = await db.collection("userprofiles").findOneAndUpdate(
        { userId: new ObjectId(session.user.id) },
        {
          $set: {
            ...safeProfileData,
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      );
    } else {
      // Create new profile
      const newProfile = {
        userId: new ObjectId(session.user.id),
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection("userprofiles").insertOne(newProfile);
      profile = { value: newProfile };
    }

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
