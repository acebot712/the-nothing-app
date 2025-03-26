const { logger } = require("../utils/logger");

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

// Main error handling middleware
const errorHandler = (err, req, res, _next) => {
  // Check if the error is one of our known API errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: "error",
      message: err.message,
    });
  }

  // Default to 500 server error for unknown errors
  const statusCode =
    process.env.NODE_ENV === "production" ? 500 : err.status || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  // Log the error
  logger.error(`Error: ${err.message}`);

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

module.exports = {
  ApiError,
  errorHandler,
};
