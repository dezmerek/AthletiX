import { NextRequest } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Message from "@/models/Message";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectMongoose();

    const currentUserId = session.user.id;

    // Set headers for Server-Sent Events
    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    };

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: "connected",
          message: "Connected to messaging stream",
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));

        // Set up interval to check for new messages
        const interval = setInterval(async () => {
          try {
            // Check for new messages for the current user
            const newMessages = await Message.find({
              receiverId: currentUserId,
              isRead: false,
            })
              .sort({ timestamp: -1 })
              .limit(10);

            if (newMessages.length > 0) {
              // Get sender names for messages
              const messagesWithNames = await Promise.all(
                newMessages.map(async (msg) => {
                  const sender = await User.findById(
                    new mongoose.Types.ObjectId(msg.senderId)
                  ).select("name");
                  return {
                    ...msg.toObject(),
                    senderName: sender?.name || msg.senderId.toString(),
                  };
                })
              );

              const data = `data: ${JSON.stringify({
                type: "new_messages",
                messages: messagesWithNames,
                count: messagesWithNames.length,
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }

            // Check for conversation updates (new messages in existing conversations)
            const recentMessages = await Message.find({
              $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
            })
              .sort({ timestamp: -1 })
              .limit(5);

            if (recentMessages.length > 0) {
              const data = `data: ${JSON.stringify({
                type: "conversation_updates",
                messages: recentMessages,
              })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          } catch (error) {
            console.error("Error in messaging stream:", error);
            const errorData = `data: ${JSON.stringify({
              type: "error",
              message: "Error checking for new messages",
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(errorData));
          }
        }, 2000); // Check every 2 seconds

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error("Error in messaging stream:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
