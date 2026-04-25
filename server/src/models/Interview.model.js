import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    maxlength: [50, 'Role cannot exceed 50 characters'],
    trim: true,
  },
  experienceLevel: {
    type: String,
    enum: {
      values: ['junior', 'mid', 'senior'],
      message: '{VALUE} is not a valid experience level',
    },
    required: [true, 'Experience level is required'],
  },
  jobDescription: {
    type: String,
    maxlength: [500, 'Job description cannot exceed 500 characters'],
    trim: true,
  },
  goal: {
    type: String,
    maxlength: [200, 'Goal cannot exceed 200 characters'],
    trim: true,
  },
  sessionCount: {
    type: Number,
    min: [1, 'At least 1 session is required'],
    max: [5, 'Maximum 5 sessions allowed'],
    default: 3,
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed'],
    default: 'draft',
  },
  finalVerdict: {
    improvementAreas: [{ type: String }],
    tips: [{ type: String }],
    hiringProbability: { type: Number, min: 0, max: 100, default: null }
  }
}, {
  timestamps: true,
});

export default mongoose.model('Interview', interviewSchema);
