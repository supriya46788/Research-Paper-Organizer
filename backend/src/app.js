import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory and go up one level
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory (backend root)
dotenv.config({ path: join(__dirname, '../.env') });

// Debug log to verify loading
console.log("=== Environment Variables Debug ===");
console.log("Loading .env from:", join(__dirname, '../.env'));
console.log("GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "✅ YES" : "❌ NO");
console.log("=====================================");

import express from "express";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import researchPaperRoutes from "./routes/researchPaperRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Backend application for Research Paper Organizer" });
});

app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/papers", researchPaperRoutes);
app.use("/api/gemini", geminiRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
