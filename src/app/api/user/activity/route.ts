import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Update user activity status
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isOnline } = await request.json();
    const client = await clientPromise;
    const db = client.db();

    const updateData: {
      lastActivity: Date;
      lastSeen: Date;
      isOnline?: boolean;
    } = {
      lastActivity: new Date(),
      lastSeen: new Date(),
    };

    // Only update isOnline if explicitly provided
    if (typeof isOnline === "boolean") {
      updateData.isOnline = isOnline;
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: updateData,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get online users and recently active users
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get users who are online or were active in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const now = new Date();

    const users = await db
      .collection("users")
      .find(
        {
          $or: [
            { isOnline: true },
            { lastActivity: { $gte: fifteenMinutesAgo } },
          ],
        },
        {
          projection: {
            name: 1,
            email: 1,
            role: 1,
            activeContext: 1,
            lastSeen: 1,
            lastActivity: 1,
            isOnline: 1,
          },
        }
      )
      .limit(50)
      .sort({ lastActivity: -1 })
      .toArray();

    // Process users to determine online status
    const processedUsers = users.map((user) => {
      const lastActivityTime = user.lastActivity
        ? new Date(user.lastActivity)
        : null;
      const timeSinceLastActivity = lastActivityTime
        ? now.getTime() - lastActivityTime.getTime()
        : Infinity;

      // User is online if:
      // 1. Explicitly marked as online AND last activity within 5 minutes
      // 2. OR last activity is within 2 minutes (auto-online)
      const isCurrentlyOnline =
        (user.isOnline && timeSinceLastActivity <= 5 * 60 * 1000) ||
        timeSinceLastActivity <= 2 * 60 * 1000;

      return {
        id: user._id.toString(),
        name: user.name || user.email?.split("@")[0] || "Użytkownik",
        role: Array.isArray(user.role) ? user.role[0] : user.role || "user",
        activeContext: user.activeContext,
        lastSeen: user.lastSeen || user.lastActivity,
        lastActivity: user.lastActivity,
        isOnline: isCurrentlyOnline,
        timeSinceLastActivity: Math.floor(timeSinceLastActivity / 1000 / 60), // in minutes
      };
    });

    // Separate online and recently active users
    const onlineUsers = processedUsers.filter((user) => user.isOnline);
    const recentlyActiveUsers = processedUsers.filter(
      (user) => !user.isOnline && user.timeSinceLastActivity <= 15
    );

    return NextResponse.json({
      onlineUsers,
      recentlyActiveUsers,
      totalOnline: onlineUsers.length,
    });
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
