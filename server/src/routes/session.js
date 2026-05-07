/*
Role: Route wiring for authenticated session APIs.
What it does: Applies auth/multipart middleware and maps HTTP endpoints to session/speech controllers.
Where used: Mounted under `/api/sessions` from `app.js`.
Why it exists: Maintains a thin transport boundary so business rules stay in controllers/services.
*/

import express from 'express';
import { generateQuestions, createCustomSession, reorderSessions, abandonSession, completeSession, getSessionById } from '../controllers/session.controller.js';
import { transcribeAudioController } from '../controllers/speech.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';
import { evaluateSession } from '../controllers/session.controller.js';
import { getSessionReport } from '../controllers/session.controller.js';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

const router = express.Router();

router.use(protectRoute);

router.post('/', createCustomSession);
router.put('/reorder', reorderSessions);
router.post('/transcribe', upload.single('audio'), transcribeAudioController);
router.post('/:id/generate-questions', generateQuestions);
router.patch('/:id/abandon', abandonSession);
router.post('/:id/complete', completeSession);
router.get('/:id/report', getSessionReport);
router.get('/:id', getSessionById);
router.post('/:id/evaluate', evaluateSession);

export default router;

