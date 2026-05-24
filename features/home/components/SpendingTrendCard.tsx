import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polyline, Polygon } from 'react-native-svg';
import { Card } from '@/components/Card';
import { AmountChip } from '@/components/AmountChip';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';
import type { ExpenseTrendPoint, Period } from '../home.types';

type Props = {
  points: ExpenseTrendPoint[] | undefined;
  period: Period;
  loading?: boolean;
};

const PERIOD_LABEL: Record<Period, string> = {
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

const CHART_W = 280;
const CHART_H = 60;
const PADDING_Y = 6;

/**
 * Spending-trend mini chart. Uses react-native-svg directly so we don't pull
 * in a heavyweight chart library for what's essentially a sparkline.
 */
export function SpendingTrendCard({ points, period, loading }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const { line, area } = useMemo(() => {
    if (!points || points.length === 0) return { line: '', area: '' };
    const max = Math.max(...points.map((p) => p.amount));
    const min = Math.min(...points.map((p) => p.amount));
    const range = max - min || 1;

    const stepX = CHART_W / Math.max(points.length - 1, 1);
    const innerH = CHART_H - PADDING_Y * 2;

    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y = PADDING_Y + innerH - ((p.amount - min) / range) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const line = coords.join(' ');
    const area = `0,${CHART_H} ${line} ${CHART_W},${CHART_H}`;
    return { line, area };
  }, [points]);

  const hasData = !!points && points.length > 1;

  return (
    <Card variant="default" style={styles.card}>
      <View style={styles.headRow}>
        <Text style={styles.label}>Spending trend</Text>
        <AmountChip variant="muted">{PERIOD_LABEL[period]}</AmountChip>
      </View>

      <View style={styles.chartWrap}>
        {hasData ? (
          <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none">
            <Polygon points={area} fill={theme.colors.brandSoft} />
            <Polyline
              points={line}
              fill="none"
              stroke={theme.colors.brand}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading…' : 'Not enough data yet.'}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {},
    headRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    chartWrap: {
      height: CHART_H,
      width: '100%',
      marginTop: spacing.sm,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
  });
}
