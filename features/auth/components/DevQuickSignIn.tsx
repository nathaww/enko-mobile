import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

type DevAccount = {
  label: string;
  email: string;
};

/**
 * Dev-only quick sign-in panel. One tap submits with a seeded backend
 * account so we do not have to type credentials during development.
 *
 * Render only when `__DEV__` is true so the Metro bundler strips this from
 * production builds (the parent does the gating; this component does not
 * check `__DEV__` itself so we can also reuse it under a manual dev-menu).
 */

// All seeded users share the same password (see enko-backend/prisma/seed.ts).
const DEV_PASSWORD = 'password123';

const DEV_ACCOUNTS: readonly DevAccount[] = [
  { label: 'Jane', email: 'jane@example.com' },
  { label: 'Michael', email: 'michael@example.com' },
  { label: 'Sarah', email: 'sarah@example.com' },
  { label: 'Alex', email: 'alex@example.com' },
];

type Props = {
  onSignIn: (email: string, password: string) => void;
  disabled?: boolean;
};

export function DevQuickSignIn({ onSignIn, disabled }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerLabel}>Dev quick sign-in</Text>
        <View style={styles.line} />
      </View>
      <View style={styles.row}>
        {DEV_ACCOUNTS.map((account) => (
          <Pressable
            key={account.email}
            onPress={() => onSignIn(account.email, DEV_PASSWORD)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.chip,
              pressed && styles.chipPressed,
              disabled && styles.chipDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Sign in as ${account.label}`}
          >
            <Text style={styles.chipText}>{account.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: {
      gap: spacing.md,
      paddingTop: spacing.sm,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    line: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.outlineSoft,
    },
    dividerLabel: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceDim,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      justifyContent: 'center',
    },
    chip: {
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.outlineSoft,
    },
    chipPressed: {
      backgroundColor: theme.colors.brandSoft,
      borderColor: 'transparent',
    },
    chipDisabled: {
      opacity: 0.4,
    },
    chipText: {
      ...typography.button,
      fontSize: 12,
      color: theme.colors.onSurface,
    },
  });
}
