import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { Segmented } from '@/components/Segmented';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

import {
  getExpensesOverview,
  getRecentExpenses,
  getTotalBalance,
  getTrends,
} from './home-api';
import { homeQueryKeys } from './home.queryKeys';
import type { Period } from './home.types';

import { HomeHeader } from './components/HomeHeader';
import { BalanceHero } from './components/BalanceHero';
import { TopCategoriesPills } from './components/TopCategoriesPills';
import { SpendingTrendCard } from './components/SpendingTrendCard';
import { RecentActivityCard } from './components/RecentActivityCard';

const PERIOD_OPTIONS = [
  { label: 'Week', value: 'week' as const },
  { label: 'Month', value: 'month' as const },
  { label: 'Year', value: 'year' as const },
];

/**
 * Home / dashboard tab. Greets the user, shows their total balance, top
 * categories, spending trend, and recent activity. All server state goes
 * through React Query so caching + revalidation are handled automatically.
 */
export function Home() {
  const theme = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<Period>('month');
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Bundle all dashboard queries so we can flip a single `refreshing` flag
  // from one place and they share request lifecycle.
  const results = useQueries({
    queries: [
      {
        queryKey: homeQueryKeys.totalBalance(period),
        queryFn: () => getTotalBalance(period),
      },
      {
        queryKey: homeQueryKeys.expensesOverview(period),
        queryFn: () => getExpensesOverview(period),
      },
      {
        queryKey: homeQueryKeys.trends(),
        queryFn: getTrends,
      },
      {
        queryKey: homeQueryKeys.recent(5),
        queryFn: () => getRecentExpenses(5),
      },
    ],
  });

  const [balanceQ, overviewQ, trendsQ, recentQ] = results;
  const isAnyLoading = results.some((r) => r.isLoading);
  const isAnyRefetching = results.some((r) => r.isRefetching);

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: homeQueryKeys.all() });
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'there';
  const greeting = greetingForTimeOfDay();

  const trendsPoints =
    period === 'week' ? trendsQ.data?.weeklyTrends : trendsQ.data?.monthlyTrends;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerWrap}>
        <HomeHeader
          greeting={greeting}
          name={firstName}
          onPressNotifications={() => {
            /* TODO: notifications screen */
          }}
          onPressSettings={() => router.push('/(tabs)/profile')}
          hasUnreadNotifications={false}
        />
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isAnyRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand}
          />
        }
      >
        <BalanceHero
          totalBalance={balanceQ.data?.totalBalance}
          currency={balanceQ.data?.currency}
          loading={isAnyLoading}
        />

        <Segmented<Period>
          options={PERIOD_OPTIONS}
          value={period}
          onChange={setPeriod}
          accessibilityLabel="Period"
        />

        <TopCategoriesPills categories={overviewQ.data?.topCategories} />

        <SpendingTrendCard points={trendsPoints} period={period} loading={trendsQ.isLoading} />

        <RecentActivityCard
          expenses={recentQ.data}
          loading={recentQ.isLoading}
          onPressSeeAll={() => router.push('/(tabs)/expenses')}
        />
      </ScrollView>
    </View>
  );
}

function greetingForTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    headerWrap: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    body: {
      flexGrow: 1,
      paddingHorizontal: spacing['2xl'],
      paddingBottom: spacing['2xl'],
      gap: spacing.lg,
    },
  });
}

export default Home;
