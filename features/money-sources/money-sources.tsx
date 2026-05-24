import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { LoadingView } from '@/components/LoadingView';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/theme';

import { listMoneySources } from './money-sources-api';
import { moneySourcesQueryKeys } from './money-sources.queryKeys';
import type { MoneySource } from './money-sources.types';

import { MoneyHero } from './components/MoneyHero';
import { MoneySourceCardStack } from './components/MoneySourceCardStack';
import { AddMoneySourceSheet } from './components/AddMoneySourceSheet';

/**
 * Money tab. Shows net worth across all sources and a swipeable card stack
 * (Apple Wallet style) for the accounts themselves. The default account
 * leads the stack on first render; either swipe direction or the bottom
 * arrow controls cycle the front card to the back. Tapping the front card
 * opens the edit sheet. CRUD lives in AddMoneySourceSheet — add/edit/delete
 * all flow through it.
 */
export function MoneySources() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<MoneySource | null>(null);

  const sourcesQ = useQuery({
    queryKey: moneySourcesQueryKeys.list(),
    queryFn: listMoneySources,
  });

  const rawSources = sourcesQ.data ?? [];

  // Put the default source first so it leads the stack. Stable ordering after
  // that — the user can cycle the front card to the back via gesture/buttons.
  const sources = useMemo(() => {
    const defaultFirst = [...rawSources].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
    return defaultFirst;
  }, [rawSources]);

  const defaultSource = sources.find((s) => s.isDefault) ?? sources[0];

  // Net worth across all sources. Currency display falls back to the default
  // source's currency since we don't run FX conversion in v1 — the net-worth
  // figure assumes everything is the same currency, which matches the way
  // the rest of the app treats amounts today.
  const netWorth = sources.reduce((sum, s) => sum + s.balance, 0);
  const currency = defaultSource?.currency ?? 'ETB';

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (source: MoneySource) => {
    setEditing(source);
    setSheetOpen(true);
  };

  const onRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: moneySourcesQueryKeys.all() });
  };

  const isLoading = sourcesQ.isLoading;
  const isEmpty = !isLoading && sources.length === 0;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeTop} />

      <ScrollView
        contentContainerStyle={styles.body}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={sourcesQ.isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.brand}
          />
        }
      >
        <MoneyHero
          netWorth={netWorth}
          currency={currency}
          accountCount={sources.length}
          loading={isLoading}
          onAdd={openAdd}
        />

        <View style={styles.content}>
          {isLoading ? (
            <LoadingView message="Loading accounts…" />
          ) : isEmpty ? (
            <EmptyState
              illustration="expenses"
              title="No accounts yet"
              description="Add the bank, cash, or card you use to track expenses against."
              action={{ label: 'Add your first account', onPress: openAdd }}
            />
          ) : (
            <>
              <MoneySourceCardStack sources={sources} onCardPress={openEdit} />

              {defaultSource ? (
                <View style={styles.actionsRow}>
                  <Button
                    label="Edit default"
                    variant="tonal"
                    onPress={() => openEdit(defaultSource)}
                    style={styles.actionBtn}
                  />
                  <Button
                    label="+ Add account"
                    onPress={openAdd}
                    style={styles.actionBtn}
                  />
                </View>
              ) : null}

              {sources.length > 1 ? (
                <Text style={styles.hint}>
                  Tap the card to edit. Swipe or use the arrows to cycle.
                </Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>

      <AddMoneySourceSheet
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
    safeTop: { backgroundColor: theme.colors.brandSoft },
    body: {
      paddingBottom: spacing['5xl'] + spacing['2xl'],
    },
    content: {
      paddingHorizontal: spacing['2xl'],
      paddingTop: spacing['3xl'],
      gap: spacing.lg,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    actionBtn: { flex: 1 },
    hint: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      textAlign: 'center',
      fontSize: 12,
      marginTop: spacing.xs,
    },
  });
}

export default MoneySources;
