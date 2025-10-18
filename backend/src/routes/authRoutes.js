import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Google Auth Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google Auth Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login.html" }),
  (req, res) => {
    // On successful authentication, user object is attached to req.user
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Corrected Redirect: Points to your frontend application's callback page
    const user = req.user;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5500";
    const redirectUrl = `${frontendUrl}/auth-callback.html?token=${token}&name=${encodeURIComponent(user.name)}&email=${user.email}`;
    
    res.redirect(redirectUrl);
  }
);

export default router;