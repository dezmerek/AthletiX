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

    // Track which messages have already been sent as notifications
    const sentNotificationIds = new Set<string>();

    // Track which senders have already been notified (to prevent multiple notifications per sender)
    const notifiedSenders = new Set<string>();

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
              // Filter out messages that have already been sent as notifications
              const unsentMessages = newMessages.filter(
                (msg) => !sentNotificationIds.has(msg._id.toString())
              );

              if (unsentMessages.length > 0) {
                // Group messages by sender and only send the latest one per sender
                const messagesBySender = new Map();

                unsentMessages.forEach((msg) => {
                  const senderId = msg.senderId.toString();
                  if (
                    !messagesBySender.has(senderId) ||
                    new Date(msg.timestamp) >
                      new Date(messagesBySender.get(senderId).timestamp)
                  ) {
                    messagesBySender.set(senderId, msg);
                  }
                });

                // Only send notifications for senders that haven't been notified yet
                const newSenders = Array.from(messagesBySender.keys()).filter(
                  (senderId) => !notifiedSenders.has(senderId)
                );

                if (newSenders.length > 0) {
                  // Get sender names for the latest messages only
                  const latestMessagesWithNames = await Promise.all(
                    newSenders.map((senderId) => {
                      const msg = messagesBySender.get(senderId);
                      return User.findById(
                        new mongoose.Types.ObjectId(senderId)
                      )
                        .select("name")
                        .then((sender) => ({
                          ...msg.toObject(),
                          senderName: sender?.name || senderId,
                        }));
                    })
                  );

                  // Mark these senders as notified
                  newSenders.forEach((senderId) => {
                    notifiedSenders.add(senderId);
                  });

                  // Mark ALL messages from these senders as sent
                  unsentMessages.forEach((msg) => {
                    sentNotificationIds.add(msg._id.toString());
                  });

                  const data = `data: ${JSON.stringify({
                    type: "new_messages",
                    messages: latestMessagesWithNames,
                    count: latestMessagesWithNames.length,
                  })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(data));
                }
              }
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

            // Clean up sent notification IDs for read messages
            const readMessages = await Message.find({
              receiverId: currentUserId,
              isRead: true,
            });

            if (readMessages.length > 0) {
              readMessages.forEach((msg) => {
                sentNotificationIds.delete(msg._id.toString());
                notifiedSenders.delete(msg.senderId.toString());
              });
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
