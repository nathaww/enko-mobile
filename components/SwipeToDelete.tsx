import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

const DELETE_WIDTH = 92;
const OPEN_VELOCITY = -500;
const OVERSHOOT = DELETE_WIDTH * 1.18;
const SPRING = { damping: 22, stiffness: 220 } as const;

type Props = {
  children: React.ReactNode;
  /** Fired after the user confirms. Wrap your mutation here. */
  onDelete: () => void;
  /** Optional Alert title. If omitted, deletes immediately on swipe. */
  confirmTitle?: string;
  /** Alert body, usually one short sentence. */
  confirmDescription?: string;
  /** Label on the Alert's destructive button. Defaults to "Delete". */
  confirmLabel?: string;
  /**
   * Disable the swipe entirely (e.g. for system-default rows that can't be
   * deleted). When true, children render with no gesture handler at all.
   */
  disabled?: boolean;
};

/**
 * Swipe-left-to-delete wrapper with a true push layout:
 *
 *   [   children (flex: 1)   ] [ panel (animated width 0→92) ]
 *
 * Both sit in a single flex-row container. As the panel's width grows under
 * the drag, the child wrapper shrinks (because `flex: 1` yields to a
 * fixed-width sibling). The child's content reflows naturally — title
 * ellipsizes via `numberOfLines={1}`, the trailing chip moves left in
 * lockstep with the shrinking wrap — so the delete button never overlaps
 * anything: it's a static peer of the row, not an absolute overlay.
 *
 * Why the panel content is wrapped in a fixed-width inner: when the outer
 * panel width is 0, an unconstrained icon + label column would try to wrap
 * the word "Delete" one character per line, ballooning intrinsic height and
 * stretching the whole row. Fixing the inner width at DELETE_WIDTH (and
 * letting the outer's `overflow: hidden` clip it when narrow) keeps the
 * row height equal to the children's natural height at all times.
 */
export function SwipeToDelete({
  children,
  onDelete,
  confirmTitle,
  confirmDescription,
  confirmLabel = 'Delete',
  disabled,
}: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Panel width in px. 0 = closed, DELETE_WIDTH = fully open.
  const offset = useSharedValue(0);
  // Snapshot of `offset` at the gesture's start so dragging from a half-open
  // state continues from where the finger lands.
  const startOffset = useSharedValue(0);

  const closeJS = () => {
    offset.value = withSpring(0, SPRING);
  };

  const fire = () => {
    if (!confirmTitle) {
      haptic('success');
      onDelete();
      closeJS();
      return;
    }
    Alert.alert(
      confirmTitle,
      confirmDescription,
      [
        { text: 'Cancel', style: 'cancel', onPress: closeJS },
        {
          text: confirmLabel,
          style: 'destructive',
          onPress: () => {
            haptic('warning');
            onDelete();
            closeJS();
          },
        },
      ],
      { cancelable: true, onDismiss: closeJS }
    );
  };

  if (disabled) return <>{children}</>;

  const pan = Gesture.Pan()
    // activeOffsetX requires meaningful horizontal motion before claiming
    // the gesture; failOffsetY hands off to a vertical scroller if the user
    // is actually trying to scroll the list.
    .activeOffsetX([-12, 12])
    .failOffsetY([-15, 15])
    .onBegin(() => {
      startOffset.value = offset.value;
    })
    .onUpdate((e) => {
      // Swipe LEFT = negative translationX → grow offset positively.
      const raw = startOffset.value - e.translationX;
      offset.value =
        raw < 0
          ? 0
          : raw > OVERSHOOT
            ? OVERSHOOT + (raw - OVERSHOOT) * 0.25
            : raw;
    })
    .onEnd((e) => {
      const shouldOpen =
        offset.value > DELETE_WIDTH / 2 || e.velocityX < OPEN_VELOCITY;
      if (shouldOpen) {
        runOnJS(haptic)('selection');
        offset.value = withSpring(DELETE_WIDTH, SPRING);
      } else {
        offset.value = withSpring(0, SPRING);
      }
    });

  const panelStyle = useAnimatedStyle(() => ({
    width: offset.value,
  }));

  const contentOpacity = useAnimatedStyle(() => {
    const progress = Math.min(1, offset.value / DELETE_WIDTH);
    return {
      opacity: interpolate(
        progress,
        [0, 0.4, 1],
        [0, 0, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.outer}>
        <View style={styles.childWrap}>{children}</View>
        <Reanimated.View style={[styles.panel, panelStyle]}>
          <View style={styles.panelInner}>
            <Pressable
              onPress={fire}
              style={styles.panelPress}
              accessibilityRole="button"
              accessibilityLabel="Delete"
            >
              <Reanimated.View
                style={[styles.panelContent, contentOpacity]}
                pointerEvents="none"
              >
                <Trash2 size={20} color="#fff" strokeWidth={2.2} />
                <Text style={styles.panelLabel} numberOfLines={1}>
                  Delete
                </Text>
              </Reanimated.View>
            </Pressable>
          </View>
        </Reanimated.View>
      </View>
    </GestureDetector>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    outer: {
      flexDirection: 'row',
      alignItems: 'stretch',
      overflow: 'hidden',
    },
    childWrap: {
      flex: 1,
    },
    panel: {
      backgroundColor: theme.colors.chipNegOn,
      borderRadius: radii.md,
      overflow: 'hidden',
      // alignSelf:'stretch' makes the panel match the row's height (which
      // is set by the child wrap). Critically, the panel itself contributes
      // ZERO intrinsic height because panelInner is absolutely positioned
      // below — so the row height stays equal to the children's natural
      // height in both closed and open states.
      alignSelf: 'stretch',
    },
    panelInner: {
      // Absolute so the icon + label content never feed into the panel's
      // intrinsic height. The panel is a 0-height box visually stretched
      // to the row height; the inner paints into it but doesn't size it.
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: DELETE_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
    },
    panelPress: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    panelContent: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    panelLabel: {
      ...typography.bodySm,
      color: '#fff',
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
  });
}
