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
  maxQuestions: {
    type: Number,
    min: [3, 'Minimum number of questions is 3'],
    max: [10, 'Maximum number of questions is 10'],
    default: 5,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

export default mongoose.model('Interview', interviewSchema);
