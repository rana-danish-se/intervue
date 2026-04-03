class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

/*
FILE: src/utils/AppError.js
ROLE: Custom operational error class that extends the native Error. Provides a consistent structure for all intentional, application-level errors so the global error handler can distinguish them from unexpected programming errors.

FUNCTIONS / LOGIC:
  - constructor(message, statusCode) — calls super(message) to set the standard Error.message. Sets this.statusCode to the provided HTTP status code. Derives this.status as 'fail' for 4xx codes and 'error' for all others. Sets this.isOperational = true to flag the error as a handled, expected error (used by globalErrorHandler to decide whether to expose the message in production). Calls Error.captureStackTrace to keep the stack trace clean by excluding the AppError constructor itself.

IMPORTED BY:
  - src/middlewares/authMiddleware.js — imports AppError to throw structured 401/403 errors when token validation or plan checks fail.
  - src/middlewares/errorMiddleware.js — imports AppError to create 404 errors inside the notFound handler.
  - src/controllers/auth.controller.js — imports AppError and passes instances to next() to propagate structured errors from all controller handlers.
*/
