const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;

/*
FILE: src/utils/asyncHandler.js
ROLE: Higher-order function utility that wraps async Express route handlers to eliminate repetitive try/catch boilerplate. Ensures any unhandled promise rejection inside an async controller is automatically forwarded to the Express global error handler via next().

FUNCTIONS / LOGIC:
  - asyncHandler(fn) — accepts an async Express handler function (fn) as an argument. Returns a new synchronous middleware function (req, res, next) that calls fn(req, res, next) and wraps the result in Promise.resolve().catch(next). If the async handler throws or rejects for any reason, the error is passed directly to next(), which routes it to globalErrorHandler in errorMiddleware.js.

IMPORTED BY:
  - src/controllers/auth.controller.js — imports asyncHandler as the default export and wraps every exported controller function (register, verifyEmail, login, googleCallback, refreshToken, logout, forgotPassword, resetPassword, getMe) with it.
*/
