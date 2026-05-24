import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';

import { listCategories } from '@/features/categories/categories-api';
import { categoriesQueryKeys } from '@/features/categories/categories.queryKeys';

import { listExpenses } from './expenses-api';
import { expensesQueryKeys } from './expenses.queryKeys';
import { groupExpensesByDate } from './groupByDate';
import type { Expense, ExpenseFilters } from './expenses.types';

import { ExpenseListItem } from './components/ExpenseListItem';
import { DateGroupHeader } from './components/DateGroupHeader';
import { FilterChips } from './components/FilterChips';
import { AddExpenseSheet } from './components/AddExpenseSheet';

/**
 * Expenses tab. List, filter, add, edit, delete — all routes through the
 * AddExpenseSheet which knows whether it's in add or edit mode based on
 * whether `editing` is set.
 */
export function Expenses() {
  const theme = useTheme();
  const haptic = useHaptic();
  const queryClient = useQueryClient();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [filters] = useState<ExpenseFilters>({});
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const fullFilters = useMemo<ExpenseFilters>(
    () => ({
      ...filters,
      ...(categoryFilter ? { categoryId: categoryFilter } : {}),
    }),
    [filters, categoryFilter]
  );

  const expensesQ = useQuery({
    queryKey: expensesQueryKeys.list(fullFilters),
    queryFn: () => listExpenses(fullFilters),
  });

  const categoriesQ = useQuery({
    queryKey: categoriesQueryKeys.list(),
    queryFn: listCategories,
  });

  const groups = useMemo(
    () => groupExpensesByDate(expensesQ.data ?? []),
    [expensesQ.data]
  );

  const periodTotal = useMemo(
    () => groups.reduce((sum, g) => sum + g.total, 0),
    [groups]
  );

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: expensesQueryKeys.all() });
  };

  const openAdd = () => {
    haptic('medium');
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (expense: Expense) => {
    haptic('light');
    setEditing(expense);
    setSheetOpen(true);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <Text style={styles.title}>Expenses</Text>
        <Text style={styles.subtitle}>
          {expensesQ.isLoading
            ? 'Loading…'
            : `−ETB ${formatAmount(periodTotal)} this period`}
        </Text>
      </SafeAreaView>

      <View style={styles.filtersWrap}>
        <FilterChips
          categories={categoriesQ.data ?? []}
          activeCategoryId={categoryFilter}
          onChange={setCategoryFilter}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={expensesQ.isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand}
          />
        }
      >
        {groups.length === 0 && !expensesQ.isLoading ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          groups.map((group) => (
            <View key={group.key} style={styles.group}>
              <DateGroupHeader label={group.label} total={group.total} />
              <Card variant="tight">
                {group.items.map((expense, i) => (
                  <ExpenseListItem
                    key={expense.id}
                    expense={expense}
                    onPress={openEdit}
                    hideDivider={i === group.items.length - 1}
                  />
                ))}
              </Card>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable
        onPress={openAdd}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
      >
        <Plus size={26} color={theme.colors.onBrand} strokeWidth={2.4} />
      </Pressable>

      <AddExpenseSheet
        visible={sheetOpen}
        editing={editing}
        onClose={() => setSheetOpen(false)}
      />
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['5xl'],
        gap: spacing.md,
      }}
    >
      <Text
        style={{
          ...typography.titleMD,
          color: theme.colors.onSurface,
          textAlign: 'center',
        }}
      >
        No expenses yet
      </Text>
      <Text
        style={{
          ...typography.bodySm,
          color: theme.colors.onSurfaceMuted,
          textAlign: 'center',
          maxWidth: 240,
        }}
      >
        Tap the + button to log your first expense, or describe it in plain text and let the AI do the work.
      </Text>
      <Pressable
        onPress={onAdd}
        style={({ pressed }) => [
          {
            backgroundColor: theme.colors.brand,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: radii.pill,
            marginTop: spacing.sm,
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text
          style={{
            ...typography.button,
            color: theme.colors.onBrand,
          }}
        >
          Add your first expense
        </Text>
      </Pressable>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    headerWrap: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      gap: spacing.xs,
    },
    title: {
      ...typography.displayXL,
      color: theme.colors.onSurface,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.onSurfaceMuted,
    },
    filtersWrap: {
      paddingHorizontal: spacing['2xl'],
      paddingVertical: spacing.md,
    },
    body: {
      paddingHorizontal: spacing['2xl'],
      paddingBottom: spacing['5xl'] + spacing['2xl'],
      gap: spacing.lg,
    },
    group: { gap: spacing.sm },
    fab: {
      position: 'absolute',
      bottom: spacing['3xl'],
      right: spacing['2xl'],
      width: 58,
      height: 58,
      borderRadius: radii['2xl'],
      backgroundColor: theme.colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.brand,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 6,
    },
  });
}

export default Expenses;
