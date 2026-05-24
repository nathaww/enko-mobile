import { api } from '@/api/axios';
import type {
  BudgetComparison,
  ExpenseComposition,
  SpendingComparison,
} from './insights.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getExpenseComposition(): Promise<ExpenseComposition> {
  if (useDevStub) {
    await delay(250);
    return {
      categoryBreakdown: [
        { category: 'Food & Dining', amount: 1730, percentage: 42 },
        { category: 'Transportation', amount: 740, percentage: 18 },
        { category: 'Shopping', amount: 740, percentage: 18 },
        { category: 'Entertainment', amount: 490, percentage: 12 },
        { category: 'Utilities', amount: 420, percentage: 10 },
      ],
    };
  }
  const res = await api.get<ExpenseComposition>('/dashboard/expense-composition');
  return res.data;
}

export async function getBudgetComparison(): Promise<BudgetComparison> {
  if (useDevStub) {
    await delay(250);
    return {
      comparisons: [
        {
          moneySource: 'CBE',
          budget: 5000,
          expense: 4000,
          remaining: 1000,
          remainingPercentage: 20,
        },
        {
          moneySource: 'Cash',
          budget: 1000,
          expense: 400,
          remaining: 600,
          remainingPercentage: 60,
        },
        {
          moneySource: 'Awash',
          budget: 2000,
          expense: 2200,
          remaining: -200,
          remainingPercentage: -10,
        },
      ],
      totalBudget: 8000,
      totalExpense: 6600,
      totalRemaining: 1400,
    };
  }
  const res = await api.get<BudgetComparison>('/dashboard/budget-comparison');
  return res.data;
}

export async function getSpendingComparison(): Promise<SpendingComparison> {
  if (useDevStub) {
    await delay(300);
    return {
      insights: '23% less on food than peers',
      categoryComparisons: [
        {
          categoryName: 'Food & Dining',
          userAmount: 1730,
          averageAmount: 2245,
          percentageDifference: -23,
          currency: 'ETB',
        },
        {
          categoryName: 'Transportation',
          userAmount: 740,
          averageAmount: 600,
          percentageDifference: 23,
          currency: 'ETB',
        },
      ],
      overallDifferencePercentage: -8.5,
      comparisonUserCount: 42,
      userMonthlySpending: 4120,
      averageMonthlySpending: 4504,
      currency: 'ETB',
    };
  }
  const res = await api.get<SpendingComparison>('/user-insights/spending-comparison');
  return res.data;
}
