import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import FlexBadge from "./app/components/FlexBadge";
import { haptics } from "./app/utils/animations";
import {
  signInWithOAuth,
  signOut,
  getCurrentUser,
  fetchOrCreateUserProfile,
  setupAuthListener,
} from "./utils/supabase";
import * as Linking from "expo-linking";

// Keep the splash screen visible while we initialize the app
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore errors */
});

// Simplified colors
const COLORS = {
  DARK: "#0A0A0A",
  DARKER: "#000000",
  GOLD: "#D4AF37",
  WHITE: "#FFFFFF",
  GOOGLE: "#DB4437",
  GITHUB: "#24292e",
  APPLE: "#000000",
};

// Define User type
interface User {
  id: string;
  username: string;
  tier: "regular" | "elite" | "god";
  purchase_amount: number;
  serial_number: string;
  created_at: string;
  email?: string;
  avatar_url?: string;
}

// Root component
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle deep links for auth
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      // Handle auth callback URLs
      if (event.url.includes("auth/callback")) {
        // Supabase auth will handle this automatically
      }
    };

    // Add event listener for deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);

    // Get the initial URL
    Linking.getInitialURL().then((url: string | null) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Initialize app and setup auth listener
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set up auth state listener
        const subscription = setupAuthListener(async (session) => {
          if (session?.user) {
            // Fetch or create user profile
            const userProfile = await fetchOrCreateUserProfile(session.user);
            setUser(userProfile);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        });

        // Check initial auth state
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Fetch or create user profile
          const userProfile = await fetchOrCreateUserProfile(currentUser);
          setUser(userProfile);
          setIsAuthenticated(true);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing app:", error);
        Alert.alert("Error", "Failed to initialize the app. Please try again.");
      } finally {
        setIsLoading(false);
        // Hide the splash screen
        try {
          await SplashScreen.hideAsync();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          // Ignore errors
        }
      }
    };

    initializeApp();
  }, []);

  // Handle sign in with OAuth
  const handleSignInWithOAuth = async (
    provider: "google" | "github" | "apple",
  ) => {
    haptics.medium();

    try {
      setIsLoading(true);
      await signInWithOAuth(provider);
      // Auth state listener will handle the rest
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      Alert.alert("Login Failed", "Could not sign in with " + provider);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    haptics.medium();

    try {
      setIsLoading(true);
      await signOut();
      // Auth state listener will handle the rest
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.DARKER, COLORS.DARK]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.GOLD} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.DARKER, COLORS.DARK]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>THE BADGE APP</Text>
        </View>

        <View style={styles.content}>
          {isAuthenticated && user ? (
            <View style={styles.badgeContainer}>
              {user.avatar_url && (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatar}
                />
              )}
              <FlexBadge
                username={user.username}
                tier={user.tier}
                amount={user.purchase_amount}
                serialNumber={user.serial_number}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogout}>
                <Text style={styles.buttonText}>LOGOUT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginContainer}>
              <Text style={styles.welcomeText}>
                Login to see your special badge
              </Text>
              <TouchableOpacity
                style={[styles.loginButton, styles.googleButton]}
                onPress={() => handleSignInWithOAuth("google")}
              >
                <Text style={styles.buttonText}>LOGIN WITH GOOGLE</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, styles.githubButton]}
                onPress={() => handleSignInWithOAuth("github")}
              >
                <Text style={styles.buttonText}>LOGIN WITH GITHUB</Text>
              </TouchableOpacity>

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={[styles.loginButton, styles.appleButton]}
                  onPress={() => handleSignInWithOAuth("apple")}
                >
                  <Text style={styles.buttonText}>LOGIN WITH APPLE</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.DARK,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 28,
    color: COLORS.GOLD,
    letterSpacing: 1,
    marginVertical: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: COLORS.WHITE,
  },
  welcomeText: {
    fontSize: 24,
    color: COLORS.WHITE,
    textAlign: "center",
    marginBottom: 40,
  },
  loginContainer: {
    width: "100%",
    alignItems: "center",
  },
  badgeContainer: {
    width: "100%",
    alignItems: "center",
  },
  loginButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  googleButton: {
    backgroundColor: COLORS.GOOGLE,
  },
  githubButton: {
    backgroundColor: COLORS.GITHUB,
  },
  appleButton: {
    backgroundColor: COLORS.APPLE,
  },
  button: {
    backgroundColor: COLORS.GOLD,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 40,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: "bold",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.GOLD,
  },
});
