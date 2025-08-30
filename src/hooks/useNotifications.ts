import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface Notification {
  _id: string;
  type:
    | "like"
    | "comment"
    | "comment_like"
    | "follow"
    | "post_mention"
    | "message";
  title: string;
  message: string;
  isRead: boolean;
  postId?: string;
  commentId?: string;
  senderName: string;
  senderImage?: string;
  metadata?: {
    postContent?: string;
    commentContent?: string;
    conversationId?: string;
    senderId?: string;
  };
  createdAt: string;
}

interface UseNotificationsOptions {
  enabled?: boolean;
  pollInterval?: number;
  limit?: number;
}

interface NotificationsPagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { enabled = true, pollInterval = 5000, limit = 20 } = options; // Zmniejszenie interwału do 5 sekund
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState<NotificationsPagination>({
    page: 1,
    limit,
    total: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!session?.user?.id || !enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await fetch(`/api/notifications?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();

        setNotifications((prev) =>
          append ? [...prev, ...data.notifications] : data.notifications
        );
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id, enabled, limit]
  );

  // Load more notifications
  const loadMore = useCallback(() => {
    if (pagination.hasMore && !isLoading) {
      fetchNotifications(pagination.page + 1, true);
    }
  }, [pagination.hasMore, pagination.page, isLoading, fetchNotifications]);

  // Mark notifications as read
  const markAsRead = useCallback(
    async (notificationIds?: string[]) => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notificationIds,
            markAll: !notificationIds,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark notifications as read");
        }

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => {
            if (
              !notificationIds ||
              notificationIds.includes(notification._id)
            ) {
              return { ...notification, isRead: true };
            }
            return notification;
          })
        );

        if (!notificationIds) {
          setUnreadCount(0);
        } else {
          setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
        }
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        setError(
          error instanceof Error ? error.message : "Failed to mark as read"
        );
      }
    },
    [session?.user?.id]
  );

  // Mark single notification as read
  const markSingleAsRead = useCallback(
    (notificationId: string) => {
      markAsRead([notificationId]);
    },
    [markAsRead]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    markAsRead();
  }, [markAsRead]);

  // Refresh notifications
  const refresh = useCallback(() => {
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Get unread notifications only
  const fetchUnreadOnly = useCallback(async () => {
    if (!session?.user?.id || !enabled) return;

    try {
      const params = new URLSearchParams({
        unreadOnly: "true",
        limit: "50",
      });

      const response = await fetch(`/api/notifications?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch unread notifications");
      }

      const data = await response.json();
      return data.notifications;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      return [];
    }
  }, [session?.user?.id, enabled]);

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id && enabled) {
      fetchNotifications();
    }
  }, [session?.user?.id, enabled, fetchNotifications]);

  // Polling for new notifications
  useEffect(() => {
    if (!session?.user?.id || !enabled || !pollInterval) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/notifications?page=1&limit=5");
        if (!response.ok) return;

        const data = await response.json();

        // Update unread count
        if (data.unreadCount !== unreadCount) {
          setUnreadCount(data.unreadCount);
        }

        // Check for new notifications (compare timestamps)
        const latestNotificationTime = notifications[0]?.createdAt;
        const newNotifications = data.notifications.filter(
          (notification: Notification) => {
            return (
              !latestNotificationTime ||
              new Date(notification.createdAt) >
                new Date(latestNotificationTime)
            );
          }
        );

        // Add new notifications to the beginning of the list
        if (newNotifications.length > 0) {
          setNotifications((prev) => {
            // Remove duplicates and add new ones at the beginning
            const existingIds = new Set(prev.map((n) => n._id));
            const uniqueNewNotifications = newNotifications.filter(
              (notification: Notification) => !existingIds.has(notification._id)
            );

            if (uniqueNewNotifications.length > 0) {
              // Show browser notification if page is not visible
              if (
                document.hidden &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                const latestNotification = uniqueNewNotifications[0];
                new Notification(latestNotification.title, {
                  body: latestNotification.message,
                  icon: "/favicon.ico",
                  tag: "athletix-notification",
                });
              }

              return [...uniqueNewNotifications, ...prev];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [session?.user?.id, enabled, pollInterval, unreadCount, notifications]);

  // Add new notification manually (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show browser notification if page is not visible
    if (
      document.hidden &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: "athletix-notification",
      });
    }
  }, []);

  // Remove notification by ID pattern (for message notifications)
  const removeNotification = useCallback((notificationIdPattern: string) => {
    setNotifications((prev) =>
      prev.filter((n) => !n._id.startsWith(notificationIdPattern))
    );
  }, []);

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    error,
    fetchNotifications,
    loadMore,
    markAsRead: markSingleAsRead,
    markAllAsRead,
    refresh,
    fetchUnreadOnly,
    addNotification,
    removeNotification,
  };
}
