import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

// Passport Strategy Config
import './configs/passport.js';

// Routes
import authRoutes from './routes/auth.js';

// Error Handling
import { notFound, globalErrorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// ─── Core Middleware ─────────────────────────────────────────
// 1. Security Headers
app.use(helmet());

// 2. Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 3. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);

// 4. Body Parsers & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// 5. Authentication
app.use(passport.initialize());

// ─── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Intervue API is running' });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Error Handling Pipe ─────────────────────────────────────
app.use(notFound);
app.use(globalErrorHandler);

export default app;
