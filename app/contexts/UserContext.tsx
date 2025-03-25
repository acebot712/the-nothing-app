import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, saveUser } from '../config/supabase';

// Define the shape of our context
interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasInviteAccess: boolean;
  setHasInviteAccess: (value: boolean) => void;
  purchaseTier: (tier: 'regular' | 'elite' | 'god', amount: number) => Promise<void>;
  logout: () => Promise<boolean>;
  setUser: (user: User | null) => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasInviteAccess: false,
  setHasInviteAccess: () => {},
  purchaseTier: async () => {},
  logout: async () => false,
  setUser: () => {},
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInviteAccess, setHasInviteAccess] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('@user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
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
          await AsyncStorage.setItem('@user', JSON.stringify(user));
        } catch (error) {
          console.error('Failed to save user to storage', error);
        }
      }
    };

    saveUserToStorage();
  }, [user]);

  // Handler for purchasing a tier
  const purchaseTier = async (tier: 'regular' | 'elite' | 'god', amount: number) => {
    try {
      // If there's no user, create a temporary one (this should generally not happen)
      if (!user) {
        console.log('No user exists yet, creating a temporary user first');
        
        // Create temporary user
        const tempUser = {
          username: 'Anonymous User',
          email: `user_${Math.random().toString(36).substring(2, 7)}@example.com`,
          net_worth: 1000000,
          tier,
          purchase_amount: amount,
        };
        
        const newUser = await saveUser(tempUser);
        if (newUser) {
          setUser(newUser);
          return;
        } else {
          throw new Error('Failed to create temporary user');
        }
      }
      
      // Update existing user with new tier and amount
      console.log(`Updating user ${user.id} to ${tier} tier with amount ${amount}`);
      const updatedUser = await saveUser({
        ...user,
        tier,
        purchase_amount: amount,
      });
      
      if (!updatedUser) {
        throw new Error('Failed to update user tier');
      }
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to purchase tier:', error);
      throw error;
    }
  };

  // Handler for logging out
  const logout = async () => {
    try {
      console.log('UserContext: Starting logout process');
      console.log('UserContext: Current user state before logout:', user ? user.id : 'No user');
      
      // Clear user data from storage
      await AsyncStorage.removeItem('@user');
      console.log('UserContext: Removed user from AsyncStorage');
      
      // Reset state
      setUser(null);
      setHasInviteAccess(false);
      
      console.log('UserContext: Logout complete - user state cleared');
      return true;
    } catch (error) {
      console.error('UserContext: Failed to logout', error);
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
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