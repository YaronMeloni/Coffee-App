import { Platform } from 'react-native';

import type { RoastLevel } from '@/data/types';

/**
 * Dialed design tokens.
 *
 * The palette is built around the colours of the coffee itself: oat-milk paper,
 * espresso ink, and a copper/caramel accent that reads like crema. Dark mode is
 * its own set of steps (a late-night café), not an automatic inversion.
 */

const light = {
  bg: '#F5EFE6',
  surface: '#FFFBF5',
  surfaceAlt: '#EFE6DA',
  surfacePressed: '#E8DDCF',
  ink: '#241812',
  inkSoft: '#6B5A4E',
  inkFaint: '#9C8D80',
  line: '#E4D8C8',
  accent: '#A85A26',
  accentInk: '#FFF8F0',
  accentSoft: '#F3E1CF',
  hero: '#2A1C14',
  heroInk: '#FBF2E7',
  heroInkSoft: '#D4C1AE',
  crema: '#E2A867',
  good: '#4F7F55',
  goodSoft: '#E1ECDD',
  sour: '#9A7A0E',
  sourSoft: '#F4EAC4',
  bitter: '#7D4660',
  bitterSoft: '#EFDDE5',
  danger: '#B3362B',
  /** Sequential ramp for cup score 1→5 (one hue, light→dark). */
  scoreRamp: ['#EBD9C3', '#DDB487', '#C98A50', '#A65F2A', '#6E3512'],
};

const dark: typeof light = {
  bg: '#120D0A',
  surface: '#1D1612',
  surfaceAlt: '#272019',
  surfacePressed: '#30271F',
  ink: '#F4EBE1',
  inkSoft: '#BBAA99',
  inkFaint: '#7F7064',
  line: '#30271F',
  accent: '#E39257',
  accentInk: '#1B110B',
  accentSoft: '#3A2617',
  hero: '#2B1E16',
  heroInk: '#FBF2E7',
  heroInkSoft: '#CDB9A5',
  crema: '#E8B06F',
  good: '#93C196',
  goodSoft: '#1F2E21',
  sour: '#E5C55A',
  sourSoft: '#3A3217',
  bitter: '#D59AB4',
  bitterSoft: '#3A2430',
  danger: '#F07A6E',
  /** Anchor flips in dark mode: the best cup is the brightest dot. */
  scoreRamp: ['#5A4030', '#85593A', '#B57A45', '#DDA062', '#F5CF9A'],
};

export const Palettes = { light, dark };
export type Colors = typeof light;

/** Each roast level gets its own two-stop gradient, so a bean's card looks like its roast. */
export const RoastGradients: Record<RoastLevel, [string, string]> = {
  light: ['#C9925A', '#85552D'],
  'medium-light': ['#B07A47', '#6F4221'],
  medium: ['#94603A', '#59351C'],
  'medium-dark': ['#74472C', '#412615'],
  dark: ['#4F2F1E', '#22130A'],
};

export const ROAST_LABELS: Record<RoastLevel, string> = {
  light: 'Light',
  'medium-light': 'Medium-light',
  medium: 'Medium',
  'medium-dark': 'Medium-dark',
  dark: 'Dark',
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/** Fraunces (a soft, warm serif) for display type; the platform UI font for everything else. */
export const Fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_500Medium_Italic',
  number: 'Fraunces_500Medium',
  ui: Platform.select({
    web: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    default: undefined,
  }),
};

export const ScreenPadding = Spacing.xl;
export const MaxContentWidth = 640;
