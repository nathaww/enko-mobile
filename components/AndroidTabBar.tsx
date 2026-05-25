import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

type IconPair = { default: number; selected: number };

const ICONS: Record<string, { label: string; src: IconPair }> = {
  index: {
    label: 'Home',
    src: {
      default: require('@/assets/icons/tabs/home.png'),
      selected: require('@/assets/icons/tabs/home-filled.png'),
    },
  },
  expenses: {
    label: 'Expenses',
    src: {
      default: require('@/assets/icons/tabs/expenses.png'),
      selected: require('@/assets/icons/tabs/expenses-filled.png'),
    },
  },
  money: {
    label: 'Money',
    src: {
      default: require('@/assets/icons/tabs/money.png'),
      selected: require('@/assets/icons/tabs/money-filled.png'),
    },
  },
  profile: {
    label: 'Profile',
    src: {
      default: require('@/assets/icons/tabs/profile.png'),
      selected: require('@/assets/icons/tabs/profile-filled.png'),
    },
  },
};

const ICON_SIZE = 22;
const ITEM_HEIGHT = 48;
const PILL_PADDING_X = 14;

/**
 * Custom Android tab bar. iOS still uses the native UITabBarController (see
 * `_layout.tsx`) for the iOS 26 liquid-glass effect — Android can't render
 * that material, and Material 3's stock bar doesn't honor outline vs filled
 * PNG variants the way iOS does. So we draw it ourselves: a floating pill
 * container with a brand-colored active capsule that expands to fit the
 * label, with the icon swapping between outline (inactive) and filled
 * (active).
 */
export function AndroidTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const haptic = useHaptic();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, spacing.md) },
      ]}
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const cfg = ICONS[route.name];
          if (!cfg) return null;

          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptic('selection');
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              focused={focused}
              label={cfg.label}
              icon={cfg.src}
              onPress={onPress}
              styles={styles}
              theme={theme}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  focused,
  label,
  icon,
  onPress,
  styles,
  theme,
}: {
  focused: boolean;
  label: string;
  icon: IconPair;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  theme: ReturnType<typeof useTheme>;
}) {
  // Shared "is active" value drives every animated property below. Spring
  // gives the pill width a soft snap; timing keeps the label fade crisp so
  // it doesn't lag behind the icon swap.
  const progress = useSharedValue(focused ? 1 : 0);
  const labelProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, {
      damping: 18,
      stiffness: 180,
      mass: 0.6,
    });
    labelProgress.value = withTiming(focused ? 1 : 0, { duration: 180 });
  }, [focused, progress, labelProgress]);

  const itemStyle = useAnimatedStyle(() => ({
    // Active item grows wider to make room for the label; inactive items
    // share the leftover space equally.
    flexGrow: 1 + progress.value * 1.4,
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.6 + progress.value * 0.4 }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
    maxWidth: labelProgress.value * 120,
    marginLeft: labelProgress.value * spacing.xs,
  }));

  return (
    <Animated.View style={[styles.itemSlot, itemStyle]}>
      <Pressable
        onPress={onPress}
        android_ripple={{
          color: theme.colors.brandSoft,
          borderless: true,
          radius: 36,
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}
        style={styles.itemPress}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            { backgroundColor: theme.colors.brand },
            pillStyle,
          ]}
        />
        <View style={styles.itemContent}>
          <Image
            source={focused ? icon.selected : icon.default}
            style={[
              styles.icon,
              {
                tintColor: focused
                  ? theme.colors.onBrand
                  : theme.colors.onSurfaceMuted,
              },
            ]}
            resizeMode="contain"
          />
          <Animated.Text
            numberOfLines={1}
            style={[
              styles.label,
              { color: theme.colors.onBrand },
              labelStyle,
            ]}
          >
            {label}
          </Animated.Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: spacing.md,
    },
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface1,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.outlineSoft,
      // Soft elevation so the bar floats over content
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 12,
    },
    itemSlot: {
      flexBasis: 0,
      height: ITEM_HEIGHT,
    },
    itemPress: {
      flex: 1,
      borderRadius: radii.pill,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pill: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.pill,
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: PILL_PADDING_X,
    },
    icon: {
      width: ICON_SIZE,
      height: ICON_SIZE,
    },
    label: {
      ...typography.button,
      fontSize: 13,
      overflow: 'hidden',
    },
  });
}
