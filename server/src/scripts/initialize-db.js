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

const createTables = async () => {
  try {
    logger.info('Starting database initialization');

    // Check for users table
    const { error: usersCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (usersCheckError && usersCheckError.code === '42P01') {
      logger.info('Creating users table...');
      
      // Create users table
      const { error: createUsersError } = await supabaseAdmin.rpc('exec', {
        sql: `
          CREATE TABLE public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            tier TEXT DEFAULT 'basic',
            signupDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            lastLoginDate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            lastPaymentDate TIMESTAMP WITH TIME ZONE,
            paymentInfo JSONB
          );
          
          -- Enable RLS and create policies
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Public users are viewable by everyone"
            ON public.users FOR SELECT
            USING (true);
            
          CREATE POLICY "Users can update own data"
            ON public.users FOR UPDATE
            USING (auth.uid() = id);
        `
      });
      
      if (createUsersError) {
        logger.error(`Error creating users table: ${createUsersError.message}`);
        throw createUsersError;
      }
      
      logger.info('Users table created successfully');
    } else {
      logger.info('Users table already exists');
    }
    
    // Check for leaderboard table
    const { error: leaderboardCheckError } = await supabaseAdmin
      .from('leaderboard')
      .select('id')
      .limit(1);
      
    if (leaderboardCheckError && leaderboardCheckError.code === '42P01') {
      logger.info('Creating leaderboard table...');
      
      // Create leaderboard table
      const { error: createLeaderboardError } = await supabaseAdmin.rpc('exec', {
        sql: `
          CREATE TABLE public.leaderboard (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            userId UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            username TEXT NOT NULL,
            tier TEXT DEFAULT 'basic',
            tierValue INTEGER DEFAULT 0,
            lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(userId)
          );
          
          -- Enable RLS and create policies
          ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Leaderboard is viewable by everyone"
            ON public.leaderboard FOR SELECT
            USING (true);
        `
      });
      
      if (createLeaderboardError) {
        logger.error(`Error creating leaderboard table: ${createLeaderboardError.message}`);
        throw createLeaderboardError;
      }
      
      logger.info('Leaderboard table created successfully');
    } else {
      logger.info('Leaderboard table already exists');
    }
    
    // Create sample data for testing
    logger.info('Creating sample data...');
    
    // Define sample users
    const sampleUsers = [
      { 
        email: 'elon@example.com', 
        username: 'Elon M.', 
        tier: 'nothing'
      },
      { 
        email: 'jeff@example.com', 
        username: 'Jeff B.', 
        tier: 'nothing'
      },
      { 
        email: 'mark@example.com', 
        username: 'Mark Z.', 
        tier: 'premium'
      },
      { 
        email: 'bill@example.com', 
        username: 'Bill G.', 
        tier: 'premium'
      },
      { 
        email: 'warren@example.com', 
        username: 'Warren B.', 
        tier: 'basic'
      }
    ];
    
    // Insert sample users
    for (const user of sampleUsers) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();
        
      if (!existingUser) {
        const { data: newUser, error } = await supabaseAdmin
          .from('users')
          .insert({
            email: user.email,
            username: user.username,
            tier: user.tier,
            signupDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) {
          logger.error(`Error creating sample user ${user.username}: ${error.message}`);
          continue;
        }
        
        // Get tier value for leaderboard
        const tierValues = {
          'basic': 1,
          'premium': 2,
          'nothing': 3
        };
        
        // Add to leaderboard
        await supabaseAdmin
          .from('leaderboard')
          .insert({
            userId: newUser.id,
            username: newUser.username,
            tier: newUser.tier,
            tierValue: tierValues[newUser.tier] || 0
          });
          
        logger.info(`Created sample user ${user.username} with tier ${user.tier}`);
      } else {
        logger.info(`Sample user ${user.username} already exists`);
      }
    }
    
    logger.info('Database initialization completed successfully');
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