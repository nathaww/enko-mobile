import { useEffect } from 'react';
import { router } from 'expo-router';
import {
  NativeTabs,
  Icon,
  Label,
} from 'expo-router/unstable-native-tabs';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';

/**
 * Native tab bar.
 *
 * iOS renders the actual UITabBarController, which on iOS 26 uses the new
 * "liquid glass" material that refracts content scrolling underneath. Earlier
 * iOS versions fall back to a standard translucent tab bar. Android renders
 * Material 3's native bottom navigation.
 *
 * ─── Icon API quick reference ───────────────────────────────────────────
 * The Icon component has three MUTUALLY EXCLUSIVE shapes:
 *
 *   1. Cross-platform custom PNG (recommended once you have designer assets):
 *      <Icon src={{
 *        default:  require('@/assets/icons/tabs/home.png'),
 *        selected: require('@/assets/icons/tabs/home-filled.png'),
 *      }} />
 *
 *   2. iOS SF Symbol + Android system drawable (the current fallback):
 *      <Icon
 *        sf={{ default: 'house', selected: 'house.fill' }}
 *        drawable="ic_home"
 *      />
 *
 *   3. iOS SF Symbol + Android custom PNG (have-your-cake):
 *      <Icon
 *        sf={{ default: 'house', selected: 'house.fill' }}
 *        androidSrc={{ default: require('...'), selected: require('...') }}
 *      />
 *
 * The `default` PNG = outline (inactive). The `selected` PNG = filled (active).
 * `tintColor` / `iconColor` still apply on top, so single-color PNGs get
 * tinted by your theme; multi-color PNGs render as-is.
 *
 * Phosphor's Regular + Fill weights are perfect for this — same icon shape,
 * one outlined, one filled. https://phosphoricons.com
 */
export default function TabsLayout() {
  const theme = useTheme();
  const { status } = useAuth();

  // Hard auth guard: if the user becomes unauthenticated while inside (tabs)
  // — typically right after a logout mutation completes — push them out so
  // they can't navigate back into authenticated screens via the system back
  // gesture. Render nothing during the transition so screens don't fire
  // queries with no token.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/(auth)/welcome');
    }
  }, [status]);

  if (status !== 'authenticated') return null;

  return (
    <NativeTabs
      tintColor={theme.colors.brand}
      iconColor={theme.colors.onSurfaceMuted}
      labelStyle={{
        fontFamily: typography.button.fontFamily,
        fontSize: 10,
        color: theme.colors.onSurfaceMuted,
      }}
      // Without this, iOS uses a DIFFERENT appearance when scrolled to the
      // top edge (transparent) vs while scrolling (translucent glass). The
      // transition between the two causes a brief white/black flash. Keep
      // one consistent appearance kills the flicker.
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <Icon
          src={{
            default: require('@/assets/icons/tabs/home.png'),
            selected: require('@/assets/icons/tabs/home-filled.png'),
          }}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expenses">
        <Icon
          src={{
            default: require('@/assets/icons/tabs/expenses.png'),
            selected: require('@/assets/icons/tabs/expenses-filled.png'),
          }}
        />
        <Label>Expenses</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="money">
        <Icon
          src={{
            default: require('@/assets/icons/tabs/money.png'),
            selected: require('@/assets/icons/tabs/money-filled.png'),
          }}
        />
        <Label>Money</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Icon
          src={{
            default: require('@/assets/icons/tabs/profile.png'),
            selected: require('@/assets/icons/tabs/profile-filled.png'),
          }}
        />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
