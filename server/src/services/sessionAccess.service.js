import mongoose from "mongoose";
import Session from "../models/Session.model.js";
import Interview from "../models/Interview.model.js";
import AppError from "../utils/AppError.js";

/*
Role: Shared authorization/access loader for session domain.
What it does: Validates session ID format, loads session + parent interview, and enforces interview ownership for the current user.
Why it exists: Removes repeated auth checks from routes/controllers and guarantees consistent 400/403/404 semantics.
*/

export const getAuthorizedSessionAndInterview = async (sessionId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw new AppError("Invalid session ID format", 400);
  }

  const session = await Session.findById(sessionId);
  if (!session) throw new AppError("Session not found", 404);

  const interview = await Interview.findById(session.interviewId);
  if (!interview) throw new AppError("Associated interview not found", 404);

  if (interview.userId.toString() !== userId.toString()) {
    throw new AppError("Not authorized", 403);
  }

  return { session, interview };
};
