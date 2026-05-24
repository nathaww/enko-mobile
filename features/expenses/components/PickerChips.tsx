import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
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
  /** When loading there are no options yet — show a hint instead. */
  loading?: boolean;
};

/**
 * Horizontal-scrolling chip picker. Used inside the add-expense sheet for
 * categories and money sources. One option always wins (no "All" affordance).
 */
export function PickerChips({ options, value, onChange, loading }: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (loading && options.length === 0) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Text style={styles.loadingText}>Loading…</Text>
      </ScrollView>
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
    loadingText: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
  });
}
