import Interview from '../models/Interview.model.js';
import Session from '../models/Session.model.js';
import * as llmService from './llm.service.js';
import AppError from '../utils/AppError.js';

export const createInterview = async (interviewData) => {
  const interview = await Interview.create(interviewData);
  let insertedSessions = [];

  try {
    const blueprints = await llmService.generateSessionBlueprints(interviewData);
    
    const sessionsToInsert = blueprints.map(session => ({
      ...session,
      interviewId: interview._id,
      questions: [], // start empty for JIT generation
      status: 'pending'
    }));

    insertedSessions = await Session.insertMany(sessionsToInsert);
  } catch (error) {
    throw new AppError('Interview created, but failed to generate session blueprints: ' + error.message, 500);
  }

  return { interview, sessions: insertedSessions };
};

export const getUserInterviews = async (userId) => {
  const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
  return interviews;
};

export const getInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }
  if (interview.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to access this interview', 403);
  }

  const sessions = await Session.find({ interviewId }).sort({ order: 1 });
  
  return { ...interview.toObject(), sessions };
};

export const deleteInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new AppError('Interview not found', 404);
  }
  if (interview.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized to delete this interview', 403);
  }
  
  await Session.deleteMany({ interviewId });
  await interview.deleteOne();
  return true;
};

/*
FILE: src/services/interview.service.js
ROLE: Business logic layer for all interview operations. Handles interview creation (including triggering LLM session generation), retrieval, and deletion (including cascade delete of sessions).
IMPORTED BY:
  - src/controllers/interview.controller.js — delegates HTTP request operations to these service functions.
*/