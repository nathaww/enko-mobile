import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { fontFamily, radii, spacing } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';
import type { MoneySource } from '../money-sources.types';

type Props = {
  sources: MoneySource[];
  /** Tap on the front card → open edit. */
  onCardPress: (source: MoneySource) => void;
};

// Palette for the stack. Each card gets a stable color derived from its id
// so reorderings don't shuffle the look.
const CARD_COLORS = [
  '#1E5F3A', // deep green
  '#1F3B7A', // deep blue
  '#7A2E3B', // burgundy
  '#5C3B7A', // plum
  '#7A5520', // amber
  '#1F5C5C', // teal
];

function colorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

/**
 * Apple-Wallet-style stack: cards layered, top card swipeable. Either direction
 * past a small threshold cycles the front card to the back. Optional left/right
 * arrow controls do the same: ◀ promotes the back card to the front, ▶ sends
 * the front to the back. Cards behind peek out with a vertical offset + scale.
 *
 * Animation strategy: each card owns a sharedValue `slotShared` that springs
 * toward its current JS slot index. Only the front card responds to the pan
 * gesture; the drag's influence is faded out as `slotShared` moves away from 0,
 * which means the gesture and the cycle animation compose smoothly without a
 * visible reset frame.
 */
export function MoneySourceCardStack({ sources, onCardPress }: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const { width: screenWidth } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const CARD_W = Math.min(screenWidth * 0.85, 360);
  const CARD_H = CARD_W / 1.6;
  const STACK_OFFSET = 14;
  // Container reserves room for the front card plus the visual lift of up to 3
  // cards peeking out behind it.
  const STACK_HEIGHT = CARD_H + STACK_OFFSET * 3;

  const [order, setOrder] = useState<string[]>(() => sources.map((s) => s.id));

  // Keep order in sync when sources change (added/deleted). Preserves the
  // current relative order for cards that still exist and appends new ones.
  useEffect(() => {
    setOrder((prev) => {
      const ids = sources.map((s) => s.id);
      const keep = prev.filter((id) => ids.includes(id));
      const added = ids.filter((id) => !keep.includes(id));
      return [...keep, ...added];
    });
  }, [sources]);

  const cycleNext = () => {
    haptic('selection');
    setOrder((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]]));
  };

  const cyclePrev = () => {
    haptic('selection');
    setOrder((prev) =>
      prev.length < 2 ? prev : [prev[prev.length - 1], ...prev.slice(0, -1)]
    );
  };

  const handleCycle = (direction: 'left' | 'right') => {
    if (direction === 'right') cycleNext();
    else cyclePrev();
  };

  const stackSize = sources.length;
  const canCycle = stackSize > 1;

  return (
    <View style={styles.root}>
      <View style={[styles.stackArea, { height: STACK_HEIGHT }]}>
        {sources.map((source) => {
          const slotIndex = order.indexOf(source.id);
          return (
            <CardItem
              key={source.id}
              source={source}
              slotIndex={slotIndex}
              stackSize={stackSize}
              cardWidth={CARD_W}
              cardHeight={CARD_H}
              stackOffset={STACK_OFFSET}
              onCycle={handleCycle}
              onPress={onCardPress}
            />
          );
        })}
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={cyclePrev}
          disabled={!canCycle}
          hitSlop={8}
          style={({ pressed }) => [
            styles.ctrlBtn,
            !canCycle && styles.ctrlBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Previous account"
        >
          <ChevronLeft size={20} color={theme.colors.onSurface} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.dots}>
          {sources.map((source) => {
            const isActive = order[0] === source.id;
            return (
              <View
                key={source.id}
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                ]}
              />
            );
          })}
        </View>

        <Pressable
          onPress={cycleNext}
          disabled={!canCycle}
          hitSlop={8}
          style={({ pressed }) => [
            styles.ctrlBtn,
            !canCycle && styles.ctrlBtnDisabled,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Next account"
        >
          <ChevronRight size={20} color={theme.colors.onSurface} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

type CardItemProps = {
  source: MoneySource;
  slotIndex: number;
  stackSize: number;
  cardWidth: number;
  cardHeight: number;
  stackOffset: number;
  onCycle: (direction: 'left' | 'right') => void;
  onPress: (source: MoneySource) => void;
};

function CardItem({
  source,
  slotIndex,
  stackSize,
  cardWidth,
  cardHeight,
  stackOffset,
  onCycle,
  onPress,
}: CardItemProps) {
  const haptic = useHaptic();

  // Animated slot — springs whenever JS slot changes. Drives translateY +
  // scale so the cards shift up/forward as they cycle.
  const slotShared = useSharedValue(slotIndex);
  useEffect(() => {
    slotShared.value = withSpring(slotIndex, { damping: 20, stiffness: 180 });
  }, [slotIndex, slotShared]);

  // Drag offset on the X axis. Applied to the front card only; faded out as
  // the card moves away from slot 0.
  const dragX = useSharedValue(0);
  const SWIPE_THRESHOLD = 80;
  const VELOCITY_THRESHOLD = 600;

  const bgColor = colorForId(source.id);

  // Fade out cards beyond the visible "peek" depth so a long list doesn't
  // look like a wall of stripes behind the front.
  const VISIBLE_DEPTH = 3;

  const animatedStyle = useAnimatedStyle(() => {
    const slot = slotShared.value;
    // As the card recedes (slot > 0), drag influence fades to 0 so the off-
    // going card doesn't pop back to center after cycling.
    const dragWeight = Math.max(0, 1 - slot);
    const tx = dragX.value * dragWeight;
    const rot = (dragX.value / 18) * dragWeight;
    const ty = -stackOffset * slot;
    const sc = 1 - 0.05 * slot;
    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: sc },
        { rotateZ: `${rot}deg` },
      ],
      opacity: slot > VISIBLE_DEPTH ? 0 : 1,
    };
  });

  const pan = Gesture.Pan()
    .enabled(slotIndex === 0 && stackSize > 1)
    .activeOffsetX([-10, 10])
    .onChange((e) => {
      dragX.value = e.translationX;
    })
    .onEnd((e) => {
      const past =
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > VELOCITY_THRESHOLD;
      if (past) {
        const dir: 'left' | 'right' = e.translationX > 0 ? 'right' : 'left';
        // Trigger the cycle on JS; the card's slotIndex prop will change to
        // (stackSize - 1) on next render, the slotShared spring takes over.
        // dragX springs back to 0 in parallel; combined with the dragWeight
        // fade, the card smoothly transitions from the release position to
        // the back of the stack in one motion.
        runOnJS(onCycle)(dir);
        runOnJS(haptic)('medium');
      }
      dragX.value = withSpring(0, { damping: 16, stiffness: 200 });
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(onPress)(source);
    });

  // Pan wins if the user moves; tap only if the gesture stays still. Race
  // composes them, gesture-handler picks the first to qualify.
  const gesture = Gesture.Race(pan, tap);

  // z-order is keyed to the JS slot prop, NOT the animated slot value, so
  // that on cycle the just-promoted card immediately sits above the just-
  // demoted one. If z-order interpolated through the spring instead, the
  // outgoing card would visibly remain on top while shrinking until the
  // spring crossed the midpoint, which reads as "the front card is stuck".
  const zIndex = stackSize - slotIndex;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            backgroundColor: bgColor,
            zIndex,
            elevation: zIndex,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.cardHead}>
          <Text style={styles.cardAmount}>
            {source.currency} {formatAmount(source.balance)}
          </Text>
          <View style={styles.cardEmojiWrap}>
            <Text style={styles.cardEmoji}>{source.icon ?? '💼'}</Text>
          </View>
        </View>

        <View style={styles.cardFoot}>
          <Text style={styles.cardName} numberOfLines={1}>
            {source.name}
          </Text>
          {source.isDefault ? (
            <View style={styles.defaultBadge}>
              <Star size={10} color="#fff" fill="#fff" strokeWidth={0} />
              <Text style={styles.defaultText}>Default</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// Card styles live outside makeStyles since they don't depend on theme tokens
// (the card has its own per-card background color).
const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    borderRadius: 28,
    padding: 22,
    justifyContent: 'space-between',
    // Soft drop shadow so stack depth reads on both light and dark mode.
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardAmount: {
    fontFamily: fontFamily.display,
    fontSize: 28,
    letterSpacing: -1.0,
    color: '#fff',
  },
  cardEmojiWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 20 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardName: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    letterSpacing: -0.4,
    color: '#fff',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  defaultText: {
    color: '#fff',
    fontFamily: fontFamily.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { gap: spacing.lg },
    stackArea: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'relative',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
    },
    ctrlBtn: {
      width: 44,
      height: 44,
      borderRadius: radii.pill,
      backgroundColor: theme.colors.surface1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctrlBtnDisabled: { opacity: 0.4 },
    dots: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.outline,
    },
    dotActive: {
      width: 22,
      backgroundColor: theme.colors.brand,
    },
  });
}

