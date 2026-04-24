import Interview from '../models/Interview.model.js';

export const createInterview = async (interviewData) => {
  const interview = await Interview.create(interviewData);
  return interview;
};

export const getUserInterviews = async (userId) => {
  const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
  return interviews;
};

export const deleteInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }
  if (interview.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this interview');
  }
  await interview.deleteOne();
  return true;
};
/*
FILE: src/services/interview.service.js
ROLE: Business logic layer for all interview operations. Isolates database queries and domain rules from the HTTP controller layer. All functions are pure async operations that either return data or throw descriptive Errors caught by the controller.

FUNCTIONS / LOGIC:
  - createInterview(interviewData) — receives the fully validated interview object from the controller (userId, title, company, jobRole, description already attached). Calls Interview.create(interviewData) to persist the document. Returns the created interview document.
  - getUserInterviews(userId) — queries Interview.find({ userId }) to fetch all interviews belonging to the authenticated user. Chains .sort({ createdAt: -1 }) to return the most recently created interviews first. Returns an array of interview documents (empty array if none exist — not treated as an error).
  - deleteInterviewById(interviewId, userId) — queries Interview.findById(interviewId) to locate the target document. Throws 'Interview not found' if no document exists with that id. Compares interview.userId.toString() against the provided userId.toString() to enforce ownership — throws 'Not authorized to delete this interview' if they do not match. Calls interview.deleteOne() on the document instance to remove it. Returns true as a success signal to the controller.

IMPORTED BY:
  - src/controllers/interview.controller.js — imports all named exports via `import * as interviewService` and calls them within each controller handler.
*/