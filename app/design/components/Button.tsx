import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  gradientColors?: [string, string, string];
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  gradientColors,
  onPress,
  ...rest
}) => {
  // Button colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: theme.colors.secondary.main,
          text: theme.colors.secondary.contrast,
          border: theme.colors.secondary.dark,
          gradient: gradientColors || [theme.colors.secondary.light, theme.colors.secondary.main, theme.colors.secondary.light],
        };
      case 'tertiary':
        return {
          background: 'transparent',
          text: theme.colors.primary.main,
          border: theme.colors.primary.main,
          gradient: gradientColors || [theme.colors.primary.light + '10', theme.colors.primary.main + '10', theme.colors.primary.light + '10'],
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: theme.colors.primary.main,
          border: 'transparent',
          gradient: gradientColors || ['transparent', 'transparent', 'transparent'],
        };
      case 'danger':
        return {
          background: theme.colors.status.error,
          text: theme.colors.text.inverse,
          border: theme.colors.status.error,
          gradient: gradientColors || [theme.colors.status.error, theme.colors.status.error, theme.colors.status.error],
        };
      case 'gold':
        return {
          background: theme.colors.gold.main,
          text: '#000000',
          border: theme.colors.gold.dark,
          gradient: gradientColors || [theme.colors.gold.light, theme.colors.gold.main, theme.colors.gold.light],
        };
      case 'primary':
      default:
        return {
          background: theme.colors.primary.main,
          text: theme.colors.primary.contrast,
          border: theme.colors.primary.dark,
          gradient: gradientColors || [theme.colors.primary.light, theme.colors.primary.main, theme.colors.primary.light],
        };
    }
  };

  // Button dimensions based on size
  const getButtonDimensions = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          fontSize: theme.typography.fontSize.sm,
          borderRadius: theme.borderRadius.sm,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.xl,
          fontSize: theme.typography.fontSize.lg,
          borderRadius: theme.borderRadius.lg,
        };
      case 'md':
      default:
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          fontSize: theme.typography.fontSize.md,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  const buttonColors = getButtonColors();
  const buttonDimensions = getButtonDimensions();

  const wrapperStyle = {
    alignSelf: fullWidth ? 'stretch' as const : 'flex-start' as const,
  };

  const buttonStyle = [
    styles.button,
    {
      backgroundColor: variant === 'ghost' ? 'transparent' : buttonColors.background,
      borderColor: buttonColors.border,
      borderWidth: variant === 'tertiary' ? 1 : 0,
      borderRadius: buttonDimensions.borderRadius,
      paddingVertical: buttonDimensions.paddingVertical,
      paddingHorizontal: buttonDimensions.paddingHorizontal,
      opacity: disabled ? 0.6 : 1,
    },
    style
  ];

  const textStyleObj = {
    color: disabled ? theme.colors.text.disabled : buttonColors.text,
    fontSize: buttonDimensions.fontSize,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  };

  const renderContent = () => (
    <>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={buttonColors.text}
          style={styles.loader}
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={[textStyleObj, textStyle]}>{title}</Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </>
  );

  const shouldUseGradient = variant !== 'ghost' && variant !== 'tertiary';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isLoading || disabled}
      onPress={onPress}
      style={wrapperStyle}
      {...rest}
    >
      {shouldUseGradient ? (
        <LinearGradient
          colors={buttonColors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyle}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View style={buttonStyle}>{renderContent()}</View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...theme.elevation.shadow.sm,
  },
  loader: {
    marginVertical: 2,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
});

export default Button; 