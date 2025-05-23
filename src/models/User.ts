import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  emailVerified?: Date;
  role?: "user" | "admin" | "trainer" | "nutritionist";
  specialization?: string;
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
      type: String,
      enum: ["user", "admin", "trainer", "nutritionist"],
      default: "user",
    },
    specialization: String,
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

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
