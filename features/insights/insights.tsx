import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueries, useQueryClient } from '@tanstack/react-query';

import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

import {
  getBudgetComparison,
  getExpenseComposition,
  getSpendingComparison,
} from './insights-api';
import { insightsQueryKeys } from './insights.queryKeys';

import { InsightsHero } from './components/InsightsHero';
import { CompositionCard } from './components/CompositionCard';
import { BudgetCard } from './components/BudgetCard';
import { PeerInsightCard } from './components/PeerInsightCard';

/**
 * Insights tab. Bundles three independent backend queries — expense
 * composition, budget vs actual, and the peer spending comparison — so
 * one pull-to-refresh revalidates the whole screen and a single loading
 * state covers the cold-start moment.
 *
 * Period segmented control (Week/Month/Year) from the wireframe is
 * deliberately skipped for now: the composition + budget endpoints don't
 * accept a period parameter, so the control would be visual-only. Add it
 * once those endpoints take a period.
 */
export function Insights() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const results = useQueries({
    queries: [
      {
        queryKey: insightsQueryKeys.composition(),
        queryFn: getExpenseComposition,
      },
      {
        queryKey: insightsQueryKeys.budget(),
        queryFn: getBudgetComparison,
      },
      {
        queryKey: insightsQueryKeys.peerComparison(),
        queryFn: getSpendingComparison,
      },
    ],
  });

  const [compositionQ, budgetQ, peerQ] = results;
  const isAnyRefetching = results.some((r) => r.isRefetching);
  const isAnyLoading = results.some((r) => r.isLoading);

  const rangeLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: insightsQueryKeys.all() });
  };

  // Everything's empty? Show one empty state instead of three half-empty cards.
  const hasNoData =
    !isAnyLoading &&
    (compositionQ.data?.categoryBreakdown?.length ?? 0) === 0 &&
    (budgetQ.data?.comparisons?.length ?? 0) === 0;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop} />

      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isAnyRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand}
          />
        }
      >
        <InsightsHero rangeLabel={rangeLabel} />

        <View style={styles.content}>
          {hasNoData ? (
            <EmptyState
              illustration="expenses"
              title="Nothing to summarize yet"
              description="Log a few expenses and set budgets on your accounts. Insights show up once there's enough data to compare."
            />
          ) : (
            <>
              <CompositionCard
                data={compositionQ.data?.categoryBreakdown}
                loading={compositionQ.isLoading}
              />
              <BudgetCard
                data={budgetQ.data?.comparisons}
                loading={budgetQ.isLoading}
              />
              <PeerInsightCard data={peerQ.data} loading={peerQ.isLoading} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.surface },
    safeTop: { backgroundColor: theme.colors.brandSoft },
    body: {
      paddingBottom: spacing['5xl'] + spacing['2xl'],
    },
    content: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing.lg,
      gap: spacing.md,
    },
  });
}

export default Insights;
