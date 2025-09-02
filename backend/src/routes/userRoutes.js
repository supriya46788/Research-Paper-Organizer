import express from 'express';
import { getProfile, updateProfile, updatePreferences, updateNotifications } from '../controllers/userController.js';
import protectRoute from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protectRoute, getProfile);
router.put('/profile', protectRoute, updateProfile);
router.put('/preferences', protectRoute, updatePreferences);
router.put('/notifications', protectRoute, updateNotifications);

export default router;
