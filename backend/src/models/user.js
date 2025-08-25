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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;