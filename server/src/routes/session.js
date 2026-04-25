import express from 'express';
import { generateQuestions, createCustomSession, reorderSessions } from '../controllers/session.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protectRoute);

router.post('/', createCustomSession);
router.put('/reorder', reorderSessions);
router.post('/:id/generate-questions', generateQuestions);

export default router;

/*
FILE: src/routes/session.js
ROLE: Express router for session-related endpoints.
IMPORTED BY:
  - src/app.js
*/
