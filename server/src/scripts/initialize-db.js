#!/usr/bin/env node

/**
 * Database initialization script
 *
 * This script can be run manually to create the necessary tables in Supabase
 * Usage: node initialize-db.js
 */

require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const { supabaseAdmin } = require("../utils/supabase");
const { logger } = require("../utils/logger");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const createTables = async () => {
  try {
    logger.info("Starting database initialization");

    // STEP 1: Check if SQL file exists
    const sqlFilePath = path.resolve(__dirname, "../../../supabase-setup.sql");

    if (fs.existsSync(sqlFilePath)) {
      logger.info(`Found SQL setup file at ${sqlFilePath}`);

      // Let's have the user execute this file through the Supabase dashboard
      logger.info(
        "SQL file found but must be executed manually in the Supabase dashboard.",
      );
      logger.info(
        "Please copy the contents of supabase-setup.sql and execute it in the SQL Editor in your Supabase dashboard.",
      );
    }

    // STEP 2: Check if tables exist
    logger.info("Checking if tables exist...");

    let usersTableExists = false;
    let leaderboardTableExists = false;

    try {
      const { error } = await supabaseAdmin.from("users").select("id").limit(1);

      if (!error) {
        usersTableExists = true;
        logger.info("Users table exists");
      } else {
        logger.warn(`Users table does not exist: ${error.message}`);
      }
    } catch (e) {
      logger.warn(`Error checking users table: ${e.message}`);
    }

    try {
      const { error } = await supabaseAdmin
        .from("leaderboard")
        .select("id")
        .limit(1);

      if (!error) {
        leaderboardTableExists = true;
        logger.info("Leaderboard table exists");
      } else {
        logger.warn(`Leaderboard table does not exist: ${error.message}`);
      }
    } catch (e) {
      logger.warn(`Error checking leaderboard table: ${e.message}`);
    }

    if (!usersTableExists || !leaderboardTableExists) {
      logger.warn(
        "Some tables are missing. Please create them using the supabase-setup.sql file.",
      );
      logger.warn(
        "Copy the SQL from the file and execute it in the Supabase dashboard SQL Editor.",
      );
      return;
    }

    // STEP 3: Check and create sample users (only for empty database)
    logger.info("Checking if users exist...");

    const { data: userData, error: userCheckError } = await supabaseAdmin
      .from("users")
      .select("id")
      .limit(1);

    if (userCheckError) {
      logger.error(`Error checking users: ${userCheckError.message}`);
    }

    // Create a map to store user IDs for leaderboard references
    const userMap = {};

    // STEP 4: Check leaderboard data
    logger.info("Checking leaderboard data...");

    const { data: leaderboardData, error: leaderboardError } =
      await supabaseAdmin.from("leaderboard").select("id").limit(1);

    if (leaderboardError) {
      logger.error(`Error checking leaderboard: ${leaderboardError.message}`);
    }

    logger.info("Database initialization completed");
    return true;
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
    throw error;
  }
};

// Only export what is used
module.exports = {
  initializeDatabase: createTables,
  createTables,
};
