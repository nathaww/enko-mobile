import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';
import type { SpendingComparison } from '../insights.types';

type Props = {
  data: SpendingComparison | undefined;
  loading?: boolean;
};

/**
 * Brand-soft accent card that surfaces the AI peer-comparison insight as the
 * headline ("23% less on food than peers" style). The full insight text from
 * the backend is the headline; the supporting line gives sample size so the
 * claim is grounded.
 */
export function PeerInsightCard({ data, loading }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (loading && !data) {
    return (
      <View style={styles.card}>
        <Text style={styles.support}>Loading insights…</Text>
      </View>
    );
  }

  if (!data || !data.insights) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Sparkles size={18} color={theme.colors.onBrand} strokeWidth={2.2} />
      </View>
      <View style={styles.text}>
        <Text style={styles.headline}>{data.insights}</Text>
        {data.comparisonUserCount > 0 ? (
          <Text style={styles.support}>
            Compared to {data.comparisonUserCount} users with similar income
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.colors.brandSoft,
      borderRadius: radii['3xl'],
      padding: spacing.lg,
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: radii.md,
      backgroundColor: theme.colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      flex: 1,
      gap: 2,
    },
    headline: {
      ...typography.titleMD,
      color: theme.colors.onSurface,
      fontSize: 14,
      letterSpacing: -0.2,
    },
    support: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontSize: 11,
    },
  });
}
