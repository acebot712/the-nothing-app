import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlexBadge from "./app/components/FlexBadge";
import { haptics } from "./app/utils/animations";

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
};

// Define User type
interface User {
  id: string;
  username: string;
  tier: "regular" | "elite" | "god";
  purchase_amount: number;
  serial_number: string;
  created_at: string;
}

// Root component
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is logged in
        const userJson = await AsyncStorage.getItem("@user");
        if (userJson) {
          const parsedUser = JSON.parse(userJson) as User;
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
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

  const handleLogin = async () => {
    haptics.medium();

    try {
      // Create dummy user
      const newUser: User = {
        id: `user_${Math.random().toString(36).substring(2, 11)}`,
        username: "Special User",
        tier: "elite",
        purchase_amount: 9999,
        serial_number: `BADGE-${Math.floor(Math.random() * 1000000)}`,
        created_at: new Date().toISOString(),
      };

      // Save user to storage
      await AsyncStorage.setItem("@user", JSON.stringify(newUser));

      // Update state
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleLogout = async () => {
    haptics.medium();

    try {
      // Clear user from storage
      await AsyncStorage.removeItem("@user");

      // Update state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error logging out:", error);
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
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>LOGIN</Text>
              </TouchableOpacity>
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
    backgroundColor: COLORS.GOLD,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  button: {
    backgroundColor: COLORS.GOLD,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 40,
  },
  buttonText: {
    color: COLORS.DARK,
    fontSize: 16,
    letterSpacing: 1,
    fontWeight: "bold",
  },
});
