import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL;
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to database.");
  } catch (error) {
    console.log("❌ Failed to connect to database");
    console.error(error.message);
    process.exit(1);
  }
};
