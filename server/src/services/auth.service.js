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

  // Remove password from memory before returning
  user.password = undefined;

  return user;
};

export const createPasswordResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    // Return null instead of error to prevent email enumeration
    return null;
  }

  const { rawToken, hashedToken } = generateVerifyToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
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
