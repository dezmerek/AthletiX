"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface CalendarEvent {
  id: string;
  title: string;
  type: "workout" | "meal" | "appointment" | "other";
  date: string;
  time: string;
  duration: number; // minutes
  description?: string;
  color: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateCalendarEventData {
  title: string;
  type: "workout" | "meal" | "appointment" | "other";
  date: string;
  time: string;
  duration?: number;
  description?: string;
  color?: string;
}

export interface UpdateCalendarEventData extends CreateCalendarEventData {
  completed?: boolean;
}

interface UseCalendarEventsReturn {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  createEvent: (
    eventData: CreateCalendarEventData
  ) => Promise<CalendarEvent | null>;
  updateEvent: (
    id: string,
    eventData: UpdateCalendarEventData
  ) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  toggleEventComplete: (id: string) => Promise<boolean>;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsInRange: (startDate: Date, endDate: Date) => CalendarEvent[];
  refreshEvents: (dateRange?: {
    startDate?: string;
    endDate?: string;
    date?: string;
  }) => Promise<void>;
}

interface UseCalendarEventsOptions {
  initialDate?: Date;
  autoLoad?: boolean;
}

export function useCalendarEvents({
  initialDate,
  autoLoad = true,
}: UseCalendarEventsOptions = {}): UseCalendarEventsReturn {
  const { data: session } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEvents = useCallback(
    async (dateRange?: {
      startDate?: string;
      endDate?: string;
      date?: string;
    }) => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();

        if (dateRange?.date) {
          params.append("date", dateRange.date);
        } else if (dateRange?.startDate && dateRange?.endDate) {
          params.append("startDate", dateRange.startDate);
          params.append("endDate", dateRange.endDate);
        } else if (initialDate) {
          // Default to current month if no range specified
          const start = new Date(
            initialDate.getFullYear(),
            initialDate.getMonth(),
            1
          );
          const end = new Date(
            initialDate.getFullYear(),
            initialDate.getMonth() + 1,
            0
          );
          params.append("startDate", start.toISOString().split("T")[0]);
          params.append("endDate", end.toISOString().split("T")[0]);
        }

        const response = await fetch(
          `/api/calendar/events?${params.toString()}`,
          {
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id, initialDate]
  );

  const createEvent = useCallback(
    async (
      eventData: CreateCalendarEventData
    ): Promise<CalendarEvent | null> => {
      if (!session?.user?.id) {
        setError("User not authenticated");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/calendar/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create event");
        }

        const data = await response.json();
        const newEvent = data.event;

        // Add to local state
        setEvents((prev) =>
          [...prev, newEvent].sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          })
        );

        return newEvent;
      } catch (err) {
        console.error("Error creating calendar event:", err);
        setError(err instanceof Error ? err.message : "Failed to create event");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  const updateEvent = useCallback(
    async (
      id: string,
      eventData: UpdateCalendarEventData
    ): Promise<CalendarEvent | null> => {
      if (!session?.user?.id) {
        setError("User not authenticated");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/calendar/events/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update event");
        }

        const data = await response.json();
        const updatedEvent = data.event;

        // Update local state
        setEvents((prev) =>
          prev
            .map((event) => (event.id === id ? updatedEvent : event))
            .sort((a, b) => {
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              return a.time.localeCompare(b.time);
            })
        );

        return updatedEvent;
      } catch (err) {
        console.error("Error updating calendar event:", err);
        setError(err instanceof Error ? err.message : "Failed to update event");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      if (!session?.user?.id) {
        setError("User not authenticated");
        return false;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/calendar/events/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete event");
        }

        // Remove from local state
        setEvents((prev) => prev.filter((event) => event.id !== id));

        return true;
      } catch (err) {
        console.error("Error deleting calendar event:", err);
        setError(err instanceof Error ? err.message : "Failed to delete event");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session?.user?.id]
  );

  const toggleEventComplete = useCallback(
    async (id: string): Promise<boolean> => {
      if (!session?.user?.id) {
        setError("User not authenticated");
        return false;
      }

      try {
        const response = await fetch(`/api/calendar/events/${id}`, {
          method: "PATCH",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to toggle event status");
        }

        const data = await response.json();
        const { completed } = data.event;

        // Update local state
        setEvents((prev) =>
          prev.map((event) =>
            event.id === id ? { ...event, completed } : event
          )
        );

        return true;
      } catch (err) {
        console.error("Error toggling event status:", err);
        setError(
          err instanceof Error ? err.message : "Failed to toggle event status"
        );
        return false;
      }
    },
    [session?.user?.id]
  );

  const getEventsForDate = useCallback(
    (date: Date): CalendarEvent[] => {
      const dateString = date.toISOString().split("T")[0];
      return events.filter((event) => event.date === dateString);
    },
    [events]
  );

  const getEventsInRange = useCallback(
    (startDate: Date, endDate: Date): CalendarEvent[] => {
      const startString = startDate.toISOString().split("T")[0];
      const endString = endDate.toISOString().split("T")[0];

      return events.filter((event) => {
        return event.date >= startString && event.date <= endString;
      });
    },
    [events]
  );

  // Auto-load events on mount
  useEffect(() => {
    if (autoLoad && session?.user?.id) {
      refreshEvents();
    }
  }, [autoLoad, session?.user?.id, refreshEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    getEventsForDate,
    getEventsInRange,
    refreshEvents,
  };
}
