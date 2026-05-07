/*
Role: Interview HTTP controller layer.
What it does: Validates request payloads/params and delegates interview-domain operations to service methods.
Where used: Wired by interview routes under `/api/interviews`.
Why it exists: Keeps transport concerns separate from persistence and business logic.
*/

import mongoose from 'mongoose';
import * as interviewService from '../services/interview.service.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';


export const createInterview = asyncHandler(async (req, res, next) => {
  const { role, experienceLevel, jobDescription, goal, sessionCount } = req.body;
  const userId = req.user._id;

  // Validation
  if (!role || typeof role !== 'string') {
    return next(new AppError('Role is required and must be a string', 400));
  }
  if (role.trim().length === 0) {
    return next(new AppError('Role cannot be empty', 400));
  }
  if (role.length > 50) {
    return next(new AppError('Role cannot exceed 50 characters', 400));
  }

  if (!experienceLevel) {
    return next(new AppError('Experience level is required', 400));
  }
  const validExperienceLevels = ['junior', 'mid', 'senior'];
  if (!validExperienceLevels.includes(experienceLevel)) {
    return next(new AppError(`${experienceLevel} is not a valid experience level`, 400));
  }

  if (jobDescription && typeof jobDescription === 'string' && jobDescription.length > 500) {
    return next(new AppError('Job description cannot exceed 500 characters', 400));
  }

  if (goal && typeof goal === 'string' && goal.length > 200) {
    return next(new AppError('Goal cannot exceed 200 characters', 400));
  }

  const parsedSessionCount = sessionCount ? parseInt(sessionCount, 10) : 3;
  if (isNaN(parsedSessionCount) || parsedSessionCount < 1 || parsedSessionCount > 5) {
    return next(new AppError('Session count must be a number between 1 and 5', 400));
  }

  const interviewData = {
    userId,
    role: role.trim(),
    experienceLevel,
    sessionCount: parsedSessionCount,
    ...(jobDescription && { jobDescription: jobDescription.trim() }),
    ...(goal && { goal: goal.trim() }),
  };

  const result = await interviewService.createInterview(interviewData);

  res.status(201).json({
    success: true,
    interview: result.interview,
    sessions: result.sessions,
  });
});

export const getUserInterviews = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const interviews = await interviewService.getUserInterviews(userId);

  res.status(200).json({
    success: true,
    count: interviews.length,
    interviews,
  });
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const summary = await interviewService.getDashboardSummary(userId);
  res.status(200).json({
    success: true,
    ...summary,
  });
});

// Bug #5 fix — new GET /:id handler
export const getInterview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Bug #2 fix — validate ObjectId format before hitting the DB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid interview ID format', 400));
  }

  const result = await interviewService.getInterviewById(id, userId);

  res.status(200).json({
    success: true,
    interview: result, // result now contains the interview object merged with the sessions array
  });
});

export const deleteInterview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Bug #2 fix — validate ObjectId format before hitting the DB
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid interview ID format', 400));
  }

  // Bug #1 fix — no inner try/catch; asyncHandler + AppErrors in service handle all errors
  // Bug #3 fix — service throws AppError directly, so no string-matching needed
  await interviewService.deleteInterviewById(id, userId);

  res.status(200).json({
    success: true,
    message: 'Interview deleted successfully',
  });
});


/*
FILE: src/controllers/interview.controller.js
ROLE: HTTP layer for all interview-related endpoints. Reads from req.body, req.params, and
req.user, delegates business logic and database operations to interviewService, and sends
structured JSON responses. All handlers are wrapped in asyncHandler to forward unexpected
errors to the global error middleware. Validation lives here; DB queries and domain rules
live in the service.

FUNCTIONS / LOGIC:
  - createInterview — validates and assembles interviewData from req.body, calls
    interviewService.createInterview(interviewData), returns 201 with the created document.
  - getUserInterviews — calls interviewService.getUserInterviews(userId), returns 200 with
    count and interviews array. An empty array is valid and not treated as an error.
  - getInterview — validates ObjectId format, calls interviewService.getInterviewById(id, userId),
    returns 200 with the interview document. Service throws AppError 404/403 if not found or
    not owned.
  - deleteInterview — validates ObjectId format, calls interviewService.deleteInterviewById(id, userId).
    Service throws AppError 404/403 directly; asyncHandler forwards any other unexpected error.
    Returns 200 on success.

IMPORTED BY:
  - src/routes/interview.js — imports all four named exports.
*/