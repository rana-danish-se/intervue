import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';

// Passport Strategy Config
import './configs/passport.js';

// Routes
import authRoutes from './routes/auth.js';

// Error Handling
import { notFound, globalErrorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// ─── Core Middleware ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
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
