import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  ThemeProvider as NavThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { AppProviders } from '@/providers/AppProviders';
import { useThemeContext } from '@/providers/ThemeProvider';
import { setupInterceptors } from '@/api/interceptors';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();
setupInterceptors();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AppProviders>
      <RootLayoutNav />
    </AppProviders>
  );
}

function RootLayoutNav() {
  const { theme, mode } = useThemeContext();

  // Bridge our theme into react-navigation's so headers, screens, and
  // the modal presentation match the active palette.
  const navTheme =
    mode === 'dark'
      ? {
          ...NavDarkTheme,
          colors: {
            ...NavDarkTheme.colors,
            background: theme.colors.surface,
            card: theme.colors.surface1,
            text: theme.colors.onSurface,
            border: theme.colors.outlineSoft,
            primary: theme.colors.brand,
          },
        }
      : {
          ...NavLightTheme,
          colors: {
            ...NavLightTheme.colors,
            background: theme.colors.surface,
            card: theme.colors.surface1,
            text: theme.colors.onSurface,
            border: theme.colors.outlineSoft,
            primary: theme.colors.brandDeep,
          },
        };

  return (
    <NavThemeProvider value={navTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </NavThemeProvider>
  );
}
