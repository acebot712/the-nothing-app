import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './app/contexts/UserContext';
import { initializeStripe } from './app/config/stripe';

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

  // Initialize Stripe on app load
  useEffect(() => {
    initializeStripe().catch(error => {
      console.error('Failed to initialize Stripe:', error);
    });
  }, []);

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
        {/* Loading state while the app initializes */}
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
  return (
    <SafeAreaView style={styles.container}>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
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
  },
});
