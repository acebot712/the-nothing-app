import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, saveUser } from '../config/supabase';

// User storage key constant
const USER_STORAGE_KEY = '@user';
const INVITE_ACCESS_KEY = '@inviteAccess';

// Define the shape of our context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasInviteAccess: boolean;
  setHasInviteAccess: (value: boolean) => void;
  purchaseTier: (tier: 'regular' | 'elite' | 'god', amount: number) => Promise<User | null>;
  logout: () => Promise<boolean>;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasInviteAccess: false,
  setHasInviteAccess: () => {},
  purchaseTier: async () => null,
  logout: async () => false,
  setUser: () => {},
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInviteAccess, setHasInviteAccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Load user data
        const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userJson) {
          setUser(JSON.parse(userJson));
          setIsAuthenticated(true);
        }
        
        // Check invite access
        const inviteAccess = await AsyncStorage.getItem(INVITE_ACCESS_KEY);
        setHasInviteAccess(inviteAccess === 'true');
      } catch (error) {
        console.error('Failed to load user from storage', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user to storage whenever it changes
  useEffect(() => {
    const saveUserToStorage = async () => {
      if (user) {
        try {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch (error) {
          console.error('Failed to save user to storage', error);
        }
      }
    };

    saveUserToStorage();
  }, [user]);

  // Update invite access in storage when state changes
  useEffect(() => {
    const updateInviteAccess = async () => {
      try {
        await AsyncStorage.setItem(INVITE_ACCESS_KEY, hasInviteAccess ? 'true' : 'false');
      } catch (error) {
        console.error('Failed to save invite access to storage', error);
      }
    };
    
    updateInviteAccess();
  }, [hasInviteAccess]);

  // Handle purchasing a tier
  const purchaseTier = async (tier: 'regular' | 'elite' | 'god', amount: number) => {
    if (!user) {
      // Create a temporary user first
      const tempUser = await saveUser({
        username: `User_${Math.floor(Math.random() * 10000)}`,
        tier,
        purchase_amount: amount,
        net_worth: 1000000, // Default net worth
      });
      
      if (tempUser) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(tempUser));
        setUser(tempUser);
        setIsAuthenticated(true);
        return tempUser;
      }
      
      return null;
    }
    
    // Update existing user
    const updatedUser = await saveUser({
      ...user,
      tier,
      purchase_amount: amount,
    });
    
    if (updatedUser) {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    }
    
    return null;
  };
  
  // Logout function
  const logout = async () => {
    try {
      // Clear user data
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      // Also clear invite access
      await AsyncStorage.removeItem(INVITE_ACCESS_KEY);
      
      setUser(null);
      setIsAuthenticated(false);
      setHasInviteAccess(false);
      
      return true;
    } catch {
      // Silently fail but return false
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isLoading,
        hasInviteAccess,
        setHasInviteAccess,
        purchaseTier,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the user context
export const useUser = () => useContext(UserContext); 