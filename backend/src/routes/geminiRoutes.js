import express from "express";
import { geminiChat } from "../controllers/geminiController.js";
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", protectRoute, geminiChat);

export default router;
