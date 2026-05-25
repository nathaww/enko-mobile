import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { fontFamily, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';
import { getCategoryColorKey } from '../category-icons';
import type { CategoryExpense } from '../home.types';

type Props = {
  data: CategoryExpense[] | undefined;
  loading?: boolean;
};

const DONUT_RADIUS = 74;
const INNER_RADIUS = 52;

/**
 * Donut chart + legend powered by react-native-gifted-charts. We feed it
 * raw amounts and percentages; it handles the geometry, animation, and
 * inner-radius hole. Center content (Total label + amount) is rendered
 * via `centerLabelComponent` so it stays vertically + horizontally
 * pinned no matter the slice count.
 *
 * Colors come from the theme's category palette via getCategoryColorKey
 * so a "Food" wedge matches the food-category icon dot elsewhere in the
 * app.
 */
export function CompositionCard({ data, loading }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const items = data ?? [];

  const pieData = useMemo(() => {
    return items.map((item) => {
      const colorKey = getCategoryColorKey(item.category);
      const color = theme.colors.category[colorKey];
      return {
        value: item.amount,
        color,
      };
    });
  }, [items, theme]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.amount, 0),
    [items]
  );

  return (
    <Card variant="default" style={styles.card}>
      <Text style={styles.label}>Composition</Text>

      <View style={styles.body}>
        <View style={styles.donutWrap}>
          {loading || pieData.length === 0 ? (
            <View style={styles.donutPlaceholder} />
          ) : (
            <PieChart
              donut
              data={pieData}
              radius={DONUT_RADIUS}
              innerRadius={INNER_RADIUS}
              innerCircleColor={theme.colors.surface1}
              backgroundColor={theme.colors.surface1}
              isAnimated
              animationDuration={900}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerCaption}>Total</Text>
                  <Text style={styles.centerAmount} numberOfLines={1}>
                    {formatAmount(total).split('.')[0]}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.legend}>
          {items.length === 0 ? (
            <Text style={styles.empty}>
              {loading ? 'Loading…' : 'No expenses yet.'}
            </Text>
          ) : (
            items.slice(0, 5).map((item) => {
              const colorKey = getCategoryColorKey(item.category);
              const color = theme.colors.category[colorKey];
              return (
                <View key={item.category} style={styles.legendRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={styles.legendPct}>
                    {Math.round(item.percentage)}%
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </Card>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  const DONUT_BOX = DONUT_RADIUS * 2;
  return StyleSheet.create({
    card: { gap: spacing.md },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    body: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    donutWrap: {
      width: DONUT_BOX,
      height: DONUT_BOX,
      alignItems: 'center',
      justifyContent: 'center',
    },
    donutPlaceholder: {
      width: DONUT_BOX,
      height: DONUT_BOX,
      borderRadius: DONUT_BOX / 2,
      backgroundColor: theme.colors.surface2,
    },
    centerLabel: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    centerCaption: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
      fontSize: 9,
      letterSpacing: 1.2,
    },
    centerAmount: {
      fontFamily: fontFamily.display,
      fontSize: 22,
      letterSpacing: -0.8,
      color: theme.colors.onSurface,
    },
    legend: {
      flex: 1,
      gap: spacing.sm,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendName: {
      flex: 1,
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
    legendPct: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
      fontSize: 12,
    },
    empty: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
  });
}
