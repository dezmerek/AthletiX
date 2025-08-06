import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// Clean up stale online status
export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request (you might want to add authentication)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Mark users as offline if they haven't been active for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const result = await db.collection("users").updateMany(
      {
        $or: [
          { lastActivity: { $lt: tenMinutesAgo } },
          { lastActivity: { $exists: false } },
        ],
        isOnline: true,
      },
      {
        $set: {
          isOnline: false,
        },
      }
    );

    console.log(
      `Cleaned up ${result.modifiedCount} stale online status records`
    );

    return NextResponse.json({
      success: true,
      cleaned: result.modifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error cleaning up online status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
