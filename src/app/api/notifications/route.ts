import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const unreadOnly = url.searchParams.get("unreadOnly") === "true";

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user.id);

    // Build query
    const query: { recipient: ObjectId; isRead?: boolean } = {
      recipient: userId,
    };
    if (unreadOnly) {
      query.isRead = false;
    }

    // Get notifications with sender info
    const notifications = await db
      .collection("notifications")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "senderInfo",
          },
        },
        {
          $addFields: {
            senderName: { $arrayElemAt: ["$senderInfo.name", 0] },
            senderImage: { $arrayElemAt: ["$senderInfo.image", 0] },
          },
        },
        { $project: { senderInfo: 0 } },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ])
      .toArray();

    // Get total count
    const totalCount = await db
      .collection("notifications")
      .countDocuments(query);

    // Get unread count
    const unreadCount = await db
      .collection("notifications")
      .countDocuments({ recipient: userId, isRead: false });

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        hasMore: page * limit < totalCount,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notificationIds, markAll } = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user.id);

    let result;

    if (markAll) {
      // Mark all notifications as read
      result = await db
        .collection("notifications")
        .updateMany(
          { recipient: userId, isRead: false },
          { $set: { isRead: true, updatedAt: new Date() } }
        );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const objectIds = notificationIds.map((id: string) => new ObjectId(id));
      result = await db.collection("notifications").updateMany(
        {
          _id: { $in: objectIds },
          recipient: userId,
        },
        { $set: { isRead: true, updatedAt: new Date() } }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
