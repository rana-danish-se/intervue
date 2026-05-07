/*
Role: Express app composition root.
What it does: Registers global security/logging/parsing middleware, mounts auth/interview/session routers, and wires not-found + global error handlers.
Where used: Imported by the server bootstrap file that starts HTTP + socket infrastructure.
Why it exists: Keeps transport/runtime wiring centralized and predictable across environments.
*/

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

import './configs/passport.js';

import authRoutes from './routes/auth.js';
import interviewRoutes from './routes/interview.js';
import sessionRoutes from './routes/session.js';

import { notFound, globalErrorHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Bug #7 fix — cors() must come before body parsers so preflight OPTIONS
// requests receive CORS headers without unnecessary body parsing.
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Intervue API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/sessions', sessionRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
