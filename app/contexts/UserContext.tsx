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
  logout: () => Promise<void>;
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
  logout: async () => {},
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
    if (!user) return;
    
    try {
      // In a real app, this would call a payment processor and then update Supabase
      const updatedUser = await saveUser({
        ...user,
        tier,
        purchase_amount: amount,
      });
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to purchase tier', error);
      throw error;
    }
  };

  // Handler for logging out
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      setUser(null);
      setHasInviteAccess(false);
    } catch (error) {
      console.error('Failed to logout', error);
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