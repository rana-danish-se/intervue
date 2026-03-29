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