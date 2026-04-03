import crypto from 'crypto';
import User from '../models/User.model.js';
import generateVerifyToken from '../utils/generateVerifyToken.js';
import sendEmail from '../utils/sendEmail.js';

export const createUser = async (name, email, password) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already in use');
  }

  const { rawToken, hashedToken } = generateVerifyToken();

  const user = await User.create({
    name,
    email,
    password,
    emailVerifyToken: hashedToken,
    emailVerifyExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/auth/verify/${rawToken}`;

  await sendEmail(
    email,
    'Verify your Intervue account',
    `<p>Hi ${name},</p>
     <p>Click the link below to verify your email:</p>
     <a href="${verifyUrl}">${verifyUrl}</a>
     <p>This link expires in 24 hours.</p>`
  );

  return user;
};

export const findOrCreateGoogleUser = async (profile) => {
  const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

  let user = await User.findOne({ googleId: profile.id });
  if (user) {
    return user;
  }

  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user.googleId = profile.id;
      if (!user.avatar && profile.photos && profile.photos.length > 0) {
        user.avatar = profile.photos[0].value;
      }
      if (!user.isVerified) {
        user.isVerified = true;
      }
      await user.save();
      return user;
    }
  }

  const newUser = await User.create({
    googleId: profile.id,
    name: profile.displayName,
    email: email || `${profile.id}@placeholder.google.com`,
    avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
    isVerified: true,
  });

  return newUser;
};

export const verifyEmailToken = async (token) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerifyToken: hashedToken,
    emailVerifyExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Token invalid or expired');
  }

  user.isVerified = true;
  user.emailVerifyToken = null;
  user.emailVerifyExpires = null;
  await user.save();
  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  user.password = undefined;

  return user;
};

export const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  const { rawToken, hashedToken } = generateVerifyToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  await user.save();

  return { user, rawToken };
};

export const resetUserPassword = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Token invalid or expired');
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return user;
};

/*
FILE: src/services/auth.service.js
ROLE: Business logic layer for all authentication operations. Isolates database queries and domain rules from the HTTP controller layer. All functions are pure async operations that either return data or throw descriptive Errors caught by the controller.

FUNCTIONS / LOGIC:
  - createUser(name, email, password) — queries User.findOne({ email }) to check for an existing account; throws 'Email already in use' if found. Calls generateVerifyToken() to produce a rawToken (sent to the user) and hashedToken (stored in the DB). Creates the user document via User.create() with emailVerifyToken and a 24-hour emailVerifyExpires. Builds a verification URL using CLIENT_URL and calls sendEmail() with an HTML link. Returns the created user document.
  - findOrCreateGoogleUser(profile) — receives the OAuth profile object from Passport. Extracts the primary email from profile.emails[0]. First tries User.findOne({ googleId: profile.id }); returns immediately if found. Then tries User.findOne({ email }) to detect pre-existing email accounts — if found, links the googleId, adds the avatar if missing, sets isVerified = true, saves, and returns. If no existing user is found, creates a new User.create() document with googleId, displayName, email (fallback placeholder if Google provides no email), avatar, and isVerified = true.
  - verifyEmailToken(token) — hashes the raw URL token using crypto SHA-256, queries User.findOne matching emailVerifyToken and emailVerifyExpires > now. Throws 'Token invalid or expired' if not found. Sets isVerified = true and clears emailVerifyToken and emailVerifyExpires, then saves and returns the user.
  - loginUser(email, password) — queries User.findOne({ email }).select('+password') to include the normally-hidden password field. Throws 'Invalid email or password' if user not found (avoids revealing which field failed). Calls user.comparePassword(password) for bcrypt verification; throws the same error on mismatch. Strips user.password from the in-memory object before returning.
  - createPasswordResetToken(email) — queries User.findOne({ email }); returns null if not found (controller uses this to send a vague success response preventing enumeration). Calls generateVerifyToken(), stores the hashedToken in passwordResetToken and sets passwordResetExpires to now + 1 hour, then saves. Returns { user, rawToken } so the controller can build and email the reset URL.
  - resetUserPassword(token, newPassword) — hashes the raw token with SHA-256, queries User.findOne matching passwordResetToken and passwordResetExpires > now. Throws 'Token invalid or expired' if not found. Assigns newPassword to user.password (triggering the pre-save bcrypt hook), clears passwordResetToken and passwordResetExpires, saves, and returns the updated user.

IMPORTED BY:
  - src/controllers/auth.controller.js — imports all named exports via `import * as authService` and calls them within each controller handler.
  - src/configs/passport.js — imports { findOrCreateGoogleUser } to use inside the GoogleStrategy verify callback.
*/
