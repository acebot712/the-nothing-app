// Design system theme configuration

// Color palette
const colors = {
  // Primary colors
  primary: {
    main: "#0066CC",
    light: "#0080FF",
    dark: "#004C99",
    contrast: "#FFFFFF",
  },
  // Secondary colors
  secondary: {
    main: "#E1E1E1",
    light: "#F5F5F5",
    dark: "#CCCCCC",
    contrast: "#333333",
  },
  // Status colors
  status: {
    success: "#4CD964",
    error: "#FF3B30",
    warning: "#FFCC00",
    info: "#5AC8FA",
  },
  // Text colors
  text: {
    primary: "#000000",
    secondary: "#555555",
    tertiary: "#888888",
    disabled: "#AAAAAA",
    inverse: "#FFFFFF",
  },
  // UI colors
  ui: {
    background: "#FFFFFF",
    card: "#FFFFFF",
    divider: "#E1E1E1",
    border: "#CCCCCC",
  },
  // Special colors for tiers
  gold: {
    main: "#D4AF37",
    light: "#F4EFA8",
    dark: "#9C7F26",
  },
  platinum: {
    main: "#E5E4E2",
    light: "#FFFFFF",
    dark: "#AAAAA8",
  },
  dark: {
    main: "#111111",
    light: "#333333",
    lightest: "#2F2F2F",
  },
};

// Typography
const typography = {
  fontFamily: {
    // Main fonts (use system fonts by default)
    body: {
      regular: "System",
      bold: "System",
      semibold: "System",
      light: "System",
    },
    heading: {
      regular: "System",
      bold: "System",
      italic: "System",
    },
  },
  fontSize: {
    "5xl": 36,
    "4xl": 32,
    "3xl": 28,
    "2xl": 24,
    xl: 20,
    lg: 18,
    md: 16,
    sm: 14,
    xs: 12,
    xxs: 10,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
};

// Spacing
const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Elevation/shadows
const elevation = {
  shadow: {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    gold: {
      shadowColor: colors.gold.main,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

// Z-Index
const zIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 10,
  sticky: 100,
  overlay: 200,
  modal: 300,
  toast: 400,
  tooltip: 500,
};

// Animations
const animations = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    entrance: 225,
    exit: 195,
  },
  easing: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
};

// Screen dimensions (for responsive design)
const dimensions = {
  maxWidth: {
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
  },
};

// Breakpoints for responsive design
const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// Export the theme
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  zIndex,
  animations,
  dimensions,
  breakpoints,
};

export type Theme = typeof theme;
export default theme;
