const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { logger } = require("./utils/logger");
const { errorHandler } = require("./middleware/errorHandler");
const config = require("./config");
const { initializeDatabase } = require("./utils/supabase");

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const leaderboardRoutes = require("./routes/leaderboard");

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // Enable CORS with configuration
app.use(express.json()); // Parse JSON bodies
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
); // HTTP request logging

// Special case for Stripe webhooks which need the raw body
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: config.env });
});

// Error handling middleware
app.use(errorHandler);

// Database connection check and initialization
const startServer = async () => {
  try {
    // Check database connection and tables
    logger.info("Checking database connection and tables...");
    await initializeDatabase();

    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// Export for testing
module.exports = app;
