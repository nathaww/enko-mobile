import { useEffect } from 'react';
import { router, Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { AndroidTabBar } from '@/components/AndroidTabBar';

/**
 * Android tab layout.
 *
 * iOS keeps `expo-router/unstable-native-tabs` (see `_layout.tsx`) because
 * NativeTabs renders the iOS 26 liquid-glass UITabBarController, which is
 * iOS-only. On Android, NativeTabs falls back to Material 3's stock bottom
 * navigation — which neither honors the outline/filled PNG variants nor
 * matches our brand-pill aesthetic. So Android gets a JS `<Tabs>` here with
 * a custom `tabBar` render prop (see components/AndroidTabBar.tsx).
 *
 * Keep the route list / order identical to `_layout.tsx` so deep links and
 * the tab key order stay in lockstep across platforms.
 */
export default function TabsLayoutAndroid() {
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/(auth)/welcome');
    }
  }, [status]);

  if (status !== 'authenticated') return null;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AndroidTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="expenses" options={{ title: 'Expenses' }} />
      <Tabs.Screen name="money" options={{ title: 'Money' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
