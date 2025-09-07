import express from "express";
import {
  createPaper,
  getPaper,
  getPapers,
  updatePaper,
  deletePaper,
  saveAnnotations,
  suggestTags
} from "../controllers/researchPaperController.js";
import protectRoute from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, createPaper);
router.get("/", protectRoute, getPapers);
router.get("/:id", protectRoute, getPaper);
router.put("/:id", protectRoute, updatePaper);
router.delete("/:id", protectRoute, deletePaper);
router.post("/:id/annotations", saveAnnotations);
router.post("/suggest-tags", suggestTags);

export default router;