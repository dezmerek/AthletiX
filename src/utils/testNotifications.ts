import { triggerNotificationRefresh } from "@/contexts/NotificationContext";

// Test function to simulate notification creation
export function simulateNotification() {
  // Call this after like/comment actions to immediately refresh notifications
  triggerNotificationRefresh();
}

// Also export the original function for easier access
export { triggerNotificationRefresh } from "@/contexts/NotificationContext";
