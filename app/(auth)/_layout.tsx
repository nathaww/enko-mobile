import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { status } = useAuth();

  // Reverse auth guard: if the user is already signed in (e.g. they swipe
  // back from a screen, or arrive here via deep link), redirect to the app.
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/(tabs)');
    }
  }, [status]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    />
  );
}
