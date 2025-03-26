import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'gold' | 'platinum';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  padding?: keyof typeof theme.spacing | number;
  gradient?: string[];
  onPress?: () => void;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'lg',
  gradient,
  onPress,
  disabled = false,
  ...rest
}) => {
  // Determine if the card should use a gradient background
  const useGradient = variant === 'gold' || variant === 'platinum' || !!gradient;
  
  // Get card styles based on variant
  const getCardStyles = () => {
    const paddingValue = typeof padding === 'string' ? theme.spacing[padding] : padding;
    
    const baseStyle: ViewStyle = {
      padding: paddingValue,
      borderRadius: theme.borderRadius.lg,
    };
    
    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.ui.card,
          ...theme.elevation.shadow.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.ui.divider,
        };
      case 'gold':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.gold.main,
          ...theme.elevation.shadow.gold,
        };
      case 'platinum':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.platinum.main,
          ...theme.elevation.shadow.md,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.ui.card,
        };
    }
  };
  
  // Get gradient colors based on variant
  const getGradientColors = () => {
    if (gradient) {
      return gradient;
    }
    
    switch (variant) {
      case 'gold':
        return [
          theme.colors.ui.card,
          `${theme.colors.gold.main}20`, // Gold with 20% opacity
          theme.colors.ui.card,
        ];
      case 'platinum':
        return [
          theme.colors.ui.card,
          `${theme.colors.platinum.main}20`, // Platinum with 20% opacity
          theme.colors.ui.card,
        ];
      default:
        return [
          theme.colors.ui.card,
          theme.colors.secondary.light,
          theme.colors.ui.card,
        ];
    }
  };
  
  const cardStyles = [styles.card, getCardStyles(), style];
  
  // If onPress is provided, wrap in a TouchableOpacity
  const CardContainer = onPress ? TouchableOpacity : View;
  const touchableProps = onPress ? { 
    onPress, 
    activeOpacity: 0.8,
    disabled 
  } : {};
  
  if (useGradient) {
    return (
      <CardContainer style={cardStyles} {...touchableProps} {...rest}>
        <LinearGradient
          colors={getGradientColors() as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </CardContainer>
    );
  }
  
  return (
    <CardContainer style={cardStyles} {...touchableProps} {...rest}>
      {children}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default Card; 