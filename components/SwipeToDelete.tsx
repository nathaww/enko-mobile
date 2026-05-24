import React, { useMemo, useRef } from 'react';
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

type AnimatedInterpolation = ReturnType<Animated.Value['interpolate']>;

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
 * Swipe-right-to-delete wrapper. Reveals a red "Delete" panel on the LEFT
 * side as the row drags right (matches the user-requested "swipe right"
 * direction). Tapping the revealed panel opens an Alert confirmation; only
 * after the user confirms does `onDelete` fire.
 *
 * Uses the RN Animated API (not Reanimated) because that is what
 * gesture-handler's Swipeable passes into renderLeftActions.
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
  const swipeRef = useRef<Swipeable>(null);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (disabled) return <>{children}</>;

  const close = () => swipeRef.current?.close();

  const fire = () => {
    if (!confirmTitle) {
      haptic('success');
      onDelete();
      close();
      return;
    }
    Alert.alert(
      confirmTitle,
      confirmDescription,
      [
        { text: 'Cancel', style: 'cancel', onPress: close },
        {
          text: confirmLabel,
          style: 'destructive',
          onPress: () => {
            haptic('warning');
            onDelete();
            close();
          },
        },
      ],
      { cancelable: true, onDismiss: close }
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      // renderLeftActions = panel revealed when row swipes RIGHT.
      // (gesture-handler names sides by where the action panel lives.)
      renderLeftActions={(progress) => (
        <DeleteAction progress={progress} onPress={fire} styles={styles} />
      )}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'left') haptic('selection');
      }}
      leftThreshold={60}
      friction={1.6}
    >
      {children}
    </Swipeable>
  );
}

function DeleteAction({
  progress,
  onPress,
  styles,
}: {
  progress: AnimatedInterpolation;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel="Delete"
    >
      <Animated.View style={[styles.actionInner, { transform: [{ scale }] }]}>
        <Trash2 size={20} color="#fff" strokeWidth={2.2} />
        <Text style={styles.actionLabel}>Delete</Text>
      </Animated.View>
    </Pressable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    action: {
      width: 92,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.chipNegOn,
      borderRadius: radii.md,
      marginRight: spacing.sm,
    },
    actionInner: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    actionLabel: {
      ...typography.bodySm,
      color: '#fff',
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
  });
}
