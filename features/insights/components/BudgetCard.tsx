import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';
import type { BudgetComparisonItem } from '../insights.types';

type Props = {
  data: BudgetComparisonItem[] | undefined;
  loading?: boolean;
};

/**
 * Budget vs actual per money source. Each row shows the source name on the
 * left and either the remaining-percentage or an "over" label on the right;
 * the progress bar fills with brand green within budget and switches to
 * the negative-chip color once spending exceeds the budget.
 *
 * Backend returns per-money-source comparisons (not per-category as the
 * wireframe shows) — sticking with the backend shape since that's what the
 * data actually is.
 */
export function BudgetCard({ data, loading }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const items = data ?? [];

  return (
    <Card variant="default" style={styles.card}>
      <Text style={styles.label}>Budget vs actual</Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>
          {loading ? 'Loading…' : 'No budgets set yet.'}
        </Text>
      ) : (
        <View style={styles.rows}>
          {items.map((item) => {
            // remainingPercentage is positive when within budget, negative
            // when over. For the bar fill we want the *spent* percentage
            // (capped at 100 for the visual, but tagged "over" when past).
            const isOver = item.remainingPercentage < 0;
            const spentPct = item.budget > 0
              ? Math.min(100, (item.expense / item.budget) * 100)
              : 0;
            const fillColor = isOver
              ? theme.colors.chipNegOn
              : theme.colors.brand;
            return (
              <View key={item.moneySource} style={styles.row}>
                <View style={styles.rowHead}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.moneySource}
                  </Text>
                  <Text
                    style={[
                      styles.value,
                      isOver && { color: theme.colors.chipNegOn },
                    ]}
                  >
                    {isOver ? 'over' : `${Math.round(spentPct)}%`}
                  </Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${spentPct}%`, backgroundColor: fillColor },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: { gap: spacing.md },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    rows: { gap: spacing.md },
    row: { gap: 6 },
    rowHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    name: {
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
    value: {
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
    track: {
      height: 6,
      borderRadius: radii.pill,
      backgroundColor: theme.colors.surface2,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: radii.pill,
    },
    empty: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
  });
}
