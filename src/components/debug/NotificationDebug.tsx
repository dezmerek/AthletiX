import { useNotificationContext } from "@/contexts/NotificationContext";

export default function NotificationDebug() {
  const { notifications, unreadCount, refresh } = useNotificationContext();

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-semibold text-sm mb-2">Notification Debug</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
        Unread: {unreadCount} | Total: {notifications.length}
      </p>
      <button
        onClick={refresh}
        className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
      >
        Refresh Now
      </button>
      <div className="mt-2 max-h-32 overflow-y-auto">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification._id}
            className="text-xs p-1 border-b last:border-b-0"
          >
            <div className="font-medium">{notification.title}</div>
            <div className="text-gray-500">{notification.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
