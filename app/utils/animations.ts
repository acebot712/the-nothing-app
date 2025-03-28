import { Animated, Easing } from "react-native";

// Define type for haptic feedback options
interface HapticOptions {
  enableVibrateFallback: boolean;
  ignoreAndroidSystemSettings: boolean;
}

// Define type for ReactNativeHapticFeedback
interface HapticFeedback {
  trigger: (type: string, options?: HapticOptions) => void;
}

// Conditionally import haptic feedback
// We need to use require for dynamic imports, so we disable the eslint rule
/* eslint-disable @typescript-eslint/no-require-imports */
let ReactNativeHapticFeedback: HapticFeedback;
try {
  ReactNativeHapticFeedback = require("react-native-haptic-feedback").default;
} catch (error) {
  console.warn("react-native-haptic-feedback not available", error);
  // Create a mock implementation
  ReactNativeHapticFeedback = {
    trigger: () => {},
  };
}
/* eslint-enable @typescript-eslint/no-require-imports */

// Haptic feedback options
const hapticOptions: HapticOptions = {
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
    console.warn("Failed to trigger haptic feedback:", error);
  }
};

// Minimal haptic patterns
export const haptics = {
  // Medium tap for button presses
  medium: () => safelyTriggerHaptic("impactMedium"),
};

// Minimal animation utilities
export const animations = {
  // Shine animation for badge
  shine: (value: Animated.Value, _duration = 2000) => {
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: _duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }),
    ]).start(() => animations.shine(value, _duration));
  },
};
