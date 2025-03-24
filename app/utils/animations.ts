import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Animated, Easing } from 'react-native';

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Luxury app haptic patterns
export const haptics = {
  // Light tap for simple interactions
  light: () => ReactNativeHapticFeedback.trigger('impactLight', hapticOptions),
  
  // Medium tap for confirmations
  medium: () => ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions),
  
  // Heavy tap for important actions
  heavy: () => ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions),
  
  // Success pattern
  success: () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    setTimeout(() => ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions), 150);
  },
  
  // Premium success pattern (for purchases)
  premium: () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    setTimeout(() => ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions), 150);
    setTimeout(() => ReactNativeHapticFeedback.trigger('impactLight', hapticOptions), 300);
    setTimeout(() => ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions), 450);
  },
  
  // Error pattern
  error: () => ReactNativeHapticFeedback.trigger('notificationError', hapticOptions),
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