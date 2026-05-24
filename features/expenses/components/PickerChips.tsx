import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';

type Option = {
  id: string;
  label: string;
  icon?: string;
};

type Props = {
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
  /** Message when not loading and no options exist. */
  emptyText?: string;
  /** Label for the empty-state action button. */
  emptyActionLabel?: string;
  /** Tapped from the empty-state action (e.g. navigate to manage screen). */
  onEmptyAction?: () => void;
};

/**
 * Horizontal-scrolling chip picker. Used inside the add-expense sheet for
 * categories and money sources. One option always wins (no "All" affordance).
 *
 * Empty-state behavior:
 *   - loading + no options     → "Loading…"
 *   - not loading + no options → empty message + optional action button
 *   - has options              → chips
 */
export function PickerChips({
  options,
  value,
  onChange,
  loading,
  emptyText = 'Nothing to pick yet.',
  emptyActionLabel,
  onEmptyAction,
}: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (loading && options.length === 0) {
    return (
      <View style={styles.statusWrap}>
        <Text style={styles.statusText}>Loading…</Text>
      </View>
    );
  }

  if (options.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.statusText}>{emptyText}</Text>
        {onEmptyAction && emptyActionLabel ? (
          <Pressable
            onPress={() => {
              haptic('light');
              onEmptyAction();
            }}
            style={({ pressed }) => [
              styles.actionBtn,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
          >
            <Plus size={14} color={theme.colors.onBrand} strokeWidth={2.4} />
            <Text style={styles.actionText}>{emptyActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              haptic('selection');
              onChange(option.id);
            }}
            style={({ pressed }) => [
              styles.chip,
              active && styles.chipActive,
              pressed && { opacity: 0.7 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option.icon ? `${option.icon}  ` : ''}
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: { gap: spacing.sm, paddingRight: spacing['2xl'] },
    chip: {
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    chipActive: {
      backgroundColor: theme.colors.brand,
    },
    chipText: {
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
    },
    chipTextActive: {
      color: theme.colors.onBrand,
    },
    statusWrap: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    emptyWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface2,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    statusText: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      flex: 1,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.colors.brand,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    actionText: {
      ...typography.button,
      color: theme.colors.onBrand,
      fontSize: 12,
    },
  });
}
