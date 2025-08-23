import express from "express";
import { fetchMetadata } from "../controllers/metadataController.js";

const router = express.Router();

router.post("/fetch", fetchMetadata);

export default router;
