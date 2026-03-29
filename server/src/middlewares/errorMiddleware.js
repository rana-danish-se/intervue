import AppError from '../utils/AppError.js';

// Fallback unknown routes
export const notFound = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

// Global Error Handler
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production Mode: Send operational errors, mask programming errors
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
      });
    } else {
      // 1) Log error
      console.error('ERROR 💥:', err);

      // 2) Send generic message
      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};
