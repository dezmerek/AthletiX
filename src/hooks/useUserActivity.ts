"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

interface UseUserActivityOptions {
  enabled?: boolean;
  updateInterval?: number; // in milliseconds
  onlineThreshold?: number; // in milliseconds
  offlineAfter?: number; // in milliseconds - when to mark as offline
}

export function useUserActivity({
  enabled = true,
  updateInterval = 30000, // 30 seconds
  onlineThreshold = 120000, // 2 minutes
  offlineAfter = 300000, // 5 minutes
}: UseUserActivityOptions = {}) {
  const { data: session } = useSession();
  const lastActivityRef = useRef<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef<boolean>(true);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    lastActivityRef.current = new Date();
    isActiveRef.current = true;
  }, []);

  // Send activity update to server
  const sendActivityUpdate = useCallback(
    async (isOnline?: boolean) => {
      if (!session?.user?.id || !enabled) return;

      try {
        const response = await fetch("/api/user/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isOnline: isOnline ?? isActiveRef.current,
          }),
        });

        if (!response.ok) {
          console.error("Failed to update user activity");
        }
      } catch (error) {
        console.error("Error updating user activity:", error);
      }
    },
    [session?.user?.id, enabled]
  );

  // Mark user as online
  const setOnline = useCallback(() => {
    updateActivity();
    sendActivityUpdate(true);
  }, [updateActivity, sendActivityUpdate]);

  // Mark user as offline
  const setOffline = useCallback(() => {
    isActiveRef.current = false;
    sendActivityUpdate(false);
  }, [sendActivityUpdate]);

  // Activity event handlers
  const handleActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Setup activity tracking
  useEffect(() => {
    if (!enabled || !session?.user?.id) return;

    // Activity events to track
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set up periodic activity updates
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const timeSinceLastActivity =
        now.getTime() - lastActivityRef.current.getTime();

      // Determine current status
      let shouldBeOnline = true;

      if (timeSinceLastActivity > onlineThreshold) {
        // User has been inactive - mark as offline
        shouldBeOnline = false;
        isActiveRef.current = false;
      }

      // Always send update with current status
      sendActivityUpdate(shouldBeOnline);
    }, updateInterval);

    // Mark user as online when component mounts
    setOnline();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Mark user as offline when component unmounts
      setOffline();
    };
  }, [
    enabled,
    session?.user?.id,
    updateInterval,
    onlineThreshold,
    handleActivity,
    sendActivityUpdate,
    setOnline,
    setOffline,
  ]);

  // Handle page visibility change
  useEffect(() => {
    if (!enabled || !session?.user?.id) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, session?.user?.id, setOnline, setOffline]);

  // Handle beforeunload (page close/refresh)
  useEffect(() => {
    if (!enabled || !session?.user?.id) return;

    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status update
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/user/activity",
          JSON.stringify({ isOnline: false })
        );
      } else {
        setOffline();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, session?.user?.id, setOffline]);

  return {
    setOnline,
    setOffline,
    updateActivity,
    isActive: isActiveRef.current,
    lastActivity: lastActivityRef.current,
  };
}
