#!/usr/bin/env node

/**
 * Test Database Connection
 * ------------------------
 * This script tests the Supabase database connection and reports whether
 * the required tables exist.
 *
 * Usage:
 * 1. Make sure you have Node.js installed
 * 2. Run: node test-database-connection.js
 */

// Import environment variables from .env file
require("dotenv").config();

// Check if Supabase credentials are set
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERROR: Supabase credentials are missing in .env file");
  console.log(
    "Please ensure you have EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file",
  );
  process.exit(1);
}

console.log("🔑 Supabase credentials found");
console.log(`URL: ${supabaseUrl}`);
console.log(`Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);

// Create Supabase client
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the required tables
const requiredTables = ["users", "leaderboard", "invite_codes"];

// Test connection and check tables
async function testConnection() {
  console.log("\n🔄 Testing database connection...");

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Connection failed:", error.message);

      if (error.code === "42P01") {
        console.log(
          "\n📋 The required tables do not exist in your Supabase instance",
        );
        console.log(
          "Please follow the instructions in FIX-DATABASE-CONNECTION.md to create them",
        );
      } else {
        console.log("\n🔍 Further diagnostics:");
        console.log("- Check that your Supabase URL and Anon Key are correct");
        console.log("- Ensure your Supabase project is active and not paused");
        console.log("- Verify that you have proper network connectivity");
      }

      process.exit(1);
    }

    console.log("✅ Database connection successful!");

    // Check each required table
    console.log("\n📊 Checking required tables:");

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count")
          .limit(1);

        if (error) {
          console.error(
            `❌ Table '${table}' is missing or inaccessible:`,
            error.message,
          );
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err.message);
      }
    }

    // Test invite codes
    try {
      const { data, error } = await supabase
        .from("invite_codes")
        .select("*")
        .limit(3);

      if (error) {
        console.error("❌ Could not query invite_codes table:", error.message);
      } else if (!data || data.length === 0) {
        console.log(
          "⚠️ No invite codes found in the database. You should add some.",
        );
      } else {
        console.log(`✅ Found ${data.length} invite code(s) in the database`);
        console.log("Sample codes:", data.map((code) => code.code).join(", "));
      }
    } catch (err) {
      console.error("❌ Error checking invite codes:", err.message);
    }

    console.log("\n🏁 Database test complete!");
  } catch (err) {
    console.error("❌ Unexpected error during testing:", err.message);
    process.exit(1);
  }
}

// Run the test
testConnection();
