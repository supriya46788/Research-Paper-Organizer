import express from 'express';
import multer from 'multer';
import { uploadPaperToCloud, downloadPaperFromCloud } from '../controllers/cloudController.js';
import protectRoute from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protectRoute, upload.single('file'), uploadPaperToCloud);
router.get('/download/:fileName', protectRoute, downloadPaperFromCloud);

export default router;
