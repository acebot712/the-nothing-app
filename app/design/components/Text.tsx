import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleProp,
  TextStyle,
} from 'react-native';
import theme from '../theme';

// Text variant options
export type TextVariant = 
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

// Text color options
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'inverse'
  | 'gold'
  | 'error'
  | 'success';

// Text alignment options
export type TextAlign = 'auto' | 'left' | 'center' | 'right' | 'justify';

// Text weight options
export type TextWeight = 'normal' | 'bold' | 'semibold' | 'light';

// Text props interface extending React Native's TextProps
export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
  weight?: TextWeight;
  style?: StyleProp<TextStyle>;
  italic?: boolean;
}

const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight = 'normal',
  italic = false,
  style,
  children,
  ...rest
}) => {
  // Get variant styles
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.heading.bold : theme.typography.fontFamily.heading.regular,
          fontSize: theme.typography.fontSize['4xl'],
          lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
          letterSpacing: theme.typography.letterSpacing.tight,
        };
      case 'h2':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.heading.bold : theme.typography.fontFamily.heading.regular,
          fontSize: theme.typography.fontSize['3xl'],
          lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
          letterSpacing: theme.typography.letterSpacing.tight,
        };
      case 'h3':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.heading.bold : theme.typography.fontFamily.heading.regular,
          fontSize: theme.typography.fontSize['2xl'],
          lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
        };
      case 'h4':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.heading.bold : theme.typography.fontFamily.heading.regular,
          fontSize: theme.typography.fontSize.xl,
          lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.tight,
        };
      case 'subtitle1':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.body.bold : theme.typography.fontFamily.body.regular,
          fontSize: theme.typography.fontSize.lg,
          lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
        };
      case 'subtitle2':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.body.bold : theme.typography.fontFamily.body.regular,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
        };
      case 'button':
        return {
          fontFamily: theme.typography.fontFamily.body.bold,
          fontSize: theme.typography.fontSize.md,
          letterSpacing: theme.typography.letterSpacing.wide,
          textTransform: 'uppercase' as const,
        };
      case 'body2':
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.body.bold : theme.typography.fontFamily.body.regular,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
        };
      case 'caption':
        return {
          fontFamily: theme.typography.fontFamily.body.regular,
          fontSize: theme.typography.fontSize.xs,
          lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
        };
      case 'overline':
        return {
          fontFamily: theme.typography.fontFamily.body.regular,
          fontSize: theme.typography.fontSize.xs,
          letterSpacing: theme.typography.letterSpacing.wider,
          textTransform: 'uppercase' as const,
        };
      case 'body1':
      default:
        return {
          fontFamily: weight === 'bold' ? theme.typography.fontFamily.body.bold : theme.typography.fontFamily.body.regular,
          fontSize: theme.typography.fontSize.md,
          lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.normal,
        };
    }
  };

  // Get color style
  const getColorStyle = (): TextStyle => {
    switch (color) {
      case 'secondary':
        return { color: theme.colors.text.secondary };
      case 'tertiary':
        return { color: theme.colors.text.tertiary };
      case 'disabled':
        return { color: theme.colors.text.disabled };
      case 'inverse':
        return { color: theme.colors.text.inverse };
      case 'gold':
        return { color: theme.colors.gold.main };
      case 'error':
        return { color: theme.colors.status.error };
      case 'success':
        return { color: theme.colors.status.success };
      case 'primary':
      default:
        return { color: theme.colors.text.primary };
    }
  };

  // Get alignment style
  const getAlignStyle = (): TextStyle => {
    return { textAlign: align };
  };

  // Get weight style
  const getFontWeightStyle = (): TextStyle => {
    switch (weight) {
      case 'bold':
        return { fontWeight: '700' as const };
      case 'semibold':
        return { fontWeight: '600' as const };
      case 'light':
        return { fontWeight: '300' as const };
      case 'normal':
      default:
        return { fontWeight: '400' as const };
    }
  };

  // Get italic style if needed
  const getItalicStyle = (): TextStyle => {
    if (italic) {
      return {
        fontStyle: 'italic' as const,
      };
    }
    return {};
  };

  // Combine all styles
  const textStyles = [
    getVariantStyle(),
    getColorStyle(),
    getAlignStyle(),
    getFontWeightStyle(),
    getItalicStyle(),
    style,
  ];

  return (
    <RNText style={textStyles} {...rest}>
      {children}
    </RNText>
  );
};

export default Text; 