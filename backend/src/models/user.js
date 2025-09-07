import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String }, // Made password optional
    googleId: { type: String }, // Added googleId
    isVerified: { type: Boolean, default: true }, // Auto-verify Google users
    preferences: {
      theme: { type: String, default: 'light' }
    },
    notifications: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;