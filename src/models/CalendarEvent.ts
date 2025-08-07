import { Schema, model, models, Document } from "mongoose";

export interface ICalendarEvent extends Document {
  userId: string;
  title: string;
  type: "workout" | "meal" | "appointment" | "other";
  date: Date;
  time: string;
  duration: number; // minutes
  description?: string;
  color: string;
  completed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ["workout", "meal", "appointment", "other"],
      default: "other",
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440, // 24 hours in minutes
      default: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      required: true,
      match: /^#[0-9A-F]{6}$/i,
      default: "#10B981",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
CalendarEventSchema.index({ userId: 1, date: 1 });
CalendarEventSchema.index({ userId: 1, date: 1, time: 1 });

// Virtual to get formatted date string
CalendarEventSchema.virtual("dateString").get(function () {
  return this.date.toISOString().split("T")[0];
});

// Static method to get events for a date range
CalendarEventSchema.statics.getEventsInRange = function (
  userId: string,
  startDate: Date,
  endDate: Date
) {
  return this.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1, time: 1 });
};

// Static method to get events for a specific date
CalendarEventSchema.statics.getEventsForDate = function (
  userId: string,
  date: Date
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.find({
    userId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).sort({ time: 1 });
};

export const CalendarEvent =
  models.CalendarEvent ||
  model<ICalendarEvent>("CalendarEvent", CalendarEventSchema);
