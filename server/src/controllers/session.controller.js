import mongoose from 'mongoose';
import Session from '../models/Session.model.js';
import Interview from '../models/Interview.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as llmService from '../services/llm.service.js';

export const generateQuestions = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Session ID
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid session ID format', 400));
  }

  const session = await Session.findById(id);
  if (!session) {
    return next(new AppError('Session not found', 404));
  }

  const interview = await Interview.findById(session.interviewId);
  if (!interview) {
    return next(new AppError('Associated interview not found', 404));
  }

  // Ensure user owns this interview
  if (interview.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to access this session', 403));
  }

  // If questions already exist, no need to generate
  if (session.questions && session.questions.length > 0) {
    return res.status(200).json({
      success: true,
      message: 'Questions already generated',
      questionCount: session.questions.length,
    });
  }

  // Generate the questions
  const generatedQuestions = await llmService.generateSessionQuestions(
    interview.role,
    interview.experienceLevel,
    session.focus || 'General Domain Knowledge',
    5 // generate exactly 5 questions
  );

  // Update session
  session.questions = generatedQuestions;
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Questions successfully generated',
    questionCount: session.questions.length,
    // CRITICAL: We do NOT return the question text payload to ensure the frontend cannot leak it
  });
});

export const createCustomSession = asyncHandler(async (req, res, next) => {
  const { interviewId, title, focus } = req.body;
  const userId = req.user._id;

  if (!interviewId || !title) {
    return next(new AppError('Interview ID and Title are required', 400));
  }

  const interview = await Interview.findById(interviewId);
  if (!interview) {
    return next(new AppError('Interview not found', 404));
  }

  if (interview.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to access this interview', 403));
  }

  const existingSessions = await Session.find({ interviewId });
  const nextOrder = existingSessions.length > 0 
    ? Math.max(...existingSessions.map(s => s.order)) + 1 
    : 1;

  const session = await Session.create({
    interviewId,
    title,
    focus: focus || null,
    order: nextOrder,
    status: 'pending',
    questions: []
  });

  res.status(201).json({
    success: true,
    message: 'Custom session created successfully',
    session
  });
});

export const reorderSessions = asyncHandler(async (req, res, next) => {
  const { updates } = req.body; // Expects [{ id, order }]
  const userId = req.user._id;

  if (!updates || !Array.isArray(updates)) {
    return next(new AppError('Invalid updates payload', 400));
  }

  // We need to verify ownership, so we fetch one session to get its interviewId
  if (updates.length > 0) {
    const firstSession = await Session.findById(updates[0].id);
    if (!firstSession) return next(new AppError('Session not found', 404));

    const interview = await Interview.findById(firstSession.interviewId);
    if (interview.userId.toString() !== userId.toString()) {
      return next(new AppError('Not authorized', 403));
    }

    // Perform bulk update
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { order: update.order } }
      }
    }));

    await Session.bulkWrite(bulkOps);
  }

  res.status(200).json({
    success: true,
    message: 'Sessions reordered successfully'
  });
});

/*
FILE: src/controllers/session.controller.js
ROLE: HTTP handlers for session-specific actions.
IMPORTED BY:
  - src/routes/session.js
*/
