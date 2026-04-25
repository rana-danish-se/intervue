import mongoose from 'mongoose';
import questionSchema from './Question.model.js';

const sessionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: [true, 'Interview ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
  },
  focus: {
    type: String,
    trim: true,
    default: null,
  },
  order: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed','abandoned'],
    default: 'pending',
  },
  questions: [questionSchema]
}, {
  timestamps: true,
});

export default mongoose.model('Session', sessionSchema);

/*
FILE: src/models/Session.model.js
ROLE: Mongoose model representing an interview session, grouping multiple questions together.
IMPORTED BY:
  - src/services/interview.service.js — to create and manage sessions during or after interview creation.
*/
