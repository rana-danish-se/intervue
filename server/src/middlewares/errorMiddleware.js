import AppError from '../utils/AppError.js';

export const notFound = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

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
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR 💥:', err);

      res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};

/*
FILE: src/middlewares/errorMiddleware.js
ROLE: Centralised error-handling middleware. Acts as the final layer in the Express middleware pipeline — catches both unmatched routes and all errors forwarded via next(err) from any controller or middleware.

FUNCTIONS / LOGIC:
  - notFound(req, res, next) — matches any request that reaches the end of the router without being handled. Creates a new AppError with the attempted URL and a 404 status code, then passes it to the global error handler via next().
  - globalErrorHandler(err, req, res, next) — Express four-argument error middleware that receives all errors in the pipeline. Normalises err.statusCode (default 500) and err.status. In development mode, responds with the full error object plus stack trace for easy debugging. In production mode, distinguishes between operational errors (instances where err.isOperational is true) — which send a safe, meaningful message to the client — and programming errors (unexpected crashes) — which log the full error server-side and respond with a generic 500 message to avoid leaking implementation details.

IMPORTED BY:
  - src/app.js — imports { notFound, globalErrorHandler } and registers them as the last two middleware in the Express pipeline, after all route definitions.
*/
