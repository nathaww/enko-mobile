import { useThemeContext } from '@/providers/ThemeProvider';
import type { Theme } from '@/theme';

/** Returns the active theme object. Most components only need this. */
export function useTheme(): Theme {
  return useThemeContext().theme;
}
