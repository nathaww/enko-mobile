import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';
import type { Category } from '@/features/categories/categories.types';

type Props = {
  categories: Category[];
  activeCategoryId: string | null;
  onChange: (categoryId: string | null) => void;
};

/**
 * Horizontal "All" + per-category chip strip above the expense list.
 * Tapping "All" clears the filter; tapping any category narrows the list.
 */
export function FilterChips({ categories, activeCategoryId, onChange }: Props) {
  const theme = useTheme();
  const haptic = useHaptic();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const onPick = (id: string | null) => {
    haptic('selection');
    onChange(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip label="All" active={activeCategoryId === null} onPress={() => onPick(null)} />
      {categories.map((cat) => (
        <Chip
          key={cat.id}
          label={cat.icon ? `${cat.icon}  ${cat.name}` : cat.name}
          active={activeCategoryId === cat.id}
          onPress={() => onPick(cat.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    row: {
      gap: spacing.sm,
      paddingRight: spacing['2xl'],
    },
    chip: {
      backgroundColor: theme.colors.surface1,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderWidth: 1,
      borderColor: theme.colors.outlineSoft,
    },
    chipActive: {
      backgroundColor: theme.colors.onSurface,
      borderColor: 'transparent',
    },
    chipText: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      fontFamily: typography.button.fontFamily,
    },
    chipTextActive: {
      color: theme.colors.surface,
    },
  });
}
