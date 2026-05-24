import { Redirect } from 'expo-router';

/**
 * App entry. Decides where to send the user.
 *
 * For now (no persisted auth state yet) we always send to onboarding.
 * Once auth + secure storage land, this checks for a token and either:
 *   - Redirects to /(tabs) if signed in
 *   - Redirects to /(auth)/welcome if onboarded but signed out
 *   - Redirects to /(onboarding) for first-launch users
 */
export default function Index() {
  return <Redirect href="/(onboarding)" />;
}
