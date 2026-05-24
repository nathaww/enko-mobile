import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme, type ThemeMode } from '@/theme';
import { secureStorage } from '@/services/secureStorage';

type ThemeContextValue = {
  theme: Theme;
  /** The resolved theme (after applying any override). */
  mode: ThemeMode;
  /** Explicit override; `null` means "follow system". */
  override: ThemeMode | null;
  /** Set the override. `null` switches back to following the system. */
  setOverride: (mode: ThemeMode | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const system = useColorScheme();
  const [override, setOverrideState] = useState<ThemeMode | null>(null);

  // Hydrate persisted override on mount so user's choice survives relaunches.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await secureStorage.loadThemeOverride();
        if (!cancelled) setOverrideState(saved);
      } catch {
        // Swallow — fall back to system.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const mode: ThemeMode = override ?? (system === 'light' ? 'light' : 'dark');
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  const setOverride = useCallback((next: ThemeMode | null) => {
    setOverrideState(next);
    // Persist asynchronously; failures are non-fatal (UI already updated).
    secureStorage.saveThemeOverride(next).catch(() => {});
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
