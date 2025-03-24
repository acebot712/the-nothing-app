import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { haptics, animations } from '../utils/animations';

// Props types
interface LuxuryButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'gold' | 'platinum' | 'dark';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: 'light' | 'medium' | 'heavy' | 'success' | 'premium' | 'error' | 'none';
  showGradient?: boolean;
}

// Button component
const LuxuryButton = ({
  onPress,
  title,
  variant = 'gold',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  hapticFeedback = 'medium',
  showGradient = true,
}: LuxuryButtonProps) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  // Start shine animation when component mounts
  useEffect(() => {
    if (variant !== 'dark' && !disabled) {
      animations.shine(shineAnim);
    }
  }, [variant, disabled]);

  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled) return;

    // Trigger haptic feedback
    if (hapticFeedback !== 'none') {
      haptics[hapticFeedback]();
    }

    // Trigger press animation
    animations.pulse(scaleAnim);

    // Execute the onPress function
    onPress();
  };

  // Determine button colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'gold':
        return {
          gradientColors: ['#D4AF37', '#F4EFA8', '#D4AF37'],
          textColor: '#000',
        };
      case 'platinum':
        return {
          gradientColors: ['#E5E4E2', '#FFFFFF', '#E5E4E2'],
          textColor: '#000',
        };
      case 'dark':
        return {
          gradientColors: ['#222222', '#333333', '#222222'],
          textColor: '#D4AF37',
        };
      default:
        return {
          gradientColors: ['#D4AF37', '#F4EFA8', '#D4AF37'],
          textColor: '#000',
        };
    }
  };

  // Get size-based styles
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: 8, paddingHorizontal: 16 },
          text: { fontSize: 14 },
        };
      case 'large':
        return {
          container: { paddingVertical: 16, paddingHorizontal: 32 },
          text: { fontSize: 18 },
        };
      default:
        return {
          container: { paddingVertical: 12, paddingHorizontal: 24 },
          text: { fontSize: 16 },
        };
    }
  };

  const { gradientColors, textColor } = getColors();
  const sizeStyles = getSizeStyles();

  // Shine effect styles
  const shineStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: shineAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 0],
    }),
    transform: [
      {
        translateX: shineAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-100, 100],
        }),
      },
    ],
  };

  // Button content
  const buttonContent = (
    <Animated.View
      style={[
        styles.container,
        sizeStyles.container,
        { transform: [{ scale: scaleAnim }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      {showGradient ? (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View style={[styles.shine, shineStyle]} />
          <Text
            style={[
              styles.text,
              { color: textColor },
              sizeStyles.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.nonGradient,
            { backgroundColor: gradientColors[0] },
          ]}
        >
          <Text
            style={[
              styles.text,
              { color: textColor },
              sizeStyles.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={styles.touchable}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'center',
  },
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  shine: {
    width: 30,
    height: '300%',
    backgroundColor: '#FFF',
    opacity: 0.5,
    transform: [{ rotate: '25deg' }],
    position: 'absolute',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});

export default LuxuryButton; 