import React, { useEffect, useState, useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { UserProvider, useUser } from "./app/contexts/UserContext";
import StripeProvider from "./app/providers/StripeProvider";
import {
  initializeSupabase,
  debugSupabaseConnection,
} from "./app/config/supabase";
import { useFonts } from "@expo-google-fonts/playfair-display";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from "@expo-google-fonts/playfair-display";
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "./app/design/colors";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we initialize the app
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Ignore errors */
});

// Screens
import InviteScreen from "./app/screens/InviteScreen";
import NetWorthScreen from "./app/screens/NetWorthScreen";
import PricingScreen from "./app/screens/PricingScreen";
import SuccessScreen from "./app/screens/SuccessScreen";
import DashboardScreen from "./app/screens/DashboardScreen";

// Custom navigation theme
const MyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.GOLD_SHADES.PRIMARY,
    background: COLORS.BACKGROUND.DARK,
    card: COLORS.BACKGROUND.DARK,
    text: COLORS.WHITE,
    border: COLORS.GRAY_SHADES.ALMOST_BLACK,
    notification: COLORS.GOLD_SHADES.PRIMARY,
  },
};

// Create stack navigator
const Stack = createNativeStackNavigator();

// Main app navigation
const AppNavigator = () => {
  const { isAuthenticated, hasInviteAccess, isLoading } = useUser();

  // Determine starting screen based on authentication state
  const initialRouteName = useMemo(() => {
    if (isAuthenticated) {
      return "Dashboard";
    } else if (hasInviteAccess) {
      return "NetWorth";
    } else {
      return "Invite";
    }
  }, [isAuthenticated, hasInviteAccess]);

  // Don't render navigation until loading is complete
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARK, COLORS.BACKGROUND.DARKER]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={COLORS.GOLD_SHADES.PRIMARY} />
          <Text style={styles.loadingText}>
            Loading the luxury experience...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        key={isAuthenticated ? "auth" : "unauth"} // Force navigator to reset when auth state changes
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: COLORS.BACKGROUND.DARK },
          navigationBarColor: COLORS.BACKGROUND.DARK,
        }}
      >
        <Stack.Screen name="Invite" component={InviteScreen} />
        <Stack.Screen name="NetWorth" component={NetWorthScreen} />
        <Stack.Screen name="Pricing" component={PricingScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Error Dialog component for database connection issues
interface ErrorDialogProps {
  error: string;
  onRetry: () => void;
  onContinue: () => void;
}

const ErrorDialog = ({ error, onRetry, onContinue }: ErrorDialogProps) => (
  <View style={styles.errorContainer}>
    <Text style={[styles.errorTitle, styles.playfairBold]}>Database Error</Text>
    <Text style={[styles.errorText, styles.montserratRegular]}>{error}</Text>
    <Text style={[styles.errorHint, styles.montserratRegular]}>
      The app will function in demo mode with mock data. Your information will
      not be saved.
    </Text>

    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.buttonText}>Retry Connection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.buttonText}>Continue in Demo Mode</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Root component with providers
export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [dbStatus, setDbStatus] = useState<
    "initializing" | "connected" | "error" | "demo"
  >("initializing");
  const [initError, setInitError] = useState<string | null>(null);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // Initialize Supabase on app load
  const initializeApp = async () => {
    try {
      console.log("Initializing app...");
      await debugSupabaseConnection();

      // Initialize database
      const success = await initializeSupabase();

      if (success) {
        setDbStatus("connected");
        console.log("Database connected and initialized successfully!");
      } else {
        setDbStatus("error");
        setInitError(
          "Could not connect to the database. Check your Supabase configuration and required tables.",
        );
        console.error(
          "Database initialization failed. See instructions in FIX-DATABASE-CONNECTION.md",
        );
      }
    } catch (error) {
      console.error("Error during app initialization:", error);
      setDbStatus("error");
      setInitError("An unexpected error occurred during initialization.");
    } finally {
      setAppReady(true);

      // Hide the splash screen after everything is initialized
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        // Ignore errors
      }
    }
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const handleRetryConnection = () => {
    setDbStatus("initializing");
    setInitError(null);
    initializeApp();
  };

  const handleContinueInDemoMode = () => {
    setDbStatus("demo");
  };

  // Show loading screen while fonts are loading or checking database
  if (!fontsLoaded || !appReady) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARK, COLORS.BACKGROUND.DARKER]}
          style={styles.initGradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={COLORS.GOLD_SHADES.PRIMARY}
            />
            <Text
              style={[
                styles.loadingText,
                fontsLoaded ? styles.playfairRegular : null,
              ]}
            >
              Preparing your luxury experience...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Show error screen if there's an issue with the database
  if (dbStatus === "error") {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARK, COLORS.BACKGROUND.DARKER]}
          style={styles.initGradient}
        >
          <ErrorDialog
            error={initError || "Unknown database error"}
            onRetry={handleRetryConnection}
            onContinue={handleContinueInDemoMode}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main app with providers
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <UserProvider>
        <StripeProvider>
          <AppNavigator />
        </StripeProvider>
      </UserProvider>

      {dbStatus === "demo" && (
        <View style={styles.demoModeIndicator}>
          <Text style={styles.demoModeText}>DEMO MODE</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DARK,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  initGradient: {
    flex: 1,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 18,
    color: COLORS.GOLD_SHADES.PRIMARY,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 28,
    color: COLORS.GOLD_SHADES.PRIMARY,
    marginBottom: 16,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: COLORS.GRAY_SHADES.MEDIUM_DARK,
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: COLORS.BACKGROUND.CARD_DARK,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    width: "80%",
    alignItems: "center",
    borderColor: COLORS.GOLD_SHADES.PRIMARY,
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: COLORS.GOLD_SHADES.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "bold",
  },
  demoModeIndicator: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: COLORS.ACCENTS.WARNING,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  demoModeText: {
    color: COLORS.BACKGROUND.DARKER,
    fontSize: 10,
    fontWeight: "bold",
  },
  // Font styles
  playfairRegular: {
    fontFamily: "PlayfairDisplay_400Regular",
  },
  playfairBold: {
    fontFamily: "PlayfairDisplay_700Bold",
  },
  montserratRegular: {
    fontFamily: "Montserrat_400Regular",
  },
});
