import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, LogBox, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './app/contexts/UserContext';
import StripeProvider from './app/providers/StripeProvider';
import { initializeSupabase } from './app/config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Screens
import InviteScreen from './app/screens/InviteScreen';
import NetWorthScreen from './app/screens/NetWorthScreen';
import PricingScreen from './app/screens/PricingScreen';
import SuccessScreen from './app/screens/SuccessScreen';
import DashboardScreen from './app/screens/DashboardScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Animated: `useNativeDriver` was not specified',
]);

// Custom navigation theme
const MyTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D4AF37',
    background: '#0A0A0A',
    card: '#0A0A0A',
    text: '#FFFFFF',
    border: '#2A2A2A',
    notification: '#D4AF37',
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
          colors={['#0A0A0A', '#181818']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading the luxury experience...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Log the current auth state for debugging
  console.log('AppNavigator: Auth state -', { 
    isAuthenticated, 
    hasInviteAccess, 
    initialScreen: getInitialRouteName() 
  });

  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        key={isAuthenticated ? 'auth' : 'unauth'} // Force navigator to reset when auth state changes
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0A0A0A' },
          navigationBarColor: '#0A0A0A',
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
          colors={['#0A0A0A', '#181818']}
          style={styles.initGradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={[styles.loadingText, { fontFamily: fontsLoaded ? 'PlayfairDisplay_400Regular' : undefined }]}>
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
          colors={['#0A0A0A', '#181818']}
          style={styles.initGradient}
        >
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { fontFamily: 'PlayfairDisplay_700Bold' }]}>Database Error</Text>
            <Text style={[styles.errorText, { fontFamily: 'Montserrat_400Regular' }]}>{initError}</Text>
            <Text style={[styles.errorHint, { fontFamily: 'Montserrat_400Regular' }]}>
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
    backgroundColor: '#0A0A0A',
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
    color: '#D4AF37',
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
    color: '#D4AF37',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorHint: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginBottom: 40,
  },
  debugTools: {
    marginTop: 24,
  },
  debugButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  debugButtonText: {
    color: '#D4AF37',
    fontSize: 14,
  },
});
