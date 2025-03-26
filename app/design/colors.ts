import theme from './theme';

// Extract colors from theme
export const COLORS = {
  // Primary colors
  PRIMARY: theme.colors.primary,
  
  // Secondary colors
  SECONDARY: theme.colors.secondary,
  
  // Status colors
  STATUS: theme.colors.status,
  
  // Text colors
  TEXT: theme.colors.text,
  
  // UI colors
  UI: theme.colors.ui,
  
  // Special colors for tiers
  GOLD: theme.colors.gold,
  PLATINUM: theme.colors.platinum,
  DARK: theme.colors.dark,
  
  // Common colors used directly in components
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  TRANSPARENT: 'transparent',
  
  // Specific colors from the codebase
  BACKGROUND: {
    DARK: '#0A0A0A',
    DARKER: '#000000',
    LIGHT_DARK: '#1A1A1A',
    MEDIUM_DARK: '#222222',
    CARD_DARK: '#333333',
  },
  
  GOLD_SHADES: {
    PRIMARY: '#D4AF37',
    LIGHT: '#F4EFA8',
    ACCENT: '#FFD700',
  },
  
  GRAY_SHADES: {
    LIGHTEST: '#FFFFFF',
    LIGHTER: '#F5F5F5',
    LIGHT: '#E1E1E1',
    MEDIUM: '#CCCCCC',
    MEDIUM_DARK: '#999999',
    DARK: '#666666',
    DARKER: '#555555',
    DARKEST: '#444444',
    ALMOST_BLACK: '#2A2A2A',
  },
  
  METAL: {
    GOLD: '#FFD700',
    SILVER: '#C0C0C0',
    BRONZE: '#CD7F32',
  },
  
  ACCENTS: {
    SUCCESS: '#00e676',
    ERROR: '#ff5252',
    ERROR_LIGHT: '#FF6B6B',
    INFO: '#007AFF',
    WARNING: '#FFCC00',
    GOOGLE: '#DB4437',
    APPLE: '#000000',
  },
};

export default COLORS; 