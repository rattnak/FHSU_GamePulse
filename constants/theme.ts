/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// FHSU Brand Colors
const fhsuGold = '#FDB913';
const fhsuBlack = '#000000';
const fhsuWhite = '#FFFFFF';

export const Colors = {
  // FHSU brand colors for direct use
  fhsuGold: fhsuGold,
  fhsuBlack: fhsuBlack,
  fhsuWhite: fhsuWhite,

  // Additional shared colors
  textPrimary: fhsuBlack,
  textSecondary: '#666666',
  textLight: '#999999',
  cardBackground: fhsuWhite,
  border: '#E0E0E0',

  // UI Colors (Standard)
  gray: '#6C757D',
  grayLight: '#ADB5BD',
  red: '#DC3545',
  green: '#28A745',
  blue: '#007BFF',

  // Theme colors for light/dark mode support
  light: {
    text: fhsuBlack,
    background: fhsuWhite,
    tint: fhsuGold,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: fhsuGold,
    border: '#E0E0E0',
  },
  dark: {
    text: fhsuWhite,
    background: fhsuBlack,
    tint: fhsuGold,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: fhsuGold,
    border: '#555555',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Shared spacing values for consistency
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  x2l: 24,
  x3l: 60,
};

// Shared border radius values
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};

// Shared font sizes
export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  x2l: 24,
  x3l: 28,
  x4l: 32,
  x5l: 36,
};

// Shadow presets for elevation
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// Animation durations
export const AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Gradient presets
export const Gradients = {
  primary: [fhsuBlack, '#2C2C2C'] as readonly [string, string],
  gold: [fhsuGold, '#E6A500'] as readonly [string, string],
  dark: ['#1A1A1A', fhsuBlack] as readonly [string, string],
  overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as readonly [string, string],
};

// Icon sizes
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  x2l: 48,
};
