import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper for sending tokens via Cookie
const sendTokenResponse = (user, statusCode, res, isNewRegistration = false) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('isLoggedIn', 'true', {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // For registration where email isn't verified, we might avoid sending full details
  if (isNewRegistration) {
    return res.status(statusCode).json({ message: 'Registration successful. Please check your email.' });
  }

  res.status(statusCode).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      plan: user.plan,
    },
  });
};

// ─── REGISTER ───────────────────────────────────────────────
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    await authService.createUser(name, email, password);
    res.status(201).json({ message: 'Registration successful. Please check your email.' });
  } catch (error) {
    if (error.message === 'Email already in use') {
      return next(new AppError(error.message, 400));
    }
    return next(new AppError(error.message, 500));
  }
});

// ─── VERIFY EMAIL ────────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    await authService.verifyEmailToken(req.params.token);
    res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
  } catch (error) {
    if (error.message === 'Token invalid or expired') {
      return next(new AppError(error.message, 400));
    }
    return next(new AppError(error.message, 500));
  }
});

// ─── LOGIN ───────────────────────────────────────────────────
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await authService.loginUser(email, password);

    if (!user.isEmailVerified) {
      return next(new AppError('Please verify your email first', 403));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return next(new AppError(error.message, 401));
    }
    return next(new AppError(error.message, 500));
  }
});

// ─── GOOGLE CALLBACK ─────────────────────────────────────────
export const googleCallback = asyncHandler(async (req, res, next) => {
  const accessToken = generateAccessToken(req.user._id);
  const refreshToken = generateRefreshToken(req.user._id);

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('isLoggedIn', 'true', {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=secured`); // Mask URL payload
});

// ─── REFRESH TOKEN ───────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return next(new AppError('No refresh token', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id);

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    };

    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: 'Token refreshed' });
  } catch {
    return next(new AppError('Invalid refresh token', 401));
  }
});

// ─── LOGOUT ──────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.cookie('accessToken', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.cookie('isLoggedIn', 'none', { expires: new Date(Date.now() + 10 * 1000) });
  
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─── FORGOT PASSWORD ─────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const result = await authService.createPasswordResetToken(email);

  // Always return 200 to prevent enumerations
  if (!result) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const { rawToken } = result;
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  await sendEmail(
    email,
    'Reset your Intervue password',
    `<p>Click the link below to reset your password:</p>
     <a href="${resetUrl}">${resetUrl}</a>
     <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
  );

  res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
});

// ─── RESET PASSWORD ──────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res, next) => {
  try {
    await authService.resetUserPassword(req.params.token, req.body.newPassword);
    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    if (error.message === 'Token invalid or expired') {
      return next(new AppError(error.message, 400));
    }
    return next(new AppError(error.message, 500));
  }
});

// ─── GET ME ──────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({ user: req.user });
});
