import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';
import type { TopCategory } from '../home.types';
import { getCategoryIconChar } from '../category-icons';

type Props = {
  categories: TopCategory[] | undefined;
};

/**
 * Horizontal-scrolling pills showing the top N spending categories with the
 * percentage chip. Renders nothing when there are no categories.
 */
export function TopCategoriesPills({ categories }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!categories || categories.length === 0) return null;

  return (
    <View>
      <Text style={styles.label}>Top categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((cat) => (
          <View key={cat.name} style={styles.pill}>
            <Text style={styles.pillEmoji}>{getCategoryIconChar(cat.name)}</Text>
            <Text style={styles.pillName}>{cat.name}</Text>
            <Text style={styles.pillPercent}>{Math.round(cat.percentage)}%</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
      marginBottom: spacing.sm,
    },
    row: {
      gap: spacing.sm,
      paddingRight: spacing['2xl'],
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs + 2,
      backgroundColor: theme.colors.surface1,
      borderRadius: radii.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    pillEmoji: {
      fontSize: 14,
    },
    pillName: {
      ...typography.bodySm,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
    },
    pillPercent: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
    },
  });
}
