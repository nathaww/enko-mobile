import React, { useMemo } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing } from '@/theme';

type Props = ViewProps & {
  /**
   * `default` — surface-1 background, padded body card
   * `tight`   — same surface, smaller padding (good for grouped list rows)
   * `hero`    — surface-1 with extra padding, used for headline cards
   * `flat`    — no background, just spacing (groups things logically without a tile)
   */
  variant?: 'default' | 'tight' | 'hero' | 'flat';
};

/**
 * Themed card primitive. Use this anywhere we'd otherwise reach for a styled
 * View with surface-1 background + radius + padding. Centralizing the look
 * here means changing card radii / colors / shadows once propagates app-wide.
 */
export function Card({ variant = 'default', style, ...rest }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return <View style={[styles[variant], style]} {...rest} />;
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  const base = {
    backgroundColor: theme.colors.surface1,
    borderRadius: radii['3xl'],
  };
  return StyleSheet.create({
    default: { ...base, padding: spacing.lg, gap: spacing.sm },
    tight: { ...base, padding: spacing.md, gap: spacing.xs },
    hero: { ...base, borderRadius: radii['4xl'], padding: spacing['2xl'], gap: spacing.sm },
    flat: { gap: spacing.sm },
  });
}
