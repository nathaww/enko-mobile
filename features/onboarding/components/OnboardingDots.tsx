import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

type Props = {
  count: number;
  scrollX: SharedValue<number>;
  width: number;
};

export function OnboardingDots({ count, scrollX, width }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Dot key={i} index={i} scrollX={scrollX} width={width} />
      ))}
    </View>
  );
}

function Dot({
  index,
  scrollX,
  width,
}: {
  index: number;
  scrollX: SharedValue<number>;
  width: number;
}) {
  const theme = useTheme();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animStyle = useAnimatedStyle(() => {
    const w = interpolate(scrollX.value, inputRange, [8, 28, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.35, 1, 0.35], Extrapolation.CLAMP);
    return { width: w, opacity };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: theme.colors.brand },
        animStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
});
