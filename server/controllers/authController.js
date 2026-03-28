import crypto from 'crypto';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import generateVerifyToken from '../utils/generateVerifyToken.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';

// ─── REGISTER ───────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const { rawToken, hashedToken } = generateVerifyToken();

    const user = await User.create({
      name,
      email,
      password,
      emailVerifyToken: hashedToken,
      emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;

    await sendEmail(
      email,
      'Verify your Intervue account',
      `<p>Hi ${name},</p>
       <p>Click the link below to verify your email:</p>
       <a href="${verifyUrl}">${verifyUrl}</a>
       <p>This link expires in 24 hours.</p>`
    );

    res.status(201).json({ message: 'Registration successful. Please check your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── VERIFY EMAIL ────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    user.isEmailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isEmailVerified)
      return res.status(403).json({ message: 'Please verify your email first' });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Lightweight readable cookie for Next.js middleware
    res.cookie('isLoggedIn', 'true', {
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GOOGLE CALLBACK ─────────────────────────────────────────
export const googleCallback = (req, res) => {
  const accessToken = generateAccessToken(req.user._id);
  const refreshToken = generateRefreshToken(req.user._id);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('isLoggedIn', 'true', {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
};

// ─── REFRESH TOKEN ───────────────────────────────────────────
export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────
export const logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.clearCookie('isLoggedIn');
  res.status(200).json({ message: 'Logged out successfully' });
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return 200 to prevent email enumeration
    if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

    const { rawToken, hashedToken } = generateVerifyToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail(
      email,
      'Reset your Intervue password',
      `<p>Click the link below to reset your password:</p>
       <a href="${resetUrl}">${resetUrl}</a>
       <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
    );

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    user.password = req.body.newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ME ──────────────────────────────────────────────────
export const getMe = (req, res) => {
  res.status(200).json({ user: req.user });
};