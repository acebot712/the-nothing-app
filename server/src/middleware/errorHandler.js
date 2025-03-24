const { logger } = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, statusCode, data = {}) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Get status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method}`);
  
  if (statusCode === 500) {
    logger.error(err.stack);
  }

  // Send response
  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(err.data && { data: err.data }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  ApiError,
  errorHandler
}; 