import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase, saveUser } from './supabase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize WebBrowser for authentication flow
WebBrowser.maybeCompleteAuthSession();

// Google auth configuration
const googleConfig = {
  clientId: Platform.select({
    ios: 'YOUR_IOS_GOOGLE_CLIENT_ID', // Replace with your iOS client ID from Google Cloud Console
    android: 'YOUR_ANDROID_GOOGLE_CLIENT_ID', // Replace with your Android client ID from Google Cloud Console
    web: 'YOUR_WEB_GOOGLE_CLIENT_ID', // Replace with your Web client ID from Google Cloud Console
  }),
  redirectUri: makeRedirectUri({
    scheme: 'com.thenothingapp',
    path: 'google-auth',
  }),
};

// Apple auth configuration
const appleConfig = {
  clientId: 'com.thenothingapp', // Your bundle ID
  redirectUri: makeRedirectUri({
    scheme: 'com.thenothingapp',
    path: 'apple-auth',
  }),
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<boolean> => {
  try {
    // Create a Google auth request
    const request = new AuthSession.AuthRequest({
      clientId: googleConfig.clientId as string,
      redirectUri: googleConfig.redirectUri,
      responseType: 'id_token',
      scopes: ['openid', 'profile', 'email'],
    });

    // Start auth flow using Google discovery
    const response = await request.promptAsync({
      // Use the Google authentication endpoint
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (response.type === 'success') {
      // Get user info from ID token
      const { id_token } = response.params;
      const userInfo = await getGoogleUserInfo(id_token);

      // Sign in to Supabase with Google
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        return false;
      }

      // Create or update user in our database
      const user = await saveUser({
        id: data.user?.id || `google_${userInfo.sub}`,
        email: userInfo.email,
        username: userInfo.name,
        net_worth: 1000000, // Default net worth
        tier: 'regular',
        purchase_amount: 0,
      });

      // Store session
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error during Google sign in:', error);
    return false;
  }
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async (): Promise<boolean> => {
  try {
    // Create an Apple auth request
    const request = new AuthSession.AuthRequest({
      clientId: appleConfig.clientId,
      redirectUri: appleConfig.redirectUri,
      responseType: 'id_token',
      scopes: ['name', 'email'],
    });

    // Start auth flow using Apple discovery
    const response = await request.promptAsync({
      // Use the Apple authentication endpoint
      authorizationEndpoint: 'https://appleid.apple.com/auth/authorize',
    });

    if (response.type === 'success') {
      const { id_token, user: appleUser } = response.params;

      // Sign in to Supabase with Apple
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: id_token,
      });

      if (error) {
        console.error('Error signing in with Apple:', error);
        return false;
      }

      // Parse Apple user data
      let username = 'Apple User'; // Default
      if (appleUser) {
        const parsedUser = JSON.parse(appleUser);
        if (parsedUser.name) {
          username = `${parsedUser.name.firstName} ${parsedUser.name.lastName}`;
        }
      }

      // Create or update user in our database
      const user = await saveUser({
        id: data.user?.id || `apple_${Date.now()}`,
        email: data.user?.email || `apple_user_${Date.now()}@example.com`,
        username,
        net_worth: 1000000, // Default net worth
        tier: 'regular',
        purchase_amount: 0,
      });

      // Store session
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error during Apple sign in:', error);
    return false;
  }
};

/**
 * Helper function to get Google user info from ID token
 */
const getGoogleUserInfo = async (idToken: string) => {
  try {
    // Decode ID token to get user info
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get Google user info');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting Google user info:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<boolean> => {
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    
    // Clear local storage
    await AsyncStorage.removeItem('@user');
    return true;
  } catch (error) {
    console.error('Error during sign out:', error);
    return false;
  }
}; 