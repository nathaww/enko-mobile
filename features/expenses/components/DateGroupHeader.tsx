import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';

type Props = {
  label: string;
  total: number;
  currency?: string;
};

/**
 * Section header above each day-grouped block of expenses.
 *   TODAY · ETB 510
 */
export function DateGroupHeader({ label, total, currency = 'ETB' }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.total}>
        {currency} {formatAmount(total)}
      </Text>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xs,
    },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    total: {
      ...typography.labelUp,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
    },
  });
}
