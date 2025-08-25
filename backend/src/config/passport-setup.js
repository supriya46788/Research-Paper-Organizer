import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If user exists, return user
          return done(null, user);
        }

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            // Link Google ID to existing email account
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        // If not, create a new user
        const newUser = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        }).save();
        
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);