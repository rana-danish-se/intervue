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
