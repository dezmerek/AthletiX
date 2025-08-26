import { Schema, model, models, Document } from "mongoose";

export type WorkoutType = "strength" | "cardio" | "flexibility" | "mixed";

export interface ITemplateExercise {
  name: string;
  nameEn?: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  notesEn?: string;
}

export interface IWorkoutTemplate extends Document {
  ownerId?: string; // optional personal templates; if absent -> global
  name: string;
  nameEn?: string;
  type: WorkoutType;
  estimatedDuration: number;
  exercises: ITemplateExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateExerciseSchema = new Schema<ITemplateExercise>(
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
  { _id: false }
);

const WorkoutTemplateSchema = new Schema<IWorkoutTemplate>(
  {
    ownerId: { type: String, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    nameEn: { type: String, trim: true, maxlength: 200 },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "mixed"],
      required: true,
    },
    estimatedDuration: { type: Number, required: true, min: 0, max: 1440 },
    exercises: { type: [TemplateExerciseSchema], default: [] },
  },
  { timestamps: true }
);

WorkoutTemplateSchema.index({ ownerId: 1, name: 1 });

export const WorkoutTemplate =
  models.WorkoutTemplate ||
  model<IWorkoutTemplate>("WorkoutTemplate", WorkoutTemplateSchema);

export default WorkoutTemplate;
