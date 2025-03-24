// Theme configuration for The Nothing App
// This provides a centralized place for styling constants

export const colors = {
  // Primary colors
  primary: '#D4AF37', // Gold
  secondary: '#C0C0C0', // Silver
  tertiary: '#B87333', // Bronze/Copper
  
  // Background colors
  background: {
    dark: '#0D0D0D',
    darker: '#000000',
    medium: '#1A1A1A',
    light: '#2A2A2A',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    tertiary: '#999999',
    gold: '#D4AF37',
  },
  
  // Status/action colors
  success: '#4CAF50',
  error: '#D42F2F',
  warning: '#FFC107',
  info: '#2196F3',
};

export const fonts = {
  // Font families
  primary: {
    regular: 'PlayfairDisplay_400Regular',
    bold: 'PlayfairDisplay_700Bold',
    italic: 'PlayfairDisplay_400Regular_Italic',
  },
  secondary: {
    regular: 'Montserrat_400Regular',
    bold: 'Montserrat_700Bold',
  },
  
  // Font sizes
  size: {
    tiny: 10,
    small: 12,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
    huge: 48,
  },
};

export const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
};

export const borders = {
  radius: {
    small: 4,
    medium: 8,
    large: 16,
    circle: 9999,
  },
  width: {
    thin: 1,
    medium: 2,
    thick: 4,
  },
};

export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Common text styles
export const textStyles = {
  title: {
    fontFamily: fonts.primary.bold,
    fontSize: fonts.size.xxlarge,
    color: colors.text.gold,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.primary.regular,
    fontSize: fonts.size.large,
    color: colors.text.primary,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.secondary.regular,
    fontSize: fonts.size.medium,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  label: {
    fontFamily: fonts.secondary.bold,
    fontSize: fonts.size.small,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
};

// Export complete theme
export const theme = {
  colors,
  fonts,
  spacing,
  borders,
  shadows,
  textStyles,
}; 