import Constants from "expo-constants";
import { EXPO_PUBLIC_API_URL } from "@env";

// API base URL - update this with your backend server URL
// For local development with Expo, you might use something like:
// - http://localhost:3000/api (for web)
// - http://10.0.2.2:3000/api (for Android emulator)
// - http://192.168.x.x:3000/api (your local IP for physical devices)
const API_URL =
  EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://localhost:3000/api";

// Helper for handling API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    // API error
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }

  return data;
};

// API functions

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

/**
 * Login a user by email
 */
export const loginUser = async (email) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`);
  return handleResponse(response);
};

/**
 * Update user information
 */
export const updateUser = async (userId, userData) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  return handleResponse(response);
};

/**
 * Create a payment intent for a tier
 */
export const createPaymentIntent = async (tier, userData) => {
  const response = await fetch(`${API_URL}/payments/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tier,
      userId: userData.id,
      email: userData.email,
      username: userData.username,
    }),
  });

  return handleResponse(response);
};

/**
 * Verify a payment and update user tier
 */
export const verifyPayment = async (paymentIntentId, userId) => {
  const response = await fetch(
    `${API_URL}/payments/verify/${paymentIntentId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    },
  );

  return handleResponse(response);
};

/**
 * Get leaderboard data
 */
export const getLeaderboard = async (limit = 20, page = 1) => {
  const response = await fetch(
    `${API_URL}/leaderboard?limit=${limit}&page=${page}`,
  );
  return handleResponse(response);
};

/**
 * Get a user's leaderboard entry
 */
export const getUserLeaderboardEntry = async (userId) => {
  const response = await fetch(`${API_URL}/leaderboard/user/${userId}`);
  return handleResponse(response);
};

export default {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  createPaymentIntent,
  verifyPayment,
  getLeaderboard,
  getUserLeaderboardEntry,
};
