import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';

import { SettingsSection } from '@/components/SettingsSection';
import { ListItem } from '@/components/ListItem';
import { AmountChip } from '@/components/AmountChip';
import { SwipeToDelete } from '@/components/SwipeToDelete';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';

import { listCategories } from './categories-api';
import { categoriesQueryKeys } from './categories.queryKeys';
import { useDeleteCategory } from './categories.mutations';
import { AddCategorySheet } from './components/AddCategorySheet';
import type { Category } from './categories.types';

/**
 * Categories management screen. Lists default (system) categories and any
 * user-created custom ones. Tap + to open the AddCategorySheet. Custom rows
 * swipe right to delete (with confirmation); default rows can't be removed.
 */
export function Categories() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const categoriesQ = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });

  const del = useDeleteCategory();

  const defaults = categoriesQ.data?.filter((c) => c.isDefault) ?? [];
  const customs = categoriesQ.data?.filter((c) => !c.isDefault) ?? [];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Back"
          >
            <ChevronLeft size={22} color={theme.colors.onSurface} strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.title}>Categories</Text>
          <Pressable
            onPress={() => setSheetOpen(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Add category"
          >
            <Plus size={22} color={theme.colors.onSurface} strokeWidth={2.2} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {categoriesQ.isLoading
            ? 'Loading…'
            : `${defaults.length} default · ${customs.length} custom`}
        </Text>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection label="Default">
          {defaults.length === 0 ? (
            <EmptyRow text={categoriesQ.isLoading ? 'Loading…' : 'No default categories.'} />
          ) : (
            defaults.map((cat, i) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                hideDivider={i === defaults.length - 1}
              />
            ))
          )}
        </SettingsSection>

        <SettingsSection label="Custom">
          {customs.length === 0 ? (
            <EmptyRow text="No custom categories yet. Tap + to add one." />
          ) : (
            customs.map((cat, i) => (
              <SwipeToDelete
                key={cat.id}
                onDelete={() => del.mutate(cat.id)}
                confirmTitle="Delete category?"
                confirmDescription="Expenses tagged with it will keep their record but lose this label."
              >
                <CategoryRow
                  category={cat}
                  hideDivider={i === customs.length - 1}
                />
              </SwipeToDelete>
            ))
          )}
        </SettingsSection>
      </ScrollView>

      <AddCategorySheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

function CategoryRow({
  category,
  hideDivider,
  onPress,
}: {
  category: Category;
  hideDivider?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <ListItem
      hideDivider={hideDivider}
      leading={
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: theme.colors.surface2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>{category.icon ?? '·'}</Text>
        </View>
      }
      title={category.name}
      trailing={
        category.isDefault ? <AmountChip variant="muted">Default</AmountChip> : undefined
      }
      onPress={onPress}
    />
  );
}

function EmptyRow({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.xs }}>
      <Text style={{ ...typography.bodySm, color: theme.colors.onSurfaceMuted }}>
        {text}
      </Text>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    headerWrap: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.xs,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      ...typography.titleLG,
      color: theme.colors.onSurface,
    },
    subtitle: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      paddingHorizontal: spacing.xs,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      paddingHorizontal: spacing['2xl'],
      paddingBottom: spacing['3xl'],
      gap: spacing.xl,
    },
  });
}

export default Categories;
