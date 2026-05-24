import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input } from '@/components/Input';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type Props = {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  error?: string;
  autoFocus?: boolean;
};

/**
 * Big "ETB  120.00" entry field. Visually emphasized via brand-soft container
 * so it reads as the headline action in the add-expense sheet.
 *
 * Stores value as a string (Formik-friendly); the form's Zod schema coerces
 * it to a number on submit. We accept a trailing decimal so users can type
 * "12." naturally without the keyboard fighting them.
 */
export function AmountInput({ value, onChange, currency = 'ETB', error, autoFocus }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const sanitize = (raw: string): string => {
    // Allow digits + at most one decimal separator + max 2 fraction digits.
    let s = raw.replace(/[^\d.]/g, '');
    const firstDot = s.indexOf('.');
    if (firstDot !== -1) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
    }
    const [whole, frac] = s.split('.');
    if (frac !== undefined && frac.length > 2) s = `${whole}.${frac.slice(0, 2)}`;
    return s;
  };

  return (
    <View style={styles.root}>
      <View style={styles.field}>
        <Text style={styles.currency}>{currency}</Text>
        <Input
          variant="display"
          value={value}
          onChangeText={(t) => onChange(sanitize(t))}
          placeholder="0.00"
          keyboardType="decimal-pad"
          autoFocus={autoFocus}
          style={styles.input}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { gap: spacing.xs },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.brandSoft,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    currency: {
      fontFamily: typography.displayMD.fontFamily,
      fontSize: 14,
      color: theme.colors.brandDeep,
      letterSpacing: 0.2,
    },
    input: {
      flex: 1,
      color: theme.colors.onSurface,
      fontSize: 28,
      paddingVertical: spacing.lg,
    },
    error: {
      ...typography.bodySm,
      color: theme.colors.chipNegOn,
      paddingHorizontal: spacing.xs,
    },
  });
}
