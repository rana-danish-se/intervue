/*
Role: HTTP handlers for session lifecycle APIs.
What it does: Coordinates question generation, completion/evaluation, status transitions, and report retrieval while delegating shared access checks and scoring math.
Where used: Mounted by `routes/session.js` for all authenticated session endpoints.
Why it exists: Keeps transport concerns at controller level while preserving consistent API contracts for client interview flows.
*/

import Session from '../models/Session.model.js';
import Interview from '../models/Interview.model.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import * as llmService from '../services/llm.service.js';
import { getAuthorizedSessionAndInterview } from '../services/sessionAccess.service.js';
import { scoreQuestions } from '../utils/sessionMetrics.js';

const calibrateScore = (value, hasAnswer = true) => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  if (!hasAnswer) return Math.min(30, clamped);
  // Soften overly strict marking while preserving ranking.
  if (clamped < 40) return clamped + 15;
  if (clamped < 60) return clamped + 10;
  if (clamped < 75) return clamped + 6;
  return clamped;
};

export const generateQuestions = asyncHandler(async (req, res, next) => {
  const { id } = req.params; // Session ID
  const { difficulty, interviewerPersona } = req.body || {};
  const userId = req.user._id;
  const allowedDifficulties = ['easy', 'medium', 'hard'];
  const allowedPersonas = ['friendly', 'neutral', 'tough'];

  const { session, interview } = await getAuthorizedSessionAndInterview(id, userId);

  // If questions already exist, return them directly so the room can start
  if (session.questions && session.questions.length > 0) {
    if (difficulty && allowedDifficulties.includes(difficulty)) {
      session.difficulty = difficulty;
    }
    if (interviewerPersona && allowedPersonas.includes(interviewerPersona)) {
      session.interviewerPersona = interviewerPersona;
    }
    session.status = 'in-progress';
    await session.save();
    return res.status(200).json({
      success: true,
      message: 'Questions already generated',
      difficulty: session.difficulty,
      questions: session.questions.map(q => ({ _id: q._id, questionText: q.questionText }))
    });
  }

  const selectedDifficulty =
    difficulty && allowedDifficulties.includes(difficulty)
      ? difficulty
      : (session.difficulty || 'medium');
  const selectedPersona =
    interviewerPersona && allowedPersonas.includes(interviewerPersona)
      ? interviewerPersona
      : (session.interviewerPersona || 'neutral');

  // Generate the questions
  const generatedQuestions = await llmService.generateSessionQuestions(
    interview.role,
    interview.experienceLevel,
    session.focus || 'General Domain Knowledge',
    5,
    selectedDifficulty,
    selectedPersona
  );

  // Update session & mark as in-progress
  session.questions = generatedQuestions;
  session.status = 'in-progress';
  session.difficulty = selectedDifficulty;
  session.interviewerPersona = selectedPersona;
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Questions successfully generated',
    difficulty: session.difficulty,
    interviewerPersona: session.interviewerPersona,
    // Return question text so the room can display them in sequence
    questions: session.questions.map(q => ({ _id: q._id, questionText: q.questionText }))
  });
});

export const createCustomSession = asyncHandler(async (req, res, next) => {
  const { interviewId, title, focus, difficulty } = req.body;
  const userId = req.user._id;
  const allowedDifficulties = ['easy', 'medium', 'hard'];

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
    difficulty: allowedDifficulties.includes(difficulty) ? difficulty : 'medium',
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

  if (updates.length > 0) {
    const sessionIds = updates.map((item) => item.id);
    const sessions = await Session.find({ _id: { $in: sessionIds } }).select("_id interviewId");
    if (sessions.length !== updates.length) {
      return next(new AppError("One or more sessions were not found", 404));
    }
    const interviewIds = [...new Set(sessions.map((item) => String(item.interviewId)))];
    if (interviewIds.length !== 1) {
      return next(new AppError("Sessions must belong to one interview", 400));
    }
    const interview = await Interview.findById(interviewIds[0]).select("userId");
    if (!interview || interview.userId.toString() !== userId.toString()) {
      return next(new AppError("Not authorized", 403));
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
  const { session } = await getAuthorizedSessionAndInterview(id, userId);

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

  const { session, interview } = await getAuthorizedSessionAndInterview(id, userId);

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
        const hasAnswer = !!question.userResponseText?.trim();
        question.stats = {
          confidence: calibrateScore(evaluation.scores?.confidence, hasAnswer),
          knowledgeLevel: calibrateScore(evaluation.scores?.knowledge, hasAnswer),
          relevance: calibrateScore(evaluation.scores?.relevance, hasAnswer),
          fluency: calibrateScore(evaluation.scores?.fluency, hasAnswer),
          clarity: calibrateScore(evaluation.scores?.clarity, hasAnswer),
        };
        question.feedback = evaluation.feedback || "No feedback provided.";
        question.strongerAnswerSuggestion = evaluation.strongerAnswerSuggestion || null;
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

// New: Generate and return a session report for a given session ID
export const getSessionReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { session } = await getAuthorizedSessionAndInterview(id, userId);

  // Generate a detailed report using the LLM service
  const report = await llmService.generateSessionReport(session);

  res.status(200).json({
    success: true,
    sessionId: id,
    report
  });
});

// Bulk evaluation endpoint: evaluate all provided answers in one go
export const evaluateSession = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { answers } = req.body; // [{ questionId, answerText }]
  const userId = req.user._id;

  const { session, interview } = await getAuthorizedSessionAndInterview(id, userId);

  session.status = "processing";
  await session.save();

  const perQuestion = [];
  let scoreAccumulator = 0;
  let scoredItems = 0;

  for (const answer of answers || []) {
    const question = session.questions.find(
      (qq) => String(qq._id) === String(answer.questionId)
    );
    if (!question) continue;

    question.userResponseText = answer.answerText || "";

    const evalRes = await llmService.evaluateAnswer({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      question: question.questionText,
      answer: answer.answerText || "",
    });

    const scores = evalRes?.scores || {};
    const hasAnswer = !!question.userResponseText?.trim();
    question.stats = {
      confidence: calibrateScore(scores.confidence, hasAnswer),
      knowledgeLevel: calibrateScore(scores.knowledge, hasAnswer),
      relevance: calibrateScore(scores.relevance, hasAnswer),
      fluency: calibrateScore(scores.fluency, hasAnswer),
      clarity: calibrateScore(scores.clarity, hasAnswer),
    };
    question.feedback = evalRes?.feedback || "No feedback provided.";
    question.strongerAnswerSuggestion = evalRes?.strongerAnswerSuggestion || null;

    const questionScore = scoreQuestions([question]) || 0;

    scoreAccumulator += questionScore;
    scoredItems += 1;

    perQuestion.push({
      questionId: String(question._id),
      questionText: question.questionText,
      answerText: question.userResponseText,
      feedback: question.feedback,
      strongerAnswerSuggestion: question.strongerAnswerSuggestion,
      stats: question.stats,
      score: questionScore,
    });
  }

  const finalScore = scoredItems > 0 ? Math.round(scoreAccumulator / scoredItems) : 0;
  session.status = "completed";
  await session.save();

  res.status(200).json({
    success: true,
    sessionId: id,
    report: {
      score: finalScore,
      perQuestion,
      summary:
        scoredItems > 0
          ? `Evaluation completed with an overall score of ${finalScore}/100.`
          : "No answers were evaluated.",
    },
  });
});

export const getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { session, interview } = await getAuthorizedSessionAndInterview(id, userId);
  const overallScore = scoreQuestions(session.questions || []);

  res.status(200).json({
    id: session._id,
    interviewId: interview._id,
    title: session.title,
    status: session.status,
    focus: session.focus || "General Expertise",
    difficulty: session.difficulty || "medium",
    interviewerPersona: session.interviewerPersona || "neutral",
    order: session.order,
    sessionCount: interview.sessionCount,
    role: interview.role,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    overallScore,
    questions: (session.questions || []).map((q) => ({
      id: q._id,
      text: q.questionText,
      answerText: q.userResponseText || "",
      feedback: q.feedback || "",
      strongerAnswerSuggestion: q.strongerAnswerSuggestion || "",
      stats: q.stats || {},
    })),
  });
});

