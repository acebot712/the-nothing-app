const express = require('express');
const { ApiError } = require('../middleware/errorHandler');
const userService = require('../services/userService');
const { logger } = require('../utils/logger');
const { supabaseAdmin } = require('../utils/supabase');
const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, username } = req.body;
    
    if (!email || !username) {
      throw new ApiError('Email and username are required', 400);
    }
    
    // Create user in our database
    const { user } = await userService.createUser({
      email,
      username,
      tier: 'basic' // Default tier for new users
    });
    
    logger.info(`New user registered: ${user.id}`);
    
    res.status(201).json({
      status: 'success',
      data: {
        userId: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login a user by email (simplified auth for demo)
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError('Email is required', 400);
    }
    
    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      throw new ApiError('User not found', 404);
    }
    
    // Update last login date
    await supabaseAdmin
      .from('users')
      .update({ lastLoginDate: new Date().toISOString() })
      .eq('id', user.id);
    
    logger.info(`User logged in: ${user.id}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        userId: user.id,
        email: user.email,
        username: user.username,
        tier: user.tier
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 