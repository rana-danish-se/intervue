import express from 'express';
import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';
import { generateQuestions, createCustomSession, reorderSessions, abandonSession, completeSession } from '../controllers/session.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';
import { evaluateSession } from '../controllers/session.controller.js';

const router = express.Router();

router.use(protectRoute);

router.post('/', createCustomSession);
router.put('/reorder', reorderSessions);
router.post('/:id/generate-questions', generateQuestions);
router.patch('/:id/abandon', abandonSession);
router.post('/:id/complete', completeSession);
// Lightweight session fetch for client live view (questions + basic metadata)
import Session from '../models/Session.model.js';
import Interview from '../models/Interview.model.js';

router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;
  console.log('[GET /sessions/:id] id:', id, 'userId:', userId);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError('Invalid session ID format', 400));
  }
  try {
    const session = await Session.findById(id);
    console.log('[GET /sessions/:id] session found:', session ? 'yes' : 'no');
    if (!session) return next(new AppError('Session not found', 404));
    const interview = await Interview.findById(session.interviewId);
    console.log('[GET /sessions/:id] interview found:', interview ? 'yes' : 'no');
    if (!interview) return next(new AppError('Associated interview not found', 404));
    if (interview.userId.toString() !== userId.toString()) {
      console.log('[GET /sessions/:id] unauthorized - interview.userId:', interview.userId, '!= userId:', userId);
      return next(new AppError('Not authorized', 403));
    }
    res.status(200).json({ 
      id: session._id, 
      title: session.title, 
      status: session.status,
      focus: session.focus || 'General Expertise',
      order: session.order,
      sessionCount: interview.sessionCount,
      role: interview.role,
      questions: (session.questions || []).map(q => ({ id: q._id, text: q.questionText })) 
    });
  } catch (err) {
    console.error('[GET /sessions/:id] error:', err);
    next(err);
  }
});
router.post('/:id/evaluate', evaluateSession);

export default router;

/*
FILE: src/routes/session.js
ROLE: Express router for session-related endpoints.
IMPORTED BY:
  - src/app.js
*/
