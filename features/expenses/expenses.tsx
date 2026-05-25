import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Plus, Settings2 } from 'lucide-react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { useHaptic } from '@/hooks/useHaptic';
import { radii, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';

import { listCategories } from '@/features/categories/categories-api';
import { categoriesQueryKeys } from '@/features/categories/categories.queryKeys';

import { listExpenses } from './expenses-api';
import { expensesQueryKeys } from './expenses.queryKeys';
import { useDeleteExpense } from './expenses.mutations';
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
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // NativeTabs floats above the safe-area inset on iOS 26. The home-indicator
  // height alone (insets.bottom) isn't enough vertical room; add a constant
  // for the tab-bar pill itself so the FAB sits clearly above it.
  const TAB_BAR_CLEARANCE = 80;
  const fabBottom = insets.bottom + TAB_BAR_CLEARANCE;

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

  const del = useDeleteExpense();
  const onDeleteRow = (expense: Expense) => del.mutate(expense.id);

  const monthLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long' }),
    []
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.heroSafeTop} />
      <View style={styles.hero}>
        <View style={styles.topbar}>
          <Text style={styles.title}>Expenses</Text>
          <Pressable
            onPress={() => router.push('/categories')}
            hitSlop={8}
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Manage categories"
          >
            <Settings2 size={20} color={theme.colors.onSurface} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{monthLabel} · Total</Text>
          <Text style={styles.totalValue}>
            {expensesQ.isLoading
              ? '—'
              : periodTotal === 0
              ? 'ETB 0'
              : `−ETB ${formatAmount(periodTotal)}`}
          </Text>
        </View>

        <View style={styles.filtersWrap}>
          <FilterChips
            categories={categoriesQ.data ?? []}
            activeCategoryId={categoryFilter}
            onChange={setCategoryFilter}
          />
        </View>
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
        {expensesQ.isLoading || (expensesQ.isFetching && !expensesQ.data) ? (
          <LoadingView message="Loading expenses…" />
        ) : groups.length === 0 ? (
          <EmptyState
            illustration="expenses"
            title={
              categoryFilter
                ? 'No expenses match this filter'
                : 'No expenses yet'
            }
            description={
              categoryFilter
                ? 'Try another category, or clear the filter to see everything.'
                : 'Tap the + button to log your first expense, or describe it in plain text and let the AI do the work.'
            }
            action={
              categoryFilter
                ? { label: 'Clear filter', onPress: () => setCategoryFilter(null) }
                : { label: 'Add your first expense', onPress: openAdd }
            }
          />
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
                    onDelete={onDeleteRow}
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
        // Press feedback is the deeper brand color, not opacity — opacity
        // makes the FAB look semi-transparent against the page, which the
        // user doesn't want. A solid color shift keeps the button opaque.
        style={({ pressed }) => [
          styles.fab,
          { bottom: fabBottom },
          pressed && { backgroundColor: theme.colors.brandDeep },
        ]}
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

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    heroSafeTop: { backgroundColor: theme.colors.brandSoft },
    hero: {
      backgroundColor: theme.colors.brandSoft,
      borderBottomLeftRadius: radii['5xl'],
      borderBottomRightRadius: radii['5xl'],
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      gap: spacing.md,
    },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.xs,
    },
    title: {
      ...typography.displayLG,
      color: theme.colors.onSurface,
    },
    headerBtn: {
      width: 38,
      height: 38,
      borderRadius: radii.md,
      backgroundColor: theme.colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
    },
    totalLabel: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    totalValue: {
      ...typography.titleMD,
      color: theme.colors.onSurface,
      fontFamily: typography.button.fontFamily,
      fontSize: 18,
      letterSpacing: -0.5,
    },
    filtersWrap: {
      marginHorizontal: -spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    body: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing['5xl'] + spacing['2xl'],
      gap: spacing.lg,
    },
    group: { gap: spacing.sm },
    fab: {
      position: 'absolute',
      right: spacing.xl,
      width: 58,
      height: 58,
      // Half of width/height = perfect circle. radii.pill (999) also works
      // but the explicit half is more legible and isn't doing any thinking
      // for a fixed-size element.
      borderRadius: 29,
      backgroundColor: theme.colors.brand,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.brand,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 6,
      // zIndex helps on Android where elevation can otherwise be under the tab bar
      zIndex: 50,
    },
  });
}

export default Expenses;
