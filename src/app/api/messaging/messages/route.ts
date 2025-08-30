import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Message from "@/models/Message";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("otherUserId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "otherUserId parameter required" },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    // Get messages between current user and other user
    const messages = await Message.find({
      $or: [
        {
          senderId: currentUserId,
          receiverId: new mongoose.Types.ObjectId(otherUserId),
        },
        {
          senderId: new mongoose.Types.ObjectId(otherUserId),
          receiverId: currentUserId,
        },
      ],
    })
      .sort({ timestamp: 1 })
      .limit(100);

    // Mark messages as read if current user is receiver
    if (messages.length > 0) {
      await Message.updateMany(
        {
          senderId: new mongoose.Types.ObjectId(otherUserId),
          receiverId: currentUserId,
          isRead: false,
        },
        { isRead: true }
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const { receiverId, content } = await request.json();

    if (!receiverId || !content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Receiver ID and content required" },
        { status: 400 }
      );
    }

    const currentUserId = session.user.id;

    const message = new Message({
      senderId: currentUserId,
      receiverId: new mongoose.Types.ObjectId(receiverId),
      content: content.trim(),
      timestamp: new Date(),
      isRead: false,
    });

    await message.save();

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
