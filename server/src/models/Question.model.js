import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
  },
  userResponseText: {
    type: String,
    default: null,
  },
  audioUrl: {
    type: String,
    default: null,
  },
  userResponseAudioUrl: {
    type: String,
    default: null,
  },
  stats: {
    confidence: { type: Number, min: 0, max: 100, default: null },
    knowledgeLevel: { type: Number, min: 0, max: 100, default: null },
    relevance: { type: Number, min: 0, max: 100, default: null },
    fluency: { type: Number, min: 0, max: 100, default: null },
    clarity: { type: Number, min: 0, max: 100, default: null },
  },
  feedback: {
    type: String,
    default: null,
  }
});

export default questionSchema;

/*
FILE: src/models/Question.model.js
ROLE: Mongoose schema for individual interview questions, including user responses, audio links, and evaluation stats.
IMPORTED BY:
  - src/models/Session.model.js — used as an embedded subdocument array within the Session schema.
*/
