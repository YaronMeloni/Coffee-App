import { useColorScheme } from 'react-native';

import { Palettes, type Colors } from './tokens';

export interface Theme {
  c: Colors;
  scheme: 'light' | 'dark';
  isDark: boolean;
}

/** The active colour palette, following the system light/dark setting. */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { c: Palettes[scheme], scheme, isDark: scheme === 'dark' };
}
