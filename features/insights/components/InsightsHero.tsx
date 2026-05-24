import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Props = {
  /** Subtitle showing the date range covered by the cards below. */
  rangeLabel: string;
};

/**
 * Hero panel for the Insights tab. Same brand-soft rounded-bottom shape as
 * the Money and Expenses heroes so the financial tabs share a visual rhythm.
 * Wireframe places an arrow-up icon top-right, but it has no clear action
 * yet, so the topbar stays empty until we have something to put there.
 */
export function InsightsHero({ rangeLabel }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <Text style={styles.heading}>Insights</Text>
      </View>
      <Text style={styles.range}>{rangeLabel}</Text>
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
      paddingBottom: spacing.lg,
      gap: spacing.xs,
    },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.xs,
    },
    heading: {
      ...typography.displayLG,
      color: theme.colors.onSurface,
    },
    range: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
    },
  });
}
