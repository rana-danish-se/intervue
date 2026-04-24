import * as interviewService from '../services/interview.service.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createInterview = asyncHandler(async (req, res, next) => {
  const { role, experienceLevel, jobDescription, goal, maxQuestions } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User ID is required. Please log in.', 401));
  }

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

  if (maxQuestions !== undefined) {
    const maxQ = Number(maxQuestions);
    if (isNaN(maxQ) || maxQ < 3 || maxQ > 10) {
      return next(new AppError('Maximum number of questions must be between 3 and 10', 400));
    }
  }

  const interviewData = {
    userId,
    role: role.trim(),
    experienceLevel,
    ...(jobDescription && { jobDescription: jobDescription.trim() }),
    ...(goal && { goal: goal.trim() }),
    ...(maxQuestions !== undefined && { maxQuestions: Number(maxQuestions) })
  };

  const interview = await interviewService.createInterview(interviewData);

  res.status(201).json({
    success: true,
    interview
  });
});

export const getUserInterviews = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User ID is required. Please log in.', 401));
  }

  const interviews = await interviewService.getUserInterviews(userId);
  
  res.status(200).json({
    success: true,
    count: interviews.length,
    interviews
  });
});

export const deleteInterview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return next(new AppError('User ID is required. Please log in.', 401));
  }

  if (!id) {
     return next(new AppError('Interview ID is required', 400));
  }

  try {
    await interviewService.deleteInterviewById(id, userId);
    res.status(200).json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Interview not found') {
      return next(new AppError(error.message, 404));
    }
    if (error.message === 'Not authorized to delete this interview') {
      return next(new AppError(error.message, 403));
    }
    return next(new AppError(error.message, 500));
  }
});
/*
FILE: src/controllers/interview.controller.js
ROLE: HTTP layer for all interview-related endpoints. Reads from req.body, req.params, and req.user, delegates business logic and database operations to interviewService, and sends structured JSON responses. All handlers are wrapped in asyncHandler to forward unexpected errors to the global error middleware. Validation and AppError construction live here; database queries and domain rules live in the service.

FUNCTIONS / LOGIC:
  - createInterview — destructures role, experienceLevel, jobDescription, goal, and maxQuestions from req.body and extracts userId from req.user._id. Returns 401 via AppError if userId is absent. Validates role (required, must be a non-empty string, max 50 characters), experienceLevel (required, must be one of 'junior' | 'mid' | 'senior'), jobDescription (optional, max 500 characters if provided), goal (optional, max 200 characters if provided), and maxQuestions (optional, must be a number between 3 and 10 if provided). Assembles a clean interviewData object using spread conditionals so optional fields are only included when truthy. Calls interviewService.createInterview(interviewData) and returns 201 with { success: true, interview }.
  - getUserInterviews — extracts userId from req.user._id. Returns 401 via AppError if userId is absent. Calls interviewService.getUserInterviews(userId) and returns 200 with { success: true, count: interviews.length, interviews }. An empty array is a valid response and is not treated as an error.
  - deleteInterview — extracts id from req.params and userId from req.user._id. Returns 401 via AppError if userId is absent, 400 if id is missing. Calls interviewService.deleteInterviewById(id, userId) inside a try/catch to intercept known service errors — maps 'Interview not found' to AppError 404 and 'Not authorized to delete this interview' to AppError 403. Any other unexpected error is forwarded as AppError 500. On success returns 200 with { success: true, message: 'Interview deleted successfully' }.

IMPORTED BY:
  - src/routes/interview.routes.js — imports { createInterview, getUserInterviews, deleteInterview } and binds them to POST /, GET /, and DELETE /:id respectively.
*/