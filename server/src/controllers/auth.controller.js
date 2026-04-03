import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

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

export const verifyEmail = asyncHandler(async (req, res, next) => {
  try {
    await authService.verifyEmailToken(req.params.token);
    res.status(200).json({ success: true, message: 'Email successfully verified' });
  } catch (error) {
    if (error.message === 'Token invalid or expired') {
      return next(new AppError(error.message, 400));
    }
    return next(new AppError(error.message, 500));
  }
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await authService.loginUser(email, password);

    if (!user.isVerified) {
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

  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=secured`);
});

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

export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('refreshToken', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.cookie('accessToken', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.cookie('isLoggedIn', 'none', { expires: new Date(Date.now() + 10 * 1000) });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const result = await authService.createPasswordResetToken(email);

  if (!result) {
    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  }

  const { rawToken } = result;
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${rawToken}`;

  await sendEmail(
    email,
    'Reset your Intervue password',
    `<p>Click the link below to reset your password:</p>
     <a href="${resetUrl}">${resetUrl}</a>
     <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`
  );

  res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
});

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

export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({ user: req.user });
});

/*
FILE: src/controllers/auth.controller.js
ROLE: HTTP request/response layer for all authentication operations. Receives validated requests from the router, delegates business logic to authService, and sends structured cookie-based token responses or JSON back to the client. All exported handlers are wrapped in asyncHandler so unhandled promise rejections are automatically forwarded to the global error handler.

FUNCTIONS / LOGIC:
  - sendTokenResponse(user, statusCode, res, isNewRegistration) — internal helper (not exported). Calls generateAccessToken and generateRefreshToken with user._id, sets three httpOnly cookies: refreshToken (7-day expiry), accessToken (15-minute expiry), and isLoggedIn (readable by client JS, 7-day expiry). For new registrations it returns a 201 with a plain message; for logins it returns the sanitised user object (id, name, email, avatar, plan).
  - register(req, res, next) — extracts name, email, password from req.body, calls authService.createUser() to persist the new user and send a verification email. Responds with 201 on success. Maps 'Email already in use' to a 400 AppError, all other errors to 500.
  - verifyEmail(req, res, next) — takes the raw token from req.params.token, passes it to authService.verifyEmailToken() which hashes it, looks up the matching user in MongoDB (checking expiry), marks isVerified = true, and clears the token fields. Responds 200 on success; maps 'Token invalid or expired' to 400.
  - login(req, res, next) — extracts email and password from req.body, calls authService.loginUser() which queries the user (with +password) and runs bcrypt comparison. If the user's email is not verified, returns 403. On success, calls sendTokenResponse() to issue cookies and return the user object. Maps 'Invalid email or password' to 401.
  - googleCallback(req, res, next) — runs after Passport has attached the authenticated user to req.user. Generates fresh access and refresh tokens, sets the three auth cookies, then redirects the browser to CLIENT_URL/auth/callback?token=secured to complete the client-side OAuth handshake.
  - refreshToken(req, res, next) — reads the refreshToken cookie from req.cookies, verifies it against JWT_REFRESH_SECRET, generates new access and refresh token pair, sets them as cookies, and responds 200. Returns 401 if the cookie is missing or the token is invalid/expired.
  - logout(req, res, next) — overwrites all three auth cookies (refreshToken, accessToken, isLoggedIn) with 'none' and a 10-second expiry, effectively clearing them from the browser. Responds 200.
  - forgotPassword(req, res, next) — reads email from req.body, calls authService.createPasswordResetToken() which stores a hashed reset token on the user. Builds a reset URL and calls sendEmail() with an HTML message containing it. Always returns 200 regardless of whether the email exists, preventing user enumeration.
  - resetPassword(req, res, next) — reads the raw token from req.params.token and newPassword from req.body, calls authService.resetUserPassword() which hashes the token, finds the matching user (checking expiry), updates the password and clears the reset fields. Responds 200. Maps 'Token invalid or expired' to 400.
  - getMe(req, res, next) — reads req.user (already populated by the protectRoute middleware) and returns it directly as a 200 JSON response. No DB query needed here.

IMPORTED BY:
  - src/routes/auth.js — imports all exported controller functions and maps them to their respective route definitions.
*/
