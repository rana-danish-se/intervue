import express from 'express';
import passport from 'passport';
import {
  register, verifyEmail, login, googleCallback,
  refreshToken, logout, forgotPassword, resetPassword, getMe
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);
router.post('/refresh-token', refreshToken);
router.post('/logout', protectRoute, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protectRoute, getMe);

export default router;

/*
FILE: src/routes/auth.js
ROLE: Express router for all authentication-related HTTP endpoints. Maps URL patterns and HTTP methods to their corresponding controller functions and applies route-level middleware guards where needed. Mounted at /api/auth in app.js.

ROUTES:
  - POST   /register                 → register controller (no auth required)
  - GET    /verify-email/:token      → verifyEmail controller (no auth required; token is in the URL param)
  - POST   /login                    → login controller (no auth required)
  - GET    /google                   → passport.authenticate('google') — redirects the browser to Google's OAuth consent screen requesting 'profile' and 'email' scopes
  - GET    /google/callback          → passport.authenticate('google', { session: false }) then googleCallback controller — receives Google's redirect, validates the OAuth code, and issues JWT cookies
  - POST   /refresh-token            → refreshToken controller (no auth guard; validates the refresh cookie internally)
  - POST   /logout                   → protectRoute middleware then logout controller (requires valid access token)
  - POST   /forgot-password          → forgotPassword controller (no auth required)
  - POST   /reset-password/:token    → resetPassword controller (no auth required; token is in the URL param)
  - GET    /me                       → protectRoute middleware then getMe controller (requires valid access token)

IMPORTED BY:
  - src/app.js — imports this router as the default export and mounts it with `app.use('/api/auth', authRoutes)`.
*/