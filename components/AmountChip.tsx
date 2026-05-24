import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Variant = 'pos' | 'neg' | 'info' | 'brand' | 'muted';

type Props = {
  /** Visual semantics. `pos`=mint, `neg`=blush, `info`=indigo, `brand`=green, `muted`=neutral. */
  variant?: Variant;
  /** Optional leading symbol (arrow, dot, sparkle). Rendered before children. */
  leading?: string;
  /** Chip content — usually a formatted amount or short label. */
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Small pill chip used for amounts, deltas, and inline status tags.
 *
 *   <AmountChip variant="pos" leading="▲">4.2%</AmountChip>
 *   <AmountChip variant="neg">−80</AmountChip>
 *   <AmountChip variant="info">3 accounts</AmountChip>
 */
export function AmountChip({ variant = 'muted', leading, children, style }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme, variant), [theme, variant]);
  return (
    <View style={[styles.root, style]}>
      {leading ? <Text style={[styles.label, styles.leading]}>{leading}</Text> : null}
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>, variant: Variant) {
  const palette = {
    pos: { bg: theme.colors.chipPos, fg: theme.colors.chipPosOn },
    neg: { bg: theme.colors.chipNeg, fg: theme.colors.chipNegOn },
    info: { bg: theme.colors.chipInfo, fg: theme.colors.chipInfoOn },
    brand: { bg: theme.colors.brand, fg: theme.colors.onBrand },
    muted: { bg: theme.colors.surface2, fg: theme.colors.onSurfaceMuted },
  }[variant];

  return StyleSheet.create({
    root: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: palette.bg,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.md - 2,
      paddingVertical: spacing.xs + 2,
      alignSelf: 'flex-start',
    },
    label: {
      ...typography.bodySm,
      color: palette.fg,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
      lineHeight: 14,
    },
    leading: {
      // No extra style needed — gap on parent handles spacing.
    },
  });
}
