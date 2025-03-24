const express = require('express');
const { ApiError } = require('../middleware/errorHandler');
const userService = require('../services/userService');
const router = express.Router();

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 */
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }
    
    const { user } = await userService.getUserById(userId);
    
    // Remove sensitive information if needed
    delete user.paymentInfo;
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user information
 */
router.put('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const userData = req.body;
    
    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }
    
    const { user } = await userService.updateUser(userId, userData);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:userId/tier
 * @desc    Update user tier (usually after payment)
 */
router.put('/:userId/tier', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { tier, paymentId, amount, currency } = req.body;
    
    if (!userId || !tier) {
      throw new ApiError('User ID and tier information are required', 400);
    }
    
    const { user } = await userService.updateUserTier(userId, {
      tier,
      paymentId,
      amount,
      currency
    });
    
    res.status(200).json({
      status: 'success',
      data: { 
        user,
        tier: user.tier
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 