import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { AmountChip } from '@/components/AmountChip';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { spacing, typography } from '@/theme';
import { HIDDEN_AMOUNT, splitAmount } from '@/utils/formatAmount';

type Props = {
  totalBalance: number | undefined;
  currency?: string;
  /** Optional delta percentage to show as a chip. Pass undefined to hide. */
  deltaPercentage?: number;
  /** Skeleton while data is loading. */
  loading?: boolean;
};

/**
 * Total balance card on the Home screen. Eye toggle hides the digits behind
 * dots — local state for now; will sync with appSettings.hideAmounts later.
 */
export function BalanceHero({
  totalBalance,
  currency = 'ETB',
  deltaPercentage,
  loading,
}: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const [hidden, setHidden] = useState(false);
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const toggle = () => {
    haptic('light');
    setHidden((h) => !h);
  };

  const safeBalance = totalBalance ?? 0;
  const { whole, cents } = splitAmount(safeBalance);
  const showSkeleton = loading && totalBalance === undefined;

  const deltaVariant: 'pos' | 'neg' | 'muted' =
    deltaPercentage === undefined || deltaPercentage === 0
      ? 'muted'
      : deltaPercentage > 0
      ? 'pos'
      : 'neg';

  const deltaLabel =
    deltaPercentage === undefined
      ? null
      : `${deltaPercentage >= 0 ? '▲' : '▼'} ${Math.abs(deltaPercentage).toFixed(1)}%`;

  return (
    <Card variant="hero" style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.label}>Total balance</Text>
        <Pressable
          onPress={toggle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Show amount' : 'Hide amount'}
        >
          {hidden ? (
            <EyeOff size={18} color={theme.colors.onSurfaceMuted} strokeWidth={2} />
          ) : (
            <Eye size={18} color={theme.colors.onSurfaceMuted} strokeWidth={2} />
          )}
        </Pressable>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.currency}>{currency}</Text>
        {showSkeleton ? (
          <Text style={styles.whole}>—</Text>
        ) : hidden ? (
          <Text style={styles.whole}>{HIDDEN_AMOUNT}</Text>
        ) : (
          <>
            <Text style={styles.whole}>{whole}</Text>
            <Text style={styles.cents}>{cents}</Text>
          </>
        )}
      </View>

      {deltaLabel ? (
        <View style={styles.deltaRow}>
          <AmountChip variant={deltaVariant}>{deltaLabel}</AmountChip>
          <Text style={styles.deltaCaption}>vs last period</Text>
        </View>
      ) : null}
    </Card>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      gap: spacing.sm,
    },
    headRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
    },
    currency: {
      ...typography.titleMD,
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
    },
    whole: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    cents: {
      ...typography.titleLG,
      color: theme.colors.onSurfaceMuted,
      letterSpacing: -0.4,
    },
    deltaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    deltaCaption: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
  });
}
