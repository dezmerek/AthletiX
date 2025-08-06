import { triggerNotificationRefresh } from "@/contexts/NotificationContext";

// Call this function after any action that might create a notification
export function triggerNotificationCheck() {
  // Small delay to ensure the notification was created in the database
  setTimeout(() => {
    triggerNotificationRefresh();
  }, 1000);
}

// For real-time updates when we know exact notification data
export function addRealtimeNotification(notification: {
  type: "like" | "comment" | "comment_like";
  senderName: string;
  postContent?: string;
  commentContent?: string;
}) {
  const notificationData = {
    _id: `temp-${Date.now()}`, // Temporary ID
    type: notification.type,
    title: getNotificationTitle(notification.type),
    message: getNotificationMessage(notification.type, notification.senderName),
    isRead: false,
    senderName: notification.senderName,
    metadata: {
      postContent: notification.postContent,
      commentContent: notification.commentContent,
    },
    createdAt: new Date().toISOString(),
  };

  // This will be replaced by real data when polling occurs
  window.dispatchEvent(
    new CustomEvent("new-notification", { detail: notificationData })
  );
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case "like":
      return "Nowe polubienie";
    case "comment":
      return "Nowy komentarz";
    case "comment_like":
      return "Polubienie komentarza";
    default:
      return "Powiadomienie";
  }
}

function getNotificationMessage(type: string, senderName: string): string {
  switch (type) {
    case "like":
      return `${senderName} polubił Twój post`;
    case "comment":
      return `${senderName} skomentował Twój post`;
    case "comment_like":
      return `${senderName} polubił Twój komentarz`;
    default:
      return `${senderName} wykonał akcję`;
  }
}
