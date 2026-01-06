const config = require('../config/config');

/**
 * Global error handling middleware
 * Handles all errors that occur in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      statusCode: 400,
      message: 'Validation Error',
      details: message
    };
  }

  // CastError (invalid ObjectId for MongoDB, or invalid data type)
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID';
    error = {
      statusCode: 400,
      message
    };
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      statusCode: 400,
      message
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      statusCode: 401,
      message
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      statusCode: 401,
      message
    };
  }

  // Custom application errors
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    error: message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
    ...(error.details && { details: error.details })
  };

  res.status(statusCode).json(response);
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 * Catches async errors and passes them to the error handler
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found error handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  AppError,
  asyncHandler,
  notFound
};
