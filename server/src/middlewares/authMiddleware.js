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
    
    // Select user without sensitive fields
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