import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  role?:
    | ("user" | "professional" | "admin")[]
    | "user"
    | "professional"
    | "admin"
    | null;
  isPremiumPersonal?: boolean; // Premium dla trybu osobistego
  isPremiumProfessional?: boolean; // Premium dla trybu profesjonalnego
  specialization?: string;

  // Simple context switching
  activeContext?: "user" | "professional" | null;

  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Nie wymagane dla kont Google
      minlength: [8, "Password must be at least 8 characters long"],
    },
    name: String,
    image: String,
    emailVerified: Date,
    role: {
      type: [String],
      enum: ["user", "professional", "admin"],
      default: ["user"],
    },
    isPremiumPersonal: {
      type: Boolean,
      default: false,
    },
    isPremiumProfessional: {
      type: Boolean,
      default: false,
    },
    specialization: String,

    // Simple context switching
    activeContext: {
      type: String,
      enum: ["user", "professional"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Simple context switching method
userSchema.methods.switchContext = function (
  context: "user" | "professional"
): boolean {
  this.activeContext = context;
  return true;
};

// Check if user can act as professional
userSchema.methods.canActAsProfessional = function (): boolean {
  const roles = Array.isArray(this.role) ? this.role : [this.role];
  return roles.includes("professional") || roles.includes("admin");
};

// Check if user can have premium
userSchema.methods.canHavePremium = function (): boolean {
  const roles = Array.isArray(this.role) ? this.role : [this.role];
  return roles.includes("user") || roles.includes("professional");
};

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
