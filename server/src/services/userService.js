const { supabaseAdmin } = require('../utils/supabase');
const { logger } = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Retrieve a user by their user ID
 */
const getUserById = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      logger.error(`Error retrieving user by ID ${userId}: ${error.message}`);
      throw new ApiError(error.message, 404);
    }
    
    if (!data) {
      logger.warn(`User not found with ID: ${userId}`);
      throw new ApiError('User not found', 404);
    }
    
    return { user: data };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Unexpected error retrieving user by ID ${userId}: ${error.message}`);
    throw new ApiError('Error retrieving user', 500);
  }
};

/**
 * Create a new user
 */
const createUser = async (userData) => {
  try {
    // Validate required fields
    const requiredFields = ['email', 'username'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new ApiError(`Missing required field: ${field}`, 400);
      }
    }
    
    // Check if user already exists
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .or(`email.eq.${userData.email},username.eq.${userData.username}`)
      .limit(1);
    
    if (existingError) {
      logger.error(`Error checking for existing user: ${existingError.message}`);
      throw new ApiError('Error checking for existing user', 500);
    }
    
    if (existingUser && existingUser.length > 0) {
      const field = existingUser[0].email === userData.email ? 'email' : 'username';
      throw new ApiError(`User with this ${field} already exists`, 409);
    }
    
    // Create new user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email: userData.email,
        username: userData.username,
        tier: userData.tier || 'basic',
        signupDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      logger.error(`Error creating user: ${error.message}`);
      throw new ApiError(`Error creating user: ${error.message}`, 500);
    }
    
    logger.info(`New user created: ${data.id}`);
    return { user: data };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Unexpected error creating user: ${error.message}`);
    throw new ApiError('Error creating user', 500);
  }
};

/**
 * Update user information
 */
const updateUser = async (userId, userData) => {
  try {
    // First, check if user exists
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (existingError || !existingUser) {
      logger.warn(`User not found for update with ID: ${userId}`);
      throw new ApiError('User not found', 404);
    }
    
    // Remove any fields that should not be updated directly
    const safeUserData = { ...userData };
    const restrictedFields = ['id', 'email', 'signupDate'];
    restrictedFields.forEach(field => delete safeUserData[field]);
    
    // Add update timestamp
    safeUserData.updatedAt = new Date().toISOString();
    
    // Update the user
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(safeUserData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error updating user ${userId}: ${error.message}`);
      throw new ApiError(`Error updating user: ${error.message}`, 500);
    }
    
    logger.info(`User updated: ${userId}`);
    return { user: data };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Unexpected error updating user ${userId}: ${error.message}`);
    throw new ApiError('Error updating user', 500);
  }
};

/**
 * Update user tier after successful payment
 */
const updateUserTier = async (userId, tierInfo) => {
  try {
    // Check that required fields are present
    if (!tierInfo.tier) {
      throw new ApiError('Missing tier information', 400);
    }
    
    // Prepare update data
    const updateData = {
      tier: tierInfo.tier,
      updatedAt: new Date().toISOString(),
      lastPaymentDate: new Date().toISOString(),
      paymentInfo: {
        amount: tierInfo.amount || 0,
        currency: tierInfo.currency || 'usd',
        paymentId: tierInfo.paymentId,
        timestamp: new Date().toISOString()
      }
    };
    
    // Update the user's tier
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error updating user tier for ${userId}: ${error.message}`);
      throw new ApiError(`Error updating user tier: ${error.message}`, 500);
    }
    
    logger.info(`User tier updated to ${tierInfo.tier} for user ${userId}`);
    
    // Update leaderboard entry if it exists, or create one if it doesn't
    await updateLeaderboardForUser(userId, data);
    
    return { user: data };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Unexpected error updating user tier ${userId}: ${error.message}`);
    throw new ApiError('Error updating user tier', 500);
  }
};

/**
 * Update or create leaderboard entry for user
 */
const updateLeaderboardForUser = async (userId, userData) => {
  try {
    // Get tier value for ranking
    const tierValues = {
      'basic': 1,
      'premium': 2,
      'nothing': 3
    };
    
    const tierValue = tierValues[userData.tier] || 0;
    
    // Check if user already has a leaderboard entry
    const { data: existingEntry, error: checkError } = await supabaseAdmin
      .from('leaderboard')
      .select('id')
      .eq('userId', userId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found, which is fine
      logger.error(`Error checking leaderboard for user ${userId}: ${checkError.message}`);
      throw new ApiError(`Error updating leaderboard: ${checkError.message}`, 500);
    }
    
    let result;
    
    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabaseAdmin
        .from('leaderboard')
        .update({
          username: userData.username,
          tier: userData.tier,
          tierValue: tierValue,
          lastUpdated: new Date().toISOString()
        })
        .eq('userId', userId)
        .select()
        .single();
      
      if (error) {
        logger.error(`Error updating leaderboard for user ${userId}: ${error.message}`);
        throw new ApiError(`Error updating leaderboard: ${error.message}`, 500);
      }
      
      result = data;
      logger.info(`Updated leaderboard entry for user ${userId}`);
    } else {
      // Create new entry
      const { data, error } = await supabaseAdmin
        .from('leaderboard')
        .insert([{
          userId: userId,
          username: userData.username,
          tier: userData.tier,
          tierValue: tierValue,
          lastUpdated: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        logger.error(`Error creating leaderboard entry for user ${userId}: ${error.message}`);
        throw new ApiError(`Error creating leaderboard entry: ${error.message}`, 500);
      }
      
      result = data;
      logger.info(`Created new leaderboard entry for user ${userId}`);
    }
    
    return { leaderboard: result };
  } catch (error) {
    // Log but don't throw - this is a secondary operation
    logger.error(`Error with leaderboard update for user ${userId}: ${error.message}`);
    return { error: error.message };
  }
};

/**
 * Get leaderboard with optional pagination
 */
const getLeaderboard = async (limit = 20, page = 1) => {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get leaderboard entries sorted by tier value (descending)
    const { data, error, count } = await supabaseAdmin
      .from('leaderboard')
      .select('*, users!inner(email)', { count: 'exact' })
      .order('tierValue', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      logger.error(`Error retrieving leaderboard: ${error.message}`);
      throw new ApiError(`Error retrieving leaderboard: ${error.message}`, 500);
    }
    
    // Format the response to include pagination info
    return {
      leaderboard: data.map(entry => ({
        id: entry.id,
        userId: entry.userId,
        username: entry.username,
        tier: entry.tier,
        lastUpdated: entry.lastUpdated,
        email: entry.users.email
      })),
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Unexpected error retrieving leaderboard: ${error.message}`);
    throw new ApiError('Error retrieving leaderboard', 500);
  }
};

module.exports = {
  getUserById,
  createUser,
  updateUser,
  updateUserTier,
  updateLeaderboardForUser,
  getLeaderboard
}; 