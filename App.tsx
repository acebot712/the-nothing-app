import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './app/contexts/UserContext';
import StripeProvider from './app/providers/StripeProvider';
import { initializeSupabase } from './app/config/supabase';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Montserrat_400Regular,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from './app/design/colors';

// Screens
import InviteScreen from './app/screens/InviteScreen';
import NetWorthScreen from './app/screens/NetWorthScreen';
import PricingScreen from './app/screens/PricingScreen';
import SuccessScreen from './app/screens/SuccessScreen';
import DashboardScreen from './app/screens/DashboardScreen';

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
  const getInitialRouteName = () => {
    if (isAuthenticated) {
      return 'Dashboard';
    } else if (hasInviteAccess) {
      return 'NetWorth';
    } else {
      return 'Invite';
    }
  };

  // Don't render navigation until loading is complete
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARK, '#181818']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={COLORS.GOLD_SHADES.PRIMARY} />
          <Text style={styles.loadingText}>Loading the luxury experience...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        key={isAuthenticated ? 'auth' : 'unauth'} // Force navigator to reset when auth state changes
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
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

// Root component with providers
export default function App() {
  const [dbInitialized, setDbInitialized] = useState<boolean | null>(null);
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
  useEffect(() => {
    const initialize = async () => {
      try {
        const success = await initializeSupabase();
        setDbInitialized(success);
        if (!success) {
          setInitError('Could not connect to the database. Please check your Supabase configuration and ensure the required tables exist.');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setDbInitialized(false);
        setInitError('An unexpected error occurred during initialization.');
      }
    };

    initialize();
  }, []);

  // Show loading screen while fonts are loading or checking database
  if (!fontsLoaded || dbInitialized === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARK, '#181818']}
          style={styles.initGradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.GOLD_SHADES.PRIMARY} />
            <Text style={[
              styles.loadingText,
              fontsLoaded ? styles.playfairRegular : null
            ]}>
              Preparing your luxury experience...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Show error screen if there's an issue with the database
  if (!dbInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARK, '#181818']}
          style={styles.initGradient}
        >
          <View style={styles.errorContainer}>
            <Text style={[
              styles.errorTitle,
              styles.playfairBold
            ]}>
              Database Error
            </Text>
            <Text style={[
              styles.errorText,
              styles.montserratRegular
            ]}>
              {initError}
            </Text>
            <Text style={[
              styles.errorHint,
              styles.montserratRegular
            ]}>
              Please ensure your Supabase instance is properly configured.
            </Text>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initGradient: {
    flex: 1,
  },
  loadingText: {
    marginTop: 24,
    fontSize: 18,
    color: COLORS.GOLD_SHADES.PRIMARY,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 28,
    color: COLORS.GOLD_SHADES.PRIMARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.WHITE,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: COLORS.GRAY_SHADES.MEDIUM_DARK,
    textAlign: 'center',
    marginBottom: 40,
  },
  debugTools: {
    marginTop: 24,
  },
  debugButton: {
    backgroundColor: COLORS.BACKGROUND.CARD_DARK,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.GOLD_SHADES.PRIMARY,
  },
  debugButtonText: {
    color: COLORS.GOLD_SHADES.PRIMARY,
    fontSize: 14,
  },
  // Font styles
  playfairRegular: {
    fontFamily: 'PlayfairDisplay_400Regular'
  },
  playfairBold: {
    fontFamily: 'PlayfairDisplay_700Bold'
  },
  montserratRegular: {
    fontFamily: 'Montserrat_400Regular'
  },
});
