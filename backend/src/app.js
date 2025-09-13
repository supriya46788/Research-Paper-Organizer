import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Resolve dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env (must be before anything else)
dotenv.config({ path: join(__dirname, "../.env") });

// Debugging logs
console.log("=== Environment Variables Debug ===");
console.log("Loading .env from:", join(__dirname, "../.env"));
console.log(
  "GEMINI_API_KEY loaded:",
  process.env.GEMINI_API_KEY ? "✅ YES" : "❌ NO"
);
console.log(
  "GOOGLE_CLIENT_ID loaded:",
  process.env.GOOGLE_CLIENT_ID ? "✅ YES" : "❌ NO"
);
console.log("=====================================");

import express from "express";
import passport from "passport";
import "./config/passport-setup.js";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

// ⬇️ NEW: Import Firebase Admin
import admin from "firebase-admin";
import serviceAccount from "./utils/firebase.js";

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

import researchPaperRoutes from "./routes/researchPaperRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cloudRoutes from "./routes/cloudRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
  res.json({
    message:
      "Backend application for Research Paper Organizer ✅ with Firebase",
  });
});

// Middlewares
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/papers", researchPaperRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cloud", cloudRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
