import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, LogBox, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './app/contexts/UserContext';
import StripeProvider from './app/providers/StripeProvider';
import { initializeSupabase } from './app/config/supabase';

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
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Loading the luxury experience...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0D0D0D' },
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

  // Show loading screen while checking database
  if (dbInitialized === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Connecting to the luxury database...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen if there's an issue with the database
  if (!dbInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Database Error</Text>
          <Text style={styles.errorText}>{initError}</Text>
          <Text style={styles.errorHint}>
            Check the console logs for more details and instructions on setting up the required tables.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StripeProvider>
        <UserProvider>
          <AppNavigator />
        </UserProvider>
      </StripeProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  errorTitle: {
    color: '#D42F2F',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorHint: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});
