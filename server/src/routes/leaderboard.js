const express = require('express');
const { ApiError } = require('../middleware/errorHandler');
const userService = require('../services/userService');
const router = express.Router();

/**
 * @route   GET /api/leaderboard
 * @desc    Get the leaderboard with optional pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    
    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new ApiError('Limit must be between 1 and 100', 400);
    }
    
    if (page < 1) {
      throw new ApiError('Page must be a positive number', 400);
    }
    
    const leaderboardData = await userService.getLeaderboard(limit, page);
    
    res.status(200).json({
      status: 'success',
      data: leaderboardData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/leaderboard/user/:userId
 * @desc    Get a specific user's leaderboard entry
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }
    
    // Get user from database
    const { user } = await userService.getUserById(userId);
    
    // Check if user has a leaderboard entry
    const { data, error } = await userService.updateLeaderboardForUser(userId, user);
    
    if (error) {
      throw new ApiError(`Error retrieving leaderboard entry: ${error}`, 500);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        leaderboard: data.leaderboard,
        user: {
          id: user.id,
          username: user.username,
          tier: user.tier
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 