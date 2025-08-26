import mongoose, { Schema, model, models, Document } from "mongoose";

export type WorkoutType = "strength" | "cardio" | "flexibility" | "mixed";
export type WorkoutStatus = "planned" | "in-progress" | "completed";

export interface IWorkoutExercise {
  name: string;
  nameEn?: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number; // minutes for cardio
  restTime?: number; // seconds
  notes?: string;
  notesEn?: string;
}

export interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  nameEn?: string;
  date: Date; // ISO date
  type: WorkoutType;
  duration: number; // minutes
  status: WorkoutStatus;
  exercises: (IWorkoutExercise & { _id: mongoose.Types.ObjectId })[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IWorkoutExercise>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    nameEn: { type: String, trim: true, maxlength: 200 },
    sets: { type: Number, required: true, min: 1, max: 20 },
    reps: { type: Number, required: true, min: 1, max: 200 },
    weight: { type: Number },
    duration: { type: Number },
    restTime: { type: Number },
    notes: { type: String, trim: true, maxlength: 500 },
    notesEn: { type: String, trim: true, maxlength: 500 },
  },
  { _id: true }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    nameEn: { type: String, trim: true, maxlength: 200 },
    date: { type: Date, required: true, index: true },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "mixed"],
      required: true,
    },
    duration: { type: Number, required: true, min: 0, max: 1440, default: 0 },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed"],
      required: true,
      default: "planned",
    },
    exercises: { type: [ExerciseSchema], default: [] },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

WorkoutSchema.index({ userId: 1, date: -1 });
WorkoutSchema.index({ userId: 1, status: 1, date: -1 });

export const Workout =
  models.Workout || model<IWorkout>("Workout", WorkoutSchema);

export default Workout;
