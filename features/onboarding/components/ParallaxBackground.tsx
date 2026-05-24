import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  scrollX: SharedValue<number>;
  width: number;
  count: number;
};

/**
 * Three soft brand-tinted blobs that drift at different rates as the user
 * swipes. Sits behind the slides and gives the depth illusion that makes
 * the parallax feel deliberate rather than a flat horizontal pager.
 */
export function ParallaxBackground({ scrollX, width, count }: Props) {
  const theme = useTheme();
  const totalScroll = (count - 1) * width;

  // Big slow blob, top-left → drifts right
  const blobA = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, [0, totalScroll], [-60, width * 0.4]) },
      { translateY: interpolate(scrollX.value, [0, totalScroll], [-20, 30]) },
    ],
  }));

  // Smaller faster blob, mid-right → drifts left
  const blobB = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, [0, totalScroll], [width * 0.6, -width * 0.2]) },
      { translateY: interpolate(scrollX.value, [0, totalScroll], [80, -40]) },
    ],
  }));

  // Tiny accent blob, bottom — gentle drift
  const blobC = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, [0, totalScroll], [width * 0.3, width * 0.6]) },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Animated.View
        style={[
          styles.blob,
          styles.blobA,
          { backgroundColor: theme.colors.brandSoft },
          blobA,
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobB,
          { backgroundColor: theme.colors.surface1 },
          blobB,
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.blobC,
          { backgroundColor: theme.colors.brandSoft },
          blobC,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 9999,
  },
  blobA: { width: 360, height: 360, top: 40, left: -40 },
  blobB: { width: 280, height: 280, top: 200, right: -60, opacity: 0.6 },
  blobC: { width: 180, height: 180, bottom: 160, opacity: 0.5 },
});
