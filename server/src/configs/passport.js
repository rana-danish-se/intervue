import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.model.js';
import dotenv from 'dotenv';
import * as authService from '../services/auth.service.js';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'missing_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'missing_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await authService.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (error) {
        console.error('Google Auth Error:', error);
        return done(error, null);
      }
    }
  )
);

// Serialize user into the sessions (Required by passport structurally)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the sessions (Required by passport structurally)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
