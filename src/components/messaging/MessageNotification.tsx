"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface MessageNotificationProps {
  message: string;
  senderName?: string;
  onClose: () => void;
}

export default function MessageNotification({
  message,
  senderName,
  onClose,
}: MessageNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Don't show notification if user is on messaging page
  if (window.location.pathname.includes("/messaging")) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium mb-1">
            {senderName ? `Nowa wiadomość od ${senderName}` : "Nowa wiadomość"}
          </div>
          <div className="text-sm text-blue-100 line-clamp-2">{message}</div>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-blue-200 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
