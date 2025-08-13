import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/db.js";
const app = express();
const port = 3000;

dotenv.config();

app.get("/", (req, res) => {
  res.json({ message: "Backend application for Research Paper Organizer" });
});

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
};

startServer();
