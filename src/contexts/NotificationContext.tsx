import React, { createContext, useContext, useEffect } from "react";
import { useNotifications, type Notification } from "@/hooks/useNotifications";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    refresh,
  } = useNotifications({
    enabled: true,
    pollInterval: 5000,
    limit: 20,
  });

  // Listen for custom notification events
  useEffect(() => {
    const handleNewNotification = (event: CustomEvent<Notification>) => {
      addNotification(event.detail);
    };

    const handleRefreshNotifications = () => {
      refresh();
    };

    window.addEventListener(
      "new-notification",
      handleNewNotification as EventListener
    );
    window.addEventListener(
      "refresh-notifications",
      handleRefreshNotifications
    );

    return () => {
      window.removeEventListener(
        "new-notification",
        handleNewNotification as EventListener
      );
      window.removeEventListener(
        "refresh-notifications",
        handleRefreshNotifications
      );
    };
  }, [addNotification, refresh]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider"
    );
  }
  return context;
}

// Utility functions to trigger notifications from anywhere in the app
export function triggerNotification(notification: Notification) {
  const event = new CustomEvent("new-notification", { detail: notification });
  window.dispatchEvent(event);
}

export function triggerNotificationRefresh() {
  const event = new CustomEvent("refresh-notifications");
  window.dispatchEvent(event);
}
