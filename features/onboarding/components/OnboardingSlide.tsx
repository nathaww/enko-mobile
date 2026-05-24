import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { LottieAnimation } from '@/components/LottieView';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';
import type { OnboardingSlideData } from '../onboarding.types';

type Props = {
  slide: OnboardingSlideData;
  index: number;
  scrollX: SharedValue<number>;
  width: number;
};

/**
 * One slide in the parallax pager. Each layer (Lottie, title, description)
 * animates with its own rate against the global scrollX so we get real depth,
 * not just a fade.
 */
export function OnboardingSlide({ slide, index, scrollX, width }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme, width), [theme, width]);

  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Lottie: drifts at ~60% speed (slower than scroll → feels "behind")
  // + scales 0.8 → 1 → 0.8 so the focused slide always reads largest.
  const lottieStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, inputRange, [width * 0.35, 0, -width * 0.35]) },
      { scale: interpolate(scrollX.value, inputRange, [0.78, 1, 0.78], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0.4, 1, 0.4], Extrapolation.CLAMP),
  }));

  // Title: matches scroll, lifts on enter/exit
  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollX.value, inputRange, [32, 0, -32]) },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
  }));

  // Description: ~10% faster than title for a subtle layered effect
  const descStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollX.value, inputRange, [48, 0, -48]) },
    ],
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
  }));

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.lottieWrap, lottieStyle]}>
        <LottieAnimation
          group="onboarding"
          name={slide.lottie}
          size={Math.min(width * 0.78, 320)}
          loop
          autoPlay
        />
      </Animated.View>
      <View style={styles.copyWrap}>
        <Animated.Text style={[styles.title, titleStyle]}>{slide.title}</Animated.Text>
        <Animated.Text style={[styles.description, descStyle]}>
          {slide.description}
        </Animated.Text>
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, width: number) {
  return StyleSheet.create({
    root: {
      width,
      flex: 1,
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing['2xl'],
    },
    lottieWrap: {
      flex: 1.2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copyWrap: {
      flex: 1,
      gap: spacing.md,
      paddingTop: spacing.lg,
    },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    description: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
      lineHeight: 22,
      maxWidth: 360,
    },
  });
}
