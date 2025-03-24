import { Animated, Easing, Platform } from 'react-native';

// Conditionally import haptic feedback
let ReactNativeHapticFeedback: any;
try {
  ReactNativeHapticFeedback = require('react-native-haptic-feedback').default;
} catch (error) {
  console.warn('react-native-haptic-feedback not available', error);
  // Create a mock implementation
  ReactNativeHapticFeedback = {
    trigger: () => {}
  };
}

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Safely trigger haptic feedback
const safelyTriggerHaptic = (type: string) => {
  try {
    if (ReactNativeHapticFeedback) {
      ReactNativeHapticFeedback.trigger(type, hapticOptions);
    }
  } catch (error) {
    console.warn('Failed to trigger haptic feedback:', error);
  }
};

// Luxury app haptic patterns
export const haptics = {
  // Light tap for simple interactions
  light: () => safelyTriggerHaptic('impactLight'),
  
  // Medium tap for confirmations
  medium: () => safelyTriggerHaptic('impactMedium'),
  
  // Heavy tap for important actions
  heavy: () => safelyTriggerHaptic('impactHeavy'),
  
  // Success pattern
  success: () => {
    safelyTriggerHaptic('impactMedium');
    setTimeout(() => safelyTriggerHaptic('impactHeavy'), 150);
  },
  
  // Premium success pattern (for purchases)
  premium: () => {
    safelyTriggerHaptic('impactMedium');
    setTimeout(() => safelyTriggerHaptic('impactHeavy'), 150);
    setTimeout(() => safelyTriggerHaptic('impactLight'), 300);
    setTimeout(() => safelyTriggerHaptic('impactHeavy'), 450);
  },
  
  // Error pattern
  error: () => safelyTriggerHaptic('notificationError'),
};

// Animation utilities
export const animations = {
  // Pulse animation
  pulse: (value: Animated.Value, toValue = 1.1, duration = 800) => {
    Animated.sequence([
      Animated.timing(value, {
        toValue,
        duration: duration / 2,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  },
  
  // Shine animation for gold elements
  shine: (value: Animated.Value, duration = 2000) => {
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start(() => animations.shine(value, duration));
  },
  
  // Fade in animation
  fadeIn: (value: Animated.Value, duration = 500) => {
    Animated.timing(value, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  },
  
  // Fade out animation
  fadeOut: (value: Animated.Value, duration = 500) => {
    Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  },
  
  // Bounce animation
  bounce: (value: Animated.Value, toValue = 1.2, duration = 1000) => {
    Animated.sequence([
      Animated.spring(value, {
        toValue,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(value, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  },
}; 