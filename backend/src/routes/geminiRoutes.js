import express from "express";
import multer from "multer";
import { geminiChat, summarizePaper } from "../controllers/geminiController.js";
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for PDF uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Existing chat route
router.post("/chat", protectRoute, geminiChat);

// NEW: Summarize route (without auth protection for now)
router.post("/summarize", upload.single('file'), summarizePaper);

export default router;
