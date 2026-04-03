import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/AppError.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select(
      '-password -emailVerifyToken -passwordResetToken'
    );

    if (!req.user) {
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    next();
  } catch (error) {
    return next(new AppError('Token invalid or expired', 401));
  }
};

export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user.isVerified) {
    return next(new AppError('Please verify your email address to access this feature', 403));
  }
  next();
};

export const requirePlan = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.plan)) {
      return next(new AppError('Your current plan does not grant access to this feature', 403));
    }
    next();
  };
};

/*
FILE: src/middlewares/authMiddleware.js
ROLE: Route-protection middleware layer. Provides guards that can be chained onto any Express route to enforce authentication, email verification, and subscription plan requirements before the request reaches a controller.

FUNCTIONS / LOGIC:
  - protectRoute(req, res, next) — reads the accessToken from req.cookies, verifies it against JWT_SECRET using jsonwebtoken. If the token is missing or invalid, forwards a 401 AppError. If valid, queries the User model by the decoded ID (excluding sensitive fields: password, emailVerifyToken, passwordResetToken) and attaches the document to req.user. If the user document no longer exists in the DB, also returns 401.
  - requireVerifiedEmail(req, res, next) — checks req.user.isVerified (must run after protectRoute). If the user has not verified their email, forwards a 403 AppError. Otherwise calls next() to proceed.
  - requirePlan(...roles)(req, res, next) — factory function that accepts one or more plan names (e.g. 'pro', 'enterprise') and returns a middleware. The returned middleware checks whether req.user.plan is included in the allowed roles list; if not, forwards a 403 AppError.

IMPORTED BY:
  - src/routes/auth.js — imports { protectRoute } and applies it to the POST /logout and GET /me routes to ensure only authenticated users can access them.
*/