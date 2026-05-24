import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { AmountChip } from '@/components/AmountChip';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';
import { splitAmount } from '@/utils/formatAmount';

type Props = {
  netWorth: number;
  currency: string;
  accountCount: number;
  loading?: boolean;
  onAdd: () => void;
};

/**
 * Hero panel for the Money tab. Mirrors the wireframe's brand-washed top
 * region: empty top-left slot, + icon top-right, big "Net worth" label,
 * giant balance, account-count chip underneath.
 */
export function MoneyHero({
  netWorth,
  currency,
  accountCount,
  loading,
  onAdd,
}: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const { whole, cents } = splitAmount(netWorth);

  const handleAdd = () => {
    haptic('medium');
    onAdd();
  };

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Text style={styles.heading}>Money</Text>
        <Pressable
          onPress={handleAdd}
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Add account"
        >
          <Plus size={20} color={theme.colors.onSurface} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Text style={styles.label}>Net worth</Text>

      <View style={styles.amountRow}>
        <Text style={styles.currency}>{currency}</Text>
        {loading ? (
          <Text style={styles.whole}>—</Text>
        ) : (
          <>
            <Text style={styles.whole}>{whole}</Text>
            <Text style={styles.cents}>{cents}</Text>
          </>
        )}
      </View>

      <View style={styles.countRow}>
        <AmountChip variant="info">
          {accountCount} {accountCount === 1 ? 'account' : 'accounts'}
        </AmountChip>
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      backgroundColor: theme.colors.brandSoft,
      borderBottomLeftRadius: radii['5xl'],
      borderBottomRightRadius: radii['5xl'],
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.xs,
    },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.sm,
    },
    heading: {
      ...typography.displayLG,
      color: theme.colors.onSurface,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
      paddingTop: spacing.sm,
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
      ...typography.displayLG,
      color: theme.colors.onSurface,
    },
    cents: {
      ...typography.titleLG,
      color: theme.colors.onSurfaceMuted,
      letterSpacing: -0.4,
    },
    countRow: {
      flexDirection: 'row',
      marginTop: spacing.xs,
    },
  });
}
