import React from 'react';
import { View } from 'react-native';
import { ListItem } from '@/components/ListItem';
import { AmountChip } from '@/components/AmountChip';
import { useTheme } from '@/hooks/useTheme';
import { radii } from '@/theme';
import { formatAmount } from '@/utils/formatAmount';
import {
  getCategoryColorKey,
  getCategoryIcon,
} from '@/features/home/category-icons';
import type { Expense } from '../expenses.types';

type Props = {
  expense: Expense;
  onPress: (expense: Expense) => void;
  hideDivider?: boolean;
};

/**
 * One expense row in the list. Reuses the global ListItem primitive so
 * spacing, dividers, and press behavior stay consistent with profile
 * settings, money sources, and recent activity rows.
 */
export function ExpenseListItem({ expense, onPress, hideDivider }: Props) {
  const theme = useTheme();
  const Icon = getCategoryIcon(expense.category.name);
  const colorKey = getCategoryColorKey(expense.category.name);
  const accent = theme.colors.category[colorKey];

  const subtitle = [
    expense.moneySource.name,
    formatTime(expense.date),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ListItem
      hideDivider={hideDivider}
      leading={
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
      }
      title={expense.notes || expense.category.name}
      subtitle={subtitle}
      trailing={
        <AmountChip variant="neg">
          −{formatAmount(expense.amount)}
        </AmountChip>
      }
      onPress={() => onPress(expense)}
    />
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function withAlpha(hex: string, alpha: number): string {
  if (!hex.startsWith('#')) return hex;
  const clean = hex.slice(1);
  const [r, g, b] =
    clean.length === 3
      ? [clean[0] + clean[0], clean[1] + clean[1], clean[2] + clean[2]]
      : [clean.slice(0, 2), clean.slice(2, 4), clean.slice(4, 6)];
  return `rgba(${parseInt(r, 16)},${parseInt(g, 16)},${parseInt(b, 16)},${alpha})`;
}
