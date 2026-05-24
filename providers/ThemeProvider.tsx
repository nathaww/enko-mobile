import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme, type ThemeMode } from '@/theme';

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  override: ThemeMode | null;
  setOverride: (mode: ThemeMode | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: React.ReactNode;
  /** Force a specific theme (useful for previews). Pass null to follow system. */
  initialOverride?: ThemeMode | null;
};

export function ThemeProvider({ children, initialOverride = null }: Props) {
  const system = useColorScheme();
  const [override, setOverrideState] = useState<ThemeMode | null>(initialOverride);

  // Keep override in sync if parent prop changes
  useEffect(() => {
    setOverrideState(initialOverride);
  }, [initialOverride]);

  const mode: ThemeMode = override ?? (system === 'light' ? 'light' : 'dark');
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  const setOverride = useCallback((next: ThemeMode | null) => {
    setOverrideState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, mode, override, setOverride }),
    [theme, mode, override, setOverride]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}
