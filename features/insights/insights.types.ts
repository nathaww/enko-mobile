/**
 * Mirrors the deployed backend's user-insights + dashboard DTOs. Keep in
 * sync with enko-backend/src/dashboard/dto/dashboard.dto.ts and
 * enko-backend/src/user-insights/dto/spending-comparison.dto.ts when the
 * API changes.
 */

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
