import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Create test notifications for development
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const userId = new ObjectId(session.user.id);

    // Create sample notifications
    const testNotifications = [
      {
        recipient: userId,
        sender: userId, // Self for testing
        type: "like",
        title: "Nowe polubienie",
        message: `Testowy użytkownik polubił Twój post`,
        postId: new ObjectId(),
        metadata: {
          postContent: "To jest przykładowy post o treningu...",
        },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        recipient: userId,
        sender: userId,
        type: "comment",
        title: "Nowy komentarz",
        message: `Testowy użytkownik skomentował Twój post`,
        postId: new ObjectId(),
        metadata: {
          postContent: "Post o odżywianiu...",
          commentContent: "Świetny post! Bardzo pomocny.",
        },
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
        updatedAt: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        recipient: userId,
        sender: userId,
        type: "comment_like",
        title: "Polubienie komentarza",
        message: `Testowy użytkownik polubił Twój komentarz`,
        postId: new ObjectId(),
        commentId: new ObjectId().toString(),
        metadata: {
          commentContent: "Bardzo ciekawy punkt widzenia!",
        },
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];

    // Insert test notifications
    await db.collection("notifications").insertMany(testNotifications);

    return NextResponse.json({
      success: true,
      message: "Test notifications created",
      count: testNotifications.length,
    });
  } catch (error) {
    console.error("Error creating test notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
