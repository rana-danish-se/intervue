import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // 2.1 Identity & Core
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    // Null for Google OAuth users
    default: null,
  },
  googleId: {
    type: String,
    // Null for email/password users
    default: null,
  },
  avatar: {
    type: String,
    default: null,
  },
  
  // 2.2 Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerifyToken: {
    type: String,
    default: null,
  },
  emailVerifyExpires: {
    type: Date,
    default: null,
  },

  // 2.3 Password Reset
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },

  // 2.4 Subscription / Payment (future-ready)
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
  planExpiresAt: {
    type: Date,
    default: null,
  },
  stripeCustomerId: {
    type: String,
    default: null,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
  },

}, {
  timestamps: true,
});

export const User = mongoose.model('User', userSchema);
