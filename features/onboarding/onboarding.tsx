import React, { useCallback, useMemo, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { spacing, typography } from '@/theme';

import { SLIDES } from './onboarding.config';
import { OnboardingSlide } from './components/OnboardingSlide';
import { OnboardingDots } from './components/OnboardingDots';
import { ParallaxBackground } from './components/ParallaxBackground';

export function Onboarding() {
  const theme = useTheme();
  const haptic = useHaptic();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const pageIndex = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  // Track page changes for haptic + last-slide CTA swap (runs on JS thread).
  const [isLast, setIsLast] = React.useState(false);
  useAnimatedReaction(
    () => Math.round(scrollX.value / width),
    (next, prev) => {
      if (prev !== null && next !== prev) {
        pageIndex.value = next;
        runOnJS(haptic)('selection');
        runOnJS(setIsLast)(next === SLIDES.length - 1);
      }
    },
    [width]
  );

  const goToTab = useCallback(
    (i: number) => {
      scrollRef.current?.scrollTo({ x: i * width, animated: true });
    },
    [width]
  );

  const onNext = useCallback(() => {
    const current = Math.round(scrollX.value / width);
    if (current >= SLIDES.length - 1) {
      haptic('medium');
      router.replace('/(auth)/welcome');
    } else {
      goToTab(current + 1);
    }
  }, [width, scrollX, haptic, goToTab]);

  const onSkip = useCallback(() => {
    haptic('light');
    router.replace('/(auth)/welcome');
  }, [haptic]);

  return (
    <View style={styles.root}>
      <ParallaxBackground scrollX={scrollX} width={width} count={SLIDES.length} />

      <SafeAreaView edges={['top']} style={styles.topbar}>
        <SlideCounter scrollX={scrollX} width={width} total={SLIDES.length} />
        <Pressable onPress={onSkip} hitSlop={16} style={({ pressed }) => pressed && { opacity: 0.6 }}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </SafeAreaView>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
        style={styles.pager}
      >
        {SLIDES.map((slide, i) => (
          <OnboardingSlide
            key={slide.lottie}
            slide={slide}
            index={i}
            scrollX={scrollX}
            width={width}
          />
        ))}
      </Animated.ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <OnboardingDots count={SLIDES.length} scrollX={scrollX} width={width} />
        <Button label={isLast ? 'Get started' : 'Continue'} fullWidth onPress={onNext} />
      </SafeAreaView>
    </View>
  );
}

function SlideCounter({
  scrollX,
  width,
  total,
}: {
  scrollX: SharedValue<number>;
  width: number;
  total: number;
}) {
  const theme = useTheme();
  const [n, setN] = React.useState(1);
  useAnimatedReaction(
    () => Math.round(scrollX.value / width) + 1,
    (next, prev) => {
      if (prev !== next) runOnJS(setN)(next);
    },
    [width]
  );
  return (
    <Text
      style={[
        typography.labelUp,
        { color: theme.colors.onSurfaceMuted, letterSpacing: 1.6 },
      ]}
    >
      {n} / {total}
    </Text>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    topbar: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    skip: {
      ...typography.button,
      color: theme.colors.onSurfaceMuted,
    },
    pager: { flex: 1 },
    footer: {
      paddingHorizontal: spacing['2xl'],
      paddingBottom: spacing.lg,
      paddingTop: spacing.lg,
      gap: spacing.xl,
    },
  });
}
