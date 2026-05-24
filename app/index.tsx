import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

/**
 * App entry. Picks the right starting route from auth + onboarding state.
 *
 *   bootstrapping → render nothing (splash is still up via AuthProvider)
 *   authenticated → /(tabs)
 *   not onboarded → /(onboarding)
 *   onboarded + signed out → /(auth)/welcome
 */
export default function Index() {
  const { status, hasOnboarded } = useAuth();

  if (status === 'bootstrapping') return null;
  if (status === 'authenticated') return <Redirect href="/(tabs)" />;
  if (!hasOnboarded) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(auth)/welcome" />;
}
