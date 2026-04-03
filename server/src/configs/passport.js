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

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/*
FILE: src/configs/passport.js
ROLE: Passport.js strategy configuration. Registers the Google OAuth 2.0 strategy and defines serialize/deserialize hooks. This file is executed for its side-effects (mutating the global passport instance) and does not export anything.

FUNCTIONS / LOGIC:
  - GoogleStrategy callback (accessToken, refreshToken, profile, done) — receives the OAuth profile from Google after a successful authentication redirect, delegates to authService.findOrCreateGoogleUser(profile) to look up or create a user in MongoDB, then calls done(null, user) to signal success. On error, calls done(error, null).
  - passport.serializeUser(user, done) — extracts user._id from the authenticated user object and stores it in the session. Required by Passport's internal architecture even though session-based auth is not actively used (JWT cookies are used instead).
  - passport.deserializeUser(id, done) — takes the stored _id, queries User.findById(id) from MongoDB, and attaches the full user document back to req.user. Passes any DB error to done.

IMPORTED BY:
  - src/app.js — imports this file with `import './configs/passport.js'` so that the strategy is registered on the passport singleton before any route handler runs.
*/
