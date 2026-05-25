/**
 * Mirrors the deployed backend's dashboard DTOs. Keep this file in sync with
 * enko-backend/src/dashboard/dto/dashboard.dto.ts when the API changes.
 */

export type Period = 'week' | 'month' | 'year';

export type DashboardOverview = {
  totalExpenses: number;
  totalBudget: number;
  totalBalance: number;
  budgetUtilization: number;
};

export type ExpenseTrendPoint = {
  date: string;
  amount: number;
};

export type DashboardTrends = {
  monthlyTrends: ExpenseTrendPoint[];
  weeklyTrends: ExpenseTrendPoint[];
};

export type MoneySourceBalance = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  percentageChange: number;
};

export type TotalBalance = {
  totalBalance: number;
  currency: string;
  moneySources: MoneySourceBalance[];
};

export type RecentExpense = {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  category: { id: string; name: string; icon?: string; color?: string };
  moneySource: { id: string; name: string; icon?: string };
};

// ─────────────── Composition / Budget / Peer (moved from insights) ───────────────
// Mirrors enko-backend/src/dashboard/dto/dashboard.dto.ts and
// enko-backend/src/user-insights/dto/spending-comparison.dto.ts.

export type CategoryExpense = {
  category: string;
  amount: number;
  percentage: number;
};

export type ExpenseComposition = {
  categoryBreakdown: CategoryExpense[];
};

export type BudgetComparisonItem = {
  moneySource: string;
  budget: number;
  expense: number;
  remaining: number;
  remainingPercentage: number;
};

export type BudgetComparison = {
  comparisons: BudgetComparisonItem[];
  totalBudget: number;
  totalExpense: number;
  totalRemaining: number;
};

export type CategoryComparison = {
  categoryName: string;
  userAmount: number;
  averageAmount: number;
  percentageDifference: number;
  currency: string;
};

export type SpendingComparison = {
  insights: string;
  categoryComparisons: CategoryComparison[];
  overallDifferencePercentage: number;
  comparisonUserCount: number;
  userMonthlySpending: number;
  averageMonthlySpending: number;
  currency: string;
};
