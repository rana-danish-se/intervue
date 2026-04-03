import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    default: null,
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  googleId: {
    type: String,
    default: null,
    index: true,
  },
  avatar: {
    type: String,
    default: null,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerifyToken: {
    type: String,
    default: null,
    select: false,
  },
  emailVerifyExpires: {
    type: Date,
    default: null,
    select: false,
  },

  passwordResetToken: {
    type: String,
    default: null,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
    select: false,
  },

  plan: {
    type: String,
    enum: {
      values: ['free', 'pro', 'enterprise'],
      message: '{VALUE} is not a valid plan type'
    },
    default: 'free',
  },
  planExpiresAt: {
    type: Date,
    default: null,
  },
  stripeCustomerId: {
    type: String,
    default: null,
    select: false,
  },
  stripeSubscriptionId: {
    type: String,
    default: null,
    select: false,
  },

}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
});

userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password || !candidatePassword) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

/*
FILE: src/models/User.model.js
ROLE: Mongoose schema and model definition for the User entity. Defines the full data shape of a user in MongoDB, enforces validation rules, hashes passwords automatically before saving, and exposes an instance method for password comparison.

SCHEMA FIELDS:
  - name: Required string (2–50 chars), trimmed.
  - email: Required, unique, lowercase-trimmed string validated against a regex pattern.
  - password: Optional string (min 6 chars), excluded from query results by default (select: false). Null for Google-only accounts.
  - googleId: Optional indexed string used to look up OAuth users.
  - avatar: Optional string URL for the user's profile picture.
  - isVerified: Boolean flag indicating whether the user's email has been confirmed. Defaults to false.
  - emailVerifyToken: Hashed token stored during email verification flow (select: false).
  - emailVerifyExpires: Expiry date for the email verification token (select: false).
  - passwordResetToken: Hashed token stored during the password-reset flow (select: false).
  - passwordResetExpires: Expiry date for the password-reset token (select: false).
  - plan: Enum ('free' | 'pro' | 'enterprise') controlling feature access. Defaults to 'free'.
  - planExpiresAt: Optional date after which the current plan should lapse.
  - stripeCustomerId: Stripe customer ID (select: false).
  - stripeSubscriptionId: Active Stripe subscription ID (select: false).
  - timestamps: Mongoose auto-adds createdAt and updatedAt fields.
  - toJSON transform: Strips __v and password from serialised output.

FUNCTIONS / LOGIC:
  - userSchema.pre('save') hook — runs before every save operation. If the password field exists and has been modified, generates a bcrypt salt (round 10) and replaces the plain-text password with its hash. Skips hashing if password is unmodified or null (Google users).
  - userSchema.methods.comparePassword(candidatePassword) — instance method that uses bcrypt.compare to check whether a plaintext candidate matches the stored hash. Returns false early if either value is missing, preventing errors for Google-only accounts.

IMPORTED BY:
  - src/configs/passport.js — imports User to perform User.findById() during deserializeUser.
  - src/middlewares/authMiddleware.js — imports User to fetch the authenticated user document by decoded JWT ID.
  - src/services/auth.service.js — imports User to perform all database operations: findOne, create, save across registration, login, Google OAuth, email verification, and password reset flows.
*/
