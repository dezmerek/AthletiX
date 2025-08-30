import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export interface User {
  _id: string;
  name?: string;
  email: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  userId: string;
  userName?: string;
  userEmail: string;
  lastMessage: Message;
  unreadCount: number;
}

export const useMessaging = () => {
  const { data: session } = useSession();
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      senderName?: string;
    }>
  >([]);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/messaging/search-users?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to search users");

      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/messaging/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch conversations"
      );
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMessages = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/messaging/messages?otherUserId=${encodeURIComponent(userId)}`
      );
      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (receiverId: string, content: string) => {
      if (!content.trim()) return false;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/messaging/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId, content: content.trim() }),
        });

        if (!response.ok) throw new Error("Failed to send message");

        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage.message]);

        // Refresh conversations to update last message
        await getConversations();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [getConversations]
  );

  const clearError = useCallback(() => setError(null), []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Initialize real-time connection
  useEffect(() => {
    if (!session?.user?.email) return;

    const connectToStream = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        eventSourceRef.current = new EventSource("/api/messaging/stream");

        eventSourceRef.current.onopen = () => {
          setIsConnected(true);
          console.log("Connected to messaging stream");
        };

        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case "connected":
                console.log("SSE connected:", data.message);
                break;

              case "new_messages":
                console.log("New messages received:", data.count);
                // Update conversations to show new message count
                getConversations();

                // Add notifications for new messages
                if (data.messages && data.messages.length > 0) {
                  data.messages.forEach((msg: any) => {
                    const notificationId = `msg-${msg._id}-${Date.now()}`;
                    setNotifications((prev) => [
                      ...prev,
                      {
                        id: notificationId,
                        message: msg.content,
                        senderName: msg.senderName || msg.senderId,
                      },
                    ]);

                    // Auto-remove notification after 10 seconds
                    setTimeout(() => {
                      setNotifications((prev) =>
                        prev.filter((n) => n.id !== notificationId)
                      );
                    }, 10000);
                  });
                }
                break;

              case "conversation_updates":
                console.log("Conversation updates received");
                // Refresh conversations and current messages if needed
                getConversations();
                if (messages.length > 0) {
                  // Refresh current conversation messages
                  const currentReceiver =
                    messages[0]?.receiverId === session.user?.id
                      ? messages[0]?.senderId
                      : messages[0]?.receiverId;
                  if (currentReceiver) {
                    getMessages(currentReceiver);
                  }
                }
                break;

              case "error":
                console.error("SSE error:", data.message);
                break;
            }
          } catch (err) {
            console.error("Error parsing SSE data:", err);
          }
        };

        eventSourceRef.current.onerror = (error) => {
          console.error("SSE connection error:", error);
          setIsConnected(false);

          // Attempt to reconnect after 5 seconds
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect to messaging stream...");
            connectToStream();
          }, 5000);
        };
      } catch (err) {
        console.error("Failed to connect to messaging stream:", err);
        setIsConnected(false);
      }
    };

    connectToStream();

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [session?.user?.email, getConversations, getMessages, messages.length]);

  return {
    searchResults,
    conversations,
    messages,
    loading,
    error,
    searchUsers,
    getConversations,
    getMessages,
    sendMessage,
    clearError,
    removeNotification,
    currentUser: session?.user
      ? {
          _id: session.user.id || "",
          name: session.user.name || undefined,
          email: session.user.email || "",
        }
      : null,
    isConnected,
    notifications,
  };
};
