import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

import './configs/passport.js';

import authRoutes from './routes/auth.js';

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Intervue API is running' });
});

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;

/*
FILE: src/app.js
ROLE: Central Express application factory. Registers all global middleware, mounts route groups, and attaches error-handling middleware. The configured `app` instance is exported and consumed by server.js to start the HTTP server.

FUNCTIONS / LOGIC:
  - helmet() middleware — sets secure HTTP response headers to protect against common web vulnerabilities.
  - morgan() middleware — logs HTTP requests; uses 'dev' format in development and 'combined' in production.
  - apiLimiter (rateLimit) — restricts each IP to 100 requests per 15-minute window on all /api/* routes to prevent abuse.
  - express.json() / express.urlencoded() — parses incoming JSON and URL-encoded request bodies and attaches them to req.body.
  - cookieParser() — parses the Cookie header and populates req.cookies for use by auth middleware and controllers.
  - cors() — enables cross-origin requests from the CLIENT_URL (default http://localhost:3000) with credentials (cookies) allowed.
  - passport.initialize() — initialises Passport.js authentication without session support (JWT + cookie strategy used instead).
  - GET '/' handler — health-check endpoint; responds with a JSON confirmation that the API is running.
  - app.use('/api/auth', authRoutes) — mounts all authentication routes (register, login, Google OAuth, etc.) under /api/auth.
  - notFound middleware — catches any unmatched route and forwards a 404 AppError to the global error handler.
  - globalErrorHandler middleware — final error-handling pipe; formats and sends the error response to the client.

IMPORTED BY:
  - server.js — imports the default export `app` and calls app.listen() to start the HTTP server.
*/
