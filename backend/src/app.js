import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
const port = 3000;

dotenv.config();

app.get("/", (req, res) => {
  res.json({ message: "Backend application for Research Paper Organizer" });
});

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
