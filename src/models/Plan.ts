import mongoose, { Schema, Document } from "mongoose";

export interface IPlan extends Document {
  professionalId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: "training" | "nutrition" | "both";
  status: "active" | "inactive" | "draft";
  startDate: Date;
  endDate?: Date;
  goals: {
    weight?: number;
    targetWeight?: number;
    trainerTargetWeight?: string;
    strength?: string[];
    endurance?: string[];
    flexibility?: string[];
    nutrition?: string[];
  };
  trainingPlan?: {
    workouts: {
      day: number;
      name: string;
      exercises: {
        name: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
        rest: number;
        notes?: string;
      }[];
      notes?: string;
    }[];
  };
  nutritionPlan?: {
    dailyCalories: number;
    macronutrients: {
      protein: number;
      carbs: number;
      fats: number;
    };
    meals: {
      day: number;
      meals: {
        type: "breakfast" | "lunch" | "dinner" | "snack";
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        ingredients?: string[];
        notes?: string;
      }[];
    }[];
  };
  progress: {
    weight?: number;
    measurements?: {
      chest?: number;
      waist?: number;
      arms?: number;
      legs?: number;
    };
    notes?: string;
    date: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["training", "nutrition", "both"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "draft",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    goals: {
      weight: Number,
      targetWeight: Number,
      trainerTargetWeight: String,
      strength: [String],
      endurance: [String],
      flexibility: [String],
      nutrition: [String],
    },
    trainingPlan: {
      workouts: [
        {
          day: {
            type: Number,
            required: true,
            min: 1,
            max: 7,
          },
          name: {
            type: String,
            required: true,
          },
          exercises: [
            {
              name: {
                type: String,
                required: true,
              },
              sets: {
                type: Number,
                required: true,
                min: 1,
              },
              reps: {
                type: Number,
                required: true,
                min: 1,
              },
              weight: Number,
              duration: Number,
              rest: {
                type: Number,
                required: true,
                min: 0,
              },
              notes: String,
            },
          ],
          notes: String,
        },
      ],
    },
    nutritionPlan: {
      dailyCalories: {
        type: Number,
        required: true,
        min: 0,
      },
      macronutrients: {
        protein: {
          type: Number,
          required: true,
          min: 0,
        },
        carbs: {
          type: Number,
          required: true,
          min: 0,
        },
        fats: {
          type: Number,
          required: true,
          min: 0,
        },
      },
      meals: [
        {
          day: {
            type: Number,
            required: true,
            min: 1,
            max: 7,
          },
          meals: [
            {
              type: {
                type: String,
                enum: ["breakfast", "lunch", "dinner", "snack"],
                required: true,
              },
              name: {
                type: String,
                required: true,
              },
              calories: {
                type: Number,
                required: true,
                min: 0,
              },
              protein: {
                type: Number,
                required: true,
                min: 0,
              },
              carbs: {
                type: Number,
                required: true,
                min: 0,
              },
              fats: {
                type: Number,
                required: true,
                min: 0,
              },
              ingredients: [String],
              notes: String,
            },
          ],
        },
      ],
    },
    progress: [
      {
        weight: Number,
        measurements: {
          chest: Number,
          waist: Number,
          arms: Number,
          legs: Number,
        },
        notes: String,
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indeksy dla lepszej wydajności
PlanSchema.index({ professionalId: 1, clientId: 1 });
PlanSchema.index({ status: 1 });
PlanSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.Plan ||
  mongoose.model<IPlan>("Plan", PlanSchema);
