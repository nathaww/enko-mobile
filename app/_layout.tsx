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
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import { AppToast } from '@/components/Toast';

export { ErrorBoundary } from 'expo-router';

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
    <SafeAreaProvider>
      <AppProviders>
        <RootLayoutNav />
      </AppProviders>
    </SafeAreaProvider>
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
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.surface } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <AppToast />
    </NavThemeProvider>
  );
}
