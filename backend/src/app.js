import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import admin from "firebase-admin";

// Import custom modules
import "./config/passport-setup.js";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import researchPaperRoutes from "./routes/researchPaperRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cloudRoutes from "./routes/cloudRoutes.js";
import serviceAccount from "./utils/firebase.js";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

// Debugging environment variables
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

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(join(__dirname, "../")));

// Root route serves home.html
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../home.html"));
});

// Optional redirect if landing.html is requested
app.get("/landing.html", (req, res) => {
  res.redirect("/home.html");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/papers", researchPaperRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/user", userRoutes);
app.use("/api/cloud", cloudRoutes);

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend application for Research Paper Organizer ✅ with Firebase",
  });
});

// Start server and connect to DB
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
