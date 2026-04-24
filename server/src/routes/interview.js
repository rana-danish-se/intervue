import express from 'express';
import {
  createInterview,
  getUserInterviews,
  deleteInterview
} from '../controllers/interview.controller.js';
import { protectRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All interview routes require authentication
router.use(protectRoute);

router.post('/', createInterview);
router.get('/', getUserInterviews);
router.delete('/:id', deleteInterview);

export default router;
/*
FILE: src/routes/interview.routes.js
ROLE: Express router for all interview-related HTTP endpoints. Maps URL patterns and HTTP methods to their corresponding controller functions. Applies protectRoute globally via router.use() so every route in this file requires a valid access token. Mounted at /api/interviews in app.js.

ROUTES:
  - POST   /        → createInterview controller (requires auth; creates a new interview for the logged-in user)
  - GET    /        → getUserInterviews controller (requires auth; returns all interviews belonging to the logged-in user sorted by createdAt descending)
  - DELETE /:id     → deleteInterview controller (requires auth; verifies ownership then deletes the interview matching the given id)

IMPORTED BY:
  - src/app.js — imports this router as the default export and mounts it with `app.use('/api/interviews', interviewRoutes)`.
*/