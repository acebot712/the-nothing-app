import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { haptics } from '../utils/animations';

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
  icon?: React.ReactNode;
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
  icon,
}: LuxuryButtonProps) => {

  // Handle press with haptic feedback
  const handlePress = () => {
    if (disabled) return;

    // Trigger haptic feedback
    if (hapticFeedback !== 'none') {
      haptics[hapticFeedback]();
    }

    // Execute the onPress function
    onPress();
  };

  // Determine button colors based on variant
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'gold':
        return {
          button: { 
            backgroundColor: '#F5D76E',
            borderColor: '#D4AF37',
          },
          text: { 
            color: '#000000',
          },
        };
      case 'platinum':
        return {
          button: { 
            backgroundColor: '#E5E4E2',
            borderColor: '#C0C0C0',
          },
          text: { 
            color: '#000000',
          },
        };
      case 'dark':
        return {
          button: { 
            backgroundColor: '#333333',
            borderColor: '#D4AF37',
          },
          text: { 
            color: '#F5D76E',
          },
        };
      default:
        return {
          button: { 
            backgroundColor: '#F5D76E',
            borderColor: '#D4AF37',
          },
          text: { 
            color: '#000000',
          },
        };
    }
  };

  // Get size-based styles
  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          button: { 
            paddingVertical: 8, 
            paddingHorizontal: 14, 
            borderRadius: 6,
          },
          text: { 
            fontSize: 14,
            letterSpacing: 1,
          },
        };
      case 'large':
        return {
          button: { 
            paddingVertical: 16, 
            paddingHorizontal: 32, 
            borderRadius: 8,
          },
          text: { 
            fontSize: 20,
            letterSpacing: 2,
          },
        };
      default:
        return {
          button: { 
            paddingVertical: 12, 
            paddingHorizontal: 24, 
            borderRadius: 8,
          },
          text: { 
            fontSize: 16,
            letterSpacing: 1.5,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  // Button content
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.container,
        variantStyles.button,
        sizeStyles.button,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[
          styles.text,
          variantStyles.text,
          sizeStyles.text,
          textStyle,
        ]}>
          {title.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    borderWidth: 3,
    elevation: 15,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Montserrat_700Bold',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default LuxuryButton; 