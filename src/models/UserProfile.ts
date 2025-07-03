import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export interface IUserProfile extends mongoose.Document {
  userId: ObjectId;
  age?: number;
  weight?: number;
  targetWeight?: number;
  height?: number;
  gender?: "male" | "female";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  calorieGoal?: {
    type: "lose_weight" | "gain_weight" | "maintain_weight";
    weeklyGoal: number; // kg per week (0.25, 0.5, 0.75, 1.0, or custom value)
    customWeeklyGoal?: number; // custom kg per week value
    customCalories?: number; // optional custom calorie target
  };
  macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new mongoose.Schema<IUserProfile>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      min: 13,
      max: 120,
    },
    weight: {
      type: Number,
      min: 30,
      max: 300,
    },
    targetWeight: {
      type: Number,
      min: 30,
      max: 300,
    },
    height: {
      type: Number,
      min: 100,
      max: 250,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },
    calorieGoal: {
      type: {
        type: String,
        enum: ["lose_weight", "gain_weight", "maintain_weight"],
        default: "maintain_weight",
      },
      weeklyGoal: {
        type: Number,
        default: 0.5,
      },
      customWeeklyGoal: Number,
      customCalories: Number,
    },
    macros: {
      protein: {
        type: Number,
        min: 10,
        max: 50,
        default: 30,
      },
      carbs: {
        type: Number,
        min: 10,
        max: 70,
        default: 40,
      },
      fats: {
        type: Number,
        min: 10,
        max: 50,
        default: 30,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better performance
userProfileSchema.index({ userId: 1 });

const UserProfile =
  mongoose.models.UserProfile ||
  mongoose.model<IUserProfile>("UserProfile", userProfileSchema);

export default UserProfile;
