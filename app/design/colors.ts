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
    AAA: '#AAAAAA',
    888: '#888888',
    444: '#444444',
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
  
  // Common alpha colors
  ALPHA: {
    BLACK_20: 'rgba(0, 0, 0, 0.2)',
    BLACK_30: 'rgba(0, 0, 0, 0.3)',
    BLACK_50: 'rgba(0, 0, 0, 0.5)',
    BLACK_80: 'rgba(0, 0, 0, 0.8)',
    WHITE_10: 'rgba(255, 255, 255, 0.1)',
    WHITE_20: 'rgba(255, 255, 255, 0.2)',
    WHITE_30: 'rgba(255, 255, 255, 0.3)',
    WHITE_50: 'rgba(255, 255, 255, 0.5)',
    GOLD_10: 'rgba(212, 175, 55, 0.1)',
    GOLD_15: 'rgba(212, 175, 55, 0.15)',
    GOLD_20: 'rgba(212, 175, 55, 0.2)',
    GOLD_30: 'rgba(212, 175, 55, 0.3)',
  }
};

export default COLORS; 