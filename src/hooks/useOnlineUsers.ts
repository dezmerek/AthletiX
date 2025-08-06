"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface OnlineUser {
  id: string;
  name: string;
  role: string | string[]; // Allow any role configuration
  activeContext?: string;
  lastSeen: Date;
  lastActivity: Date;
  isOnline: boolean;
  timeSinceLastActivity?: number;
  isPremiumPersonal?: boolean;
  isPremiumProfessional?: boolean;
}

interface UseOnlineUsersReturn {
  onlineUsers: OnlineUser[];
  recentlyActiveUsers: OnlineUser[];
  totalOnline: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseOnlineUsersOptions {
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useOnlineUsers({
  enabled = true,
  refreshInterval = 60000, // 1 minute
}: UseOnlineUsersOptions = {}): UseOnlineUsersReturn {
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [recentlyActiveUsers, setRecentlyActiveUsers] = useState<OnlineUser[]>(
    []
  );
  const [totalOnline, setTotalOnline] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOnlineUsers = useCallback(async () => {
    if (!session?.user?.id || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/user/activity", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch online users");
      }

      const data = await response.json();

      // Convert date strings back to Date objects
      const processUsers = (
        users: Array<{
          id: string;
          name: string;
          role: string;
          activeContext?: string;
          lastSeen: string | Date;
          lastActivity: string | Date;
          isOnline: boolean;
          timeSinceLastActivity?: number;
        }>
      ) =>
        users.map((user) => {
          const lastActivity = new Date(user.lastActivity);
          const now = new Date();
          const timeSinceActivity = Math.floor(
            (now.getTime() - lastActivity.getTime()) / 1000 / 60
          );

          // Override online status based on client-side timing
          const isActuallyOnline = user.isOnline && timeSinceActivity <= 5;

          return {
            ...user,
            lastSeen: new Date(user.lastSeen),
            lastActivity,
            isOnline: isActuallyOnline,
            timeSinceLastActivity: timeSinceActivity,
          };
        });

      const processedOnlineUsers = processUsers(data.onlineUsers || []);
      const processedRecentlyActive = processUsers(
        data.recentlyActiveUsers || []
      );

      // Further filter to separate truly online vs recently active
      const actuallyOnline = processedOnlineUsers.filter(
        (user) => user.isOnline
      );
      const actuallyRecentlyActive = [
        ...processedOnlineUsers.filter((user) => !user.isOnline),
        ...processedRecentlyActive,
      ].filter(
        (user) => !user.isOnline && (user.timeSinceLastActivity || 0) <= 60
      );

      setOnlineUsers(actuallyOnline);
      setRecentlyActiveUsers(actuallyRecentlyActive);
      setTotalOnline(actuallyOnline.length);
    } catch (err) {
      console.error("Error fetching online users:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled && session?.user?.id) {
      fetchOnlineUsers();
    }
  }, [enabled, session?.user?.id, fetchOnlineUsers]);

  // Set up periodic refresh
  useEffect(() => {
    if (!enabled || !session?.user?.id || refreshInterval <= 0) return;

    const interval = setInterval(fetchOnlineUsers, refreshInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, session?.user?.id, refreshInterval, fetchOnlineUsers]);

  return {
    onlineUsers,
    recentlyActiveUsers,
    totalOnline,
    isLoading,
    error,
    refetch: fetchOnlineUsers,
  };
}
