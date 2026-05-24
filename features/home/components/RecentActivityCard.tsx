import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { AmountChip } from '@/components/AmountChip';
import { useTheme } from '@/hooks/useTheme';
import { radii, spacing, typography } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';
import { getCategoryColorKey, getCategoryIcon } from '../category-icons';
import type { RecentExpense } from '../home.types';

type Props = {
  expenses: RecentExpense[] | undefined;
  loading?: boolean;
  onPressSeeAll?: () => void;
};

/**
 * Card with the last N expenses + a "See all" link to the Expenses tab.
 */
export function RecentActivityCard({ expenses, loading, onPressSeeAll }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Card variant="default">
      <View style={styles.headRow}>
        <Text style={styles.label}>Recent activity</Text>
        {expenses && expenses.length > 0 ? (
          <Pressable onPress={onPressSeeAll} hitSlop={6}>
            <Text style={styles.link}>See all →</Text>
          </Pressable>
        ) : null}
      </View>

      {!expenses || expenses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {loading ? 'Loading recent expenses…' : 'No expenses yet. Tap + to log your first.'}
          </Text>
        </View>
      ) : (
        <View>
          {expenses.map((expense, i) => (
            <ListItem
              key={expense.id}
              hideDivider={i === expenses.length - 1}
              leading={<CategoryIcon expense={expense} />}
              title={expense.notes || expense.category.name}
              subtitle={`${expense.moneySource.name} · ${formatRelativeTime(expense.date)}`}
              trailing={<AmountChip variant="neg">−{formatAmount(expense.amount)}</AmountChip>}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

function CategoryIcon({ expense }: { expense: RecentExpense }) {
  const theme = useTheme();
  const Icon = getCategoryIcon(expense.category.name);
  const colorKey = getCategoryColorKey(expense.category.name);
  const accent = theme.colors.category[colorKey];

  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: radii.md,
        backgroundColor: withAlpha(accent, 0.18),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={18} color={accent} strokeWidth={2} />
    </View>
  );
}

/**
 * Convert a hex color to an rgba string with the given alpha.
 * Skips conversion for non-hex (which fall back to the input).
 */
function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  const clean = hex.slice(1);
  const [r, g, b] =
    clean.length === 3
      ? [clean[0] + clean[0], clean[1] + clean[1], clean[2] + clean[2]]
      : [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)];
  return `rgba(${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)},${alpha})`;
}

function formatRelativeTime(isoDate: string): string {
  const ts = new Date(isoDate).getTime();
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    headRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.xs,
    },
    label: {
      ...typography.labelUp,
      color: theme.colors.onSurfaceMuted,
    },
    link: {
      ...typography.bodySm,
      color: theme.colors.brand,
      fontFamily: typography.button.fontFamily,
    },
    empty: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...typography.bodySm,
      color: theme.colors.onSurfaceMuted,
      textAlign: 'center',
    },
  });
}
