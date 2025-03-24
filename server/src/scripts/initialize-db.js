#!/usr/bin/env node

/**
 * Database initialization script
 * 
 * This script can be run manually to create the necessary tables in Supabase
 * Usage: node initialize-db.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { supabaseAdmin } = require('../utils/supabase');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const createTables = async () => {
  try {
    logger.info('Starting database initialization');

    // STEP 1: Check if SQL file exists
    const sqlFilePath = path.resolve(__dirname, '../../../supabase-setup.sql');
    
    if (fs.existsSync(sqlFilePath)) {
      logger.info(`Found SQL setup file at ${sqlFilePath}`);
      
      // Let's have the user execute this file through the Supabase dashboard
      logger.info('SQL file found but must be executed manually in the Supabase dashboard.');
      logger.info('Please copy the contents of supabase-setup.sql and execute it in the SQL Editor in your Supabase dashboard.');
    }

    // STEP 2: Check if tables exist
    logger.info('Checking if tables exist...');
    
    let usersTableExists = false;
    let leaderboardTableExists = false;
    
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1);
      
      if (!error) {
        usersTableExists = true;
        logger.info('Users table exists');
      } else {
        logger.warn(`Users table does not exist: ${error.message}`);
      }
    } catch (e) {
      logger.warn(`Error checking users table: ${e.message}`);
    }
    
    try {
      const { data, error } = await supabaseAdmin
        .from('leaderboard')
        .select('id')
        .limit(1);
      
      if (!error) {
        leaderboardTableExists = true;
        logger.info('Leaderboard table exists');
      } else {
        logger.warn(`Leaderboard table does not exist: ${error.message}`);
      }
    } catch (e) {
      logger.warn(`Error checking leaderboard table: ${e.message}`);
    }
    
    if (!usersTableExists || !leaderboardTableExists) {
      logger.warn('Some tables are missing. Please create them using the supabase-setup.sql file.');
      logger.warn('Copy the SQL from the file and execute it in the Supabase dashboard SQL Editor.');
      return;
    }

    // STEP 3: Insert sample users
    logger.info('Creating sample users...');
    
    // Insert sample users and collect their IDs for leaderboard creation
    const userMap = {};
    
    // First check if users already exist
    const { data: existingUsers, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id, email, username')
      .in('email', [
        'elon@example.com', 
        'jeff@example.com', 
        'mark@example.com', 
        'bill@example.com', 
        'warren@example.com'
      ]);
      
    if (userCheckError) {
      logger.error(`Error checking existing users: ${userCheckError.message}`);
    } else if (existingUsers && existingUsers.length > 0) {
      logger.info(`Found ${existingUsers.length} existing users. Using them for leaderboard.`);
      
      // Map existing users by username for leaderboard creation
      existingUsers.forEach(user => {
        userMap[user.username] = user.id;
      });
    } else {
      // Create sample user data
      const sampleUsers = [
        { 
          id: uuidv4(),
          email: 'elon@example.com', 
          username: 'Elon M.', 
          net_worth: 1000000000,
          tier: 'god',
          purchase_amount: 99999,
          serial_number: 'GOD-001'
        },
        { 
          id: uuidv4(),
          email: 'jeff@example.com', 
          username: 'Jeff B.',
          net_worth: 950000000, 
          tier: 'god',
          purchase_amount: 99999,
          serial_number: 'GOD-002'
        },
        { 
          id: uuidv4(),
          email: 'mark@example.com', 
          username: 'Mark Z.',
          net_worth: 500000000,
          tier: 'elite',
          purchase_amount: 9999,
          serial_number: 'ELITE-001'
        },
        { 
          id: uuidv4(),
          email: 'bill@example.com', 
          username: 'Bill G.',
          net_worth: 450000000,
          tier: 'elite',
          purchase_amount: 9999,
          serial_number: 'ELITE-002'
        },
        { 
          id: uuidv4(),
          email: 'warren@example.com', 
          username: 'Warren B.',
          net_worth: 300000000,
          tier: 'regular',
          purchase_amount: 999,
          serial_number: 'REG-001'
        }
      ];
      
      // Insert users and map them for leaderboard
      for (const user of sampleUsers) {
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert([user])
          .select();
        
        if (insertError) {
          logger.error(`Error inserting user ${user.username}: ${insertError.message}`);
        } else if (newUser && newUser.length > 0) {
          logger.info(`Created user ${user.username}`);
          userMap[user.username] = user.id;
        }
      }
    }
    
    // STEP 4: Check and insert leaderboard data
    logger.info('Checking leaderboard data...');
    
    const { data: leaderboardData, error: leaderboardError } = await supabaseAdmin
      .from('leaderboard')
      .select('id')
      .limit(1);
    
    if (leaderboardError) {
      logger.error(`Error checking leaderboard: ${leaderboardError.message}`);
    } else if (leaderboardData && leaderboardData.length > 0) {
      logger.info('Leaderboard already has data, skipping insertion');
    } else if (Object.keys(userMap).length === 0) {
      logger.warn('No user IDs available to create leaderboard entries');
    } else {
      logger.info('Adding sample data to leaderboard...');
      
      // Create leaderboard entries using the user IDs
      const leaderboardSamples = [];
      
      // Check if we have the required users
      if (userMap['Elon M.']) {
        leaderboardSamples.push({
          id: userMap['Elon M.'],
          username: 'Elon M.',
          purchase_amount: 99999,
          tier: 'god'
        });
      }
      
      if (userMap['Jeff B.']) {
        leaderboardSamples.push({
          id: userMap['Jeff B.'],
          username: 'Jeff B.',
          purchase_amount: 99999,
          tier: 'god'
        });
      }
      
      if (userMap['Mark Z.']) {
        leaderboardSamples.push({
          id: userMap['Mark Z.'],
          username: 'Mark Z.',
          purchase_amount: 9999,
          tier: 'elite'
        });
      }
      
      if (userMap['Bill G.']) {
        leaderboardSamples.push({
          id: userMap['Bill G.'],
          username: 'Bill G.',
          purchase_amount: 9999,
          tier: 'elite'
        });
      }
      
      if (userMap['Warren B.']) {
        leaderboardSamples.push({
          id: userMap['Warren B.'],
          username: 'Warren B.',
          purchase_amount: 999,
          tier: 'regular'
        });
      }
      
      if (leaderboardSamples.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from('leaderboard')
          .insert(leaderboardSamples);
        
        if (insertError) {
          logger.error(`Error inserting leaderboard data: ${insertError.message}`);
        } else {
          logger.info(`Added ${leaderboardSamples.length} entries to the leaderboard`);
        }
      } else {
        logger.warn('No leaderboard samples could be created from available users');
      }
    }
    
    logger.info('Database initialization completed');
  } catch (error) {
    logger.error(`Database initialization failed: ${error.message}`);
    process.exit(1);
  }
};

createTables()
  .then(() => {
    logger.info('Script completed');
    process.exit(0);
  })
  .catch(error => {
    logger.error(`Script error: ${error.message}`);
    process.exit(1);
  }); 