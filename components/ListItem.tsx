import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

type Props = {
  /** Left-side icon — usually a Lucide icon wrapped in a colored circle by the caller. */
  leading?: React.ReactNode;
  /** Primary line (e.g. expense name, setting label). */
  title: string;
  /** Optional secondary line (e.g. source + time, helper text). */
  subtitle?: string;
  /** Right-side content — usually an AmountChip, chevron, or toggle. */
  trailing?: React.ReactNode;
  /** Tap handler. Triggers a light haptic. Skip for non-tappable rows. */
  onPress?: () => void;
  /** Hide the bottom divider (useful for the last item in a group). */
  hideDivider?: boolean;
};

/**
 * Generic list row. The pattern appears in: recent activity, money sources,
 * profile settings, category lists. Owns layout and divider; consumer owns the
 * icon styling so each domain can pick its own colors.
 */
export function ListItem({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  hideDivider,
}: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const handlePress = onPress
    ? () => {
        haptic('light');
        onPress();
      }
    : undefined;

  const content = (
    <View style={[styles.row, !hideDivider && styles.rowDivider]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  if (!handlePress) return content;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => pressed && { opacity: 0.7 }}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {content}
    </Pressable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md - 1,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.outlineSoft,
    },
    leading: {
      flexShrink: 0,
    },
    text: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    title: {
      ...typography.body,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
      letterSpacing: -0.1,
    },
    subtitle: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontSize: 12,
    },
    trailing: {
      flexShrink: 0,
    },
  });
}
