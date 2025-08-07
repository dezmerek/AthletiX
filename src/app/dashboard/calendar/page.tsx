"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  useCalendarEvents,
  CalendarEvent as CalendarEventType,
  CreateCalendarEventData,
} from "@/hooks/useCalendarEvents";

type ViewType = "month" | "week" | "day";

export default function CalendarPage() {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventType | null>(
    null
  );

  // Use the calendar events hook
  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
    getEventsForDate,
    refreshEvents,
  } = useCalendarEvents({
    initialDate: currentDate,
    autoLoad: true,
  });

  const [newEvent, setNewEvent] = useState<Partial<CreateCalendarEventData>>({
    title: "",
    type: "workout",
    date: "",
    time: "",
    duration: 60,
    description: "",
    color: "#10B981",
  });

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    date?: string;
    time?: string;
  }>({});

  // Get calendar display data
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Adjust for Monday as first day of week
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStartingDay =
      startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    // Adjust to make Monday the first day of the week (like in month view)
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so subtract 6 to get to Monday
    startOfWeek.setDate(date.getDate() - daysToSubtract);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }

    return week;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "workout":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21l3-3 3 3 3-3 3 3M4 12h16m-8-8v8"
            />
          </svg>
        );
      case "meal":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
            />
          </svg>
        );
      case "appointment":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const validateForm = () => {
    const errors: { title?: string; date?: string; time?: string } = {};

    if (!newEvent.title?.trim()) {
      errors.title = t("form.titleRequired");
    }

    if (!newEvent.date) {
      errors.date = t("form.dateRequired");
    }

    if (!newEvent.time) {
      errors.time = t("form.timeRequired");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddEvent = async () => {
    if (!validateForm()) {
      return;
    }

    const eventData: CreateCalendarEventData = {
      title: newEvent.title!,
      type: newEvent.type as CreateCalendarEventData["type"],
      date: newEvent.date!,
      time: newEvent.time!,
      duration: newEvent.duration || 60,
      description: newEvent.description,
      color: newEvent.color || "#10B981",
    };

    const createdEvent = await createEvent(eventData);

    if (createdEvent) {
      setNewEvent({
        title: "",
        type: "workout",
        date: "",
        time: "",
        duration: 60,
        description: "",
        color: "#10B981",
      });
      setFormErrors({});
      setShowEventModal(false);
    }
  };

  const handleEditEvent = (event: CalendarEventType) => {
    setEditingEvent(event);
    setNewEvent(event);
    setShowEventModal(true);
  };

  const handleUpdateEvent = async () => {
    if (!validateForm() || !editingEvent) {
      return;
    }

    const eventData: CreateCalendarEventData = {
      title: newEvent.title!,
      type: newEvent.type as CreateCalendarEventData["type"],
      date: newEvent.date!,
      time: newEvent.time!,
      duration: newEvent.duration || 60,
      description: newEvent.description,
      color: newEvent.color || "#10B981",
    };

    const updatedEvent = await updateEvent(editingEvent.id, eventData);

    if (updatedEvent) {
      setEditingEvent(null);
      setNewEvent({
        title: "",
        type: "workout",
        date: "",
        time: "",
        duration: 60,
        description: "",
        color: "#10B981",
      });
      setFormErrors({});
      setShowEventModal(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEvent(eventId);
  };

  const handleToggleEventComplete = async (eventId: string) => {
    await toggleEventComplete(eventId);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const navigate = (direction: number) => {
    switch (viewType) {
      case "month":
        navigateMonth(direction);
        break;
      case "week":
        navigateWeek(direction);
        break;
      case "day":
        navigateDay(direction);
        break;
    }
  };
  const getViewTitle = () => {
    switch (viewType) {
      case "month":
        return currentDate.toLocaleDateString(locale, {
          month: "long",
          year: "numeric",
        });
      case "week":
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        })} - ${weekEnd.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "day":
        return currentDate.toLocaleDateString(locale, {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
    }
  };
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const dayNames = [
      t("dayNames.monday"),
      t("dayNames.tuesday"),
      t("dayNames.wednesday"),
      t("dayNames.thursday"),
      t("dayNames.friday"),
      t("dayNames.saturday"),
      t("dayNames.sunday"),
    ];

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={index}
                  className="h-36 border-r border-b border-slate-200 dark:border-slate-700"
                ></div>
              );
            }

            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected =
              day.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`h-36 border-r border-b border-slate-200 dark:border-slate-700 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? "w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: event.color + "20",
                        color: event.color,
                      }}
                    >
                      {event.title}
                    </div>
                  ))}{" "}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      +{dayEvents.length - 3} {t("events.moreEvents")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Day headers */}{" "}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
          <div className="p-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50">
            {t("time.time")}
          </div>
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={day.toISOString()}
                className={`p-4 text-center text-sm font-medium bg-slate-50 dark:bg-slate-700/50 ${
                  isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <div>
                  {day.toLocaleDateString(locale, { weekday: "short" })}
                </div>
                <div
                  className={`text-lg font-bold ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        {/* Time slots */}
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-700/50"
            >
              <div className="p-2 text-xs text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDays.map((day) => {
                const dayEvents = getEventsForDate(day).filter((event) => {
                  const eventHour = parseInt(event.time.split(":")[0]);
                  return eventHour === hour;
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="p-1 border-r border-slate-200 dark:border-slate-700 min-h-[60px]"
                  >
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => handleEditEvent(event)}
                        className="text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 flex items-center space-x-1"
                        style={{
                          backgroundColor: event.color + "20",
                          color: event.color,
                        }}
                      >
                        {getEventTypeIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        +{dayEvents.length - 2} {t("events.moreEvents")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline view */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              {" "}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {currentDate.toLocaleDateString(locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {hours.map((hour) => {
                const hourEvents = dayEvents.filter((event) => {
                  const eventHour = parseInt(event.time.split(":")[0]);
                  return eventHour === hour;
                });

                return (
                  <div
                    key={hour}
                    className="flex border-b border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="w-20 p-4 text-sm text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    <div className="flex-1 p-2 min-h-[60px]">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEditEvent(event)}
                          className="p-3 rounded-lg mb-2 cursor-pointer hover:opacity-80 border-l-4"
                          style={{
                            backgroundColor: event.color + "10",
                            borderLeftColor: event.color,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div style={{ color: event.color }}>
                                {getEventTypeIcon(event.type)}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {event.title}
                              </span>
                              {event.completed && (
                                <svg
                                  className="w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {formatTime(event.time)}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("events.todaysEvents")} ({dayEvents.length})
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {dayEvents.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                {t("events.noEvents")}
              </p>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div style={{ color: event.color }}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {event.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleEventComplete(event.id)}
                        className={`p-1 rounded ${
                          event.completed
                            ? "text-green-500 hover:text-green-600"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1 text-slate-400 hover:text-blue-500"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-slate-400 hover:text-red-500"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {formatTime(event.time)} • {event.duration} min
                  </div>
                  {event.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {event.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("description")}
          </p>
          {error && (
            <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* View controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="text-lg font-semibold text-slate-900 dark:text-white min-w-[200px] text-center">
                {getViewTitle()}
              </div>

              <button
                onClick={() => navigate(1)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t("actions.today")}
            </button>
          </div>

          {/* View type selector and add button */}
          <div className="flex items-center space-x-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-1 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex space-x-1">
                {(["month", "week", "day"] as ViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setViewType(view)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewType === view
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {t(`views.${view}`)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setNewEvent({
                  title: "",
                  type: "workout",
                  date: selectedDate.toISOString().split("T")[0],
                  time: "",
                  duration: 60,
                  description: "",
                  color: "#10B981",
                });
                setShowEventModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{t("actions.addEvent")}</span>
            </button>
          </div>
        </div>

        {/* Calendar view */}
        <div className="mb-6">
          {viewType === "month" && renderMonthView()}
          {viewType === "week" && renderWeekView()}
          {viewType === "day" && renderDayView()}
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {editingEvent
                    ? t("actions.editEvent")
                    : t("actions.addEvent")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("form.title")}
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => {
                        setNewEvent({ ...newEvent, title: e.target.value });
                        if (formErrors.title) {
                          setFormErrors({ ...formErrors, title: undefined });
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.title
                          ? "border-red-300 dark:border-red-600"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                      placeholder={t("form.titlePlaceholder")}
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("form.type")}
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          type: e.target
                            .value as CreateCalendarEventData["type"],
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="workout">{t("eventTypes.workout")}</option>
                      <option value="meal">{t("eventTypes.meal")}</option>
                      <option value="appointment">
                        {t("eventTypes.appointment")}
                      </option>
                      <option value="other">{t("eventTypes.other")}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("form.date")}
                      </label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, date: e.target.value });
                          if (formErrors.date) {
                            setFormErrors({ ...formErrors, date: undefined });
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.date
                            ? "border-red-300 dark:border-red-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      />
                      {formErrors.date && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {formErrors.date}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        {t("form.time")}
                      </label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => {
                          setNewEvent({ ...newEvent, time: e.target.value });
                          if (formErrors.time) {
                            setFormErrors({ ...formErrors, time: undefined });
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.time
                            ? "border-red-300 dark:border-red-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      />
                      {formErrors.time && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {formErrors.time}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("form.duration")} ({t("form.minutes")})
                    </label>
                    <input
                      type="number"
                      value={newEvent.duration}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          duration: parseInt(e.target.value) || 60,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("form.description")}
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder={t("form.descriptionPlaceholder")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t("form.color")}
                    </label>
                    <div className="flex space-x-2">
                      {[
                        "#10B981",
                        "#3B82F6",
                        "#F59E0B",
                        "#EF4444",
                        "#8B5CF6",
                        "#06B6D4",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewEvent({ ...newEvent, color })}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newEvent.color === color
                              ? "border-slate-400"
                              : "border-slate-200"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      setNewEvent({
                        title: "",
                        type: "workout",
                        date: "",
                        time: "",
                        duration: 60,
                        description: "",
                        color: "#10B981",
                      });
                      setFormErrors({});
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t("actions.cancel")}
                  </button>
                  <button
                    onClick={editingEvent ? handleUpdateEvent : handleAddEvent}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "..."
                      : editingEvent
                      ? t("actions.update")
                      : t("actions.add")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
