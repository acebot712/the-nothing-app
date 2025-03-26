import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, saveUser, getUserById } from "../config/supabase";

// User storage key constant
const USER_STORAGE_KEY = "@user";
const INVITE_ACCESS_KEY = "@inviteAccess";

// Define the shape of our context
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasInviteAccess: boolean;
  setHasInviteAccess: (value: boolean) => void;
  purchaseTier: (
    tier: "regular" | "elite" | "god",
    amount: number,
  ) => Promise<User | null>;
  logout: () => Promise<boolean>;
  refreshUserData: () => Promise<boolean>;
  clearUserData: () => Promise<void>;
}

// Error handling helper
const handleAsyncError = (operation: string, error: unknown) => {
  if (error instanceof Error) {
    // Log to an error reporting service in production
    console.error(`Error during ${operation}:`, error.message);
  } else {
    console.error(`Unknown error during ${operation}`);
  }
};

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
  refreshUserData: async () => false,
  clearUserData: async () => {},
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInviteAccess, setHasInviteAccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Clear user data - factored out for reuse
  const clearUserData = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([USER_STORAGE_KEY, INVITE_ACCESS_KEY]);
    } catch (error) {
      handleAsyncError("clearing user data", error);
    }
  }, []);

  // Load user from storage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Load user data
        const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (userJson) {
          const parsedUser = JSON.parse(userJson) as User;
          setUser(parsedUser);
          setIsAuthenticated(true);
        }

        // Check invite access
        const inviteAccess = await AsyncStorage.getItem(INVITE_ACCESS_KEY);
        setHasInviteAccess(inviteAccess === "true");
      } catch (error) {
        handleAsyncError("loading user from storage", error);
        // Reset state on error
        setUser(null);
        setIsAuthenticated(false);
        setHasInviteAccess(false);
        await clearUserData();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [clearUserData]);

  // Save user to storage whenever it changes
  useEffect(() => {
    const saveUserToStorage = async () => {
      if (user) {
        try {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } catch (error) {
          handleAsyncError("saving user to storage", error);
        }
      }
    };

    saveUserToStorage();
  }, [user]);

  // Update invite access in storage when state changes
  useEffect(() => {
    const updateInviteAccess = async () => {
      try {
        await AsyncStorage.setItem(
          INVITE_ACCESS_KEY,
          hasInviteAccess ? "true" : "false",
        );
      } catch (error) {
        handleAsyncError("saving invite access to storage", error);
      }
    };

    updateInviteAccess();
  }, [hasInviteAccess]);

  // Refresh user data from the server
  const refreshUserData = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      setIsLoading(true);
      const updatedUser = await getUserById(user.id);

      if (updatedUser) {
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(updatedUser),
        );
        setUser(updatedUser);
        return true;
      }

      return false;
    } catch (error) {
      handleAsyncError("refreshing user data", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Handle purchasing a tier
  const purchaseTier = async (
    tier: "regular" | "elite" | "god",
    amount: number,
  ): Promise<User | null> => {
    try {
      setIsLoading(true);

      if (!user) {
        // Create a temporary user first
        const tempUser = await saveUser({
          username: `User_${Math.floor(Math.random() * 10000)}`,
          tier,
          purchase_amount: amount,
          net_worth: 1000000, // Default net worth
        });

        if (tempUser) {
          await AsyncStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(tempUser),
          );
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
        await AsyncStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(updatedUser),
        );
        setUser(updatedUser);
        return updatedUser;
      }

      return null;
    } catch (error) {
      handleAsyncError("purchasing tier", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      await clearUserData();

      setUser(null);
      setIsAuthenticated(false);
      setHasInviteAccess(false);

      return true;
    } catch (error) {
      handleAsyncError("logging out", error);
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
        refreshUserData,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the user context
export const useUser = () => useContext(UserContext);
