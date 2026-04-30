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

  // If questions already exist, return them directly so the room can start
  if (session.questions && session.questions.length > 0) {
    session.status = 'in-progress';
    await session.save();
    return res.status(200).json({
      success: true,
      message: 'Questions already generated',
      questions: session.questions.map(q => ({ _id: q._id, questionText: q.questionText }))
    });
  }

  // Generate the questions
  const generatedQuestions = await llmService.generateSessionQuestions(
    interview.role,
    interview.experienceLevel,
    session.focus || 'General Domain Knowledge',
    5
  );

  // Update session & mark as in-progress
  session.questions = generatedQuestions;
  session.status = 'in-progress';
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Questions successfully generated',
    // Return question text so the room can display them in sequence
    questions: session.questions.map(q => ({ _id: q._id, questionText: q.questionText }))
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

export const abandonSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const session = await Session.findById(id);
  if (!session) return next(new AppError('Session not found', 404));

  const interview = await Interview.findById(session.interviewId);
  if (interview.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  session.status = 'abandoned';
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Session marked as abandoned'
  });
});

export const completeSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { answers } = req.body; // [{ questionId, answerText }]
  const userId = req.user._id;

  const session = await Session.findById(id);
  if (!session) return next(new AppError('Session not found', 404));

  const interview = await Interview.findById(session.interviewId);
  if (interview.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  // Save all answers initially
  if (answers && answers.length > 0) {
    answers.forEach(({ questionId, answerText }) => {
      const question = session.questions.id(questionId);
      if (question) question.userResponseText = answerText;
    });
  }

  // Set status to processing so client shows loading
  session.status = 'processing';
  await session.save();

  // Process evaluations in the background
  (async () => {
    try {
      // For each question, get feedback
      for (const question of session.questions) {
        if (!question.userResponseText) continue;

        const evaluation = await llmService.evaluateAnswer({
          role: interview.role,
          experienceLevel: interview.experienceLevel,
          question: question.questionText,
          answer: question.userResponseText
        });
        
        // Map evaluation to schema fields
        question.stats = {
          confidence: evaluation.scores?.confidence || 0,
          knowledgeLevel: evaluation.scores?.knowledge || 0,
          relevance: evaluation.scores?.relevance || 0,
          fluency: evaluation.scores?.fluency || 0,
          clarity: evaluation.scores?.clarity || 0,
        };
        question.feedback = evaluation.feedback || "No feedback provided.";
      }

      session.status = 'completed';
      await session.save();
    } catch (err) {
      console.error('Background report generation failed:', err);
      // Even if it fails, mark as completed so the user isn't stuck forever,
      // or we could add a 'failed' status, but for now fallback to completed.
      session.status = 'completed';
      await session.save();
    }
  })();

  res.status(200).json({
    success: true,
    message: 'Session is being evaluated'
  });
});

// Bulk evaluation endpoint: evaluate all provided answers in one go
export const evaluateSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { answers } = req.body; // [{ questionId, answerText }]
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid session ID format', 400));
  }

  const session = await Session.findById(id);
  if (!session) return next(new AppError('Session not found', 404));

  const interview = await Interview.findById(session.interviewId);
  if (!interview) return next(new AppError('Associated interview not found', 404));
  if (interview.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized', 403));
  }

  // Build per-question evaluation results
  const perQuestion = [];
  let scoresSum = 0;
  let count = 0;

  for (const a of (answers || [])) {
    const q = session.questions.find((qq) => String(qq._id) === String(a.questionId));
    if (!q) continue;
    const evalRes = await llmService.evaluateAnswer({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      question: q.questionText,
      answer: a.answerText
    });
    const s = evalRes?.scores || {};
    const item = {
      questionId: String(q._id),
      questionText: q.questionText,
      answerText: a.answerText,
      evaluation: evalRes,
      score: s.score ?? 0,
      confidence: s.confidence ?? 0
    };
    perQuestion.push(item);
    scoresSum += (s.score ?? 0);
    count += 1;
  }

  const finalScore = count > 0 ? Math.round((scoresSum / count) * 10) / 10 : 0;
  const report = {
    perQuestion,
    score: finalScore,
    summary: `Bulk evaluation completed. Final score: ${finalScore}.`,
    feedback: perQuestion.length
      ? 'Overall performance assessed across all questions.'
      : 'No answers evaluated.'
  };

  session.status = 'completed';
  session.report = report;
  // Persist raw answers if desired
  if (answers && answers.length > 0) {
    session.answers = answers;
  }
  await session.save();

  res.status(200).json({ success: true, sessionId: id, report });
});

/*
FILE: src/controllers/session.controller.js
ROLE: HTTP handlers for session-specific actions.
IMPORTED BY:
  - src/routes/session.js
*/
