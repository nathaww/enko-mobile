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

export type TopCategory = {
  name: string;
  amount: number;
  percentage: number;
};

export type ExpenseOverview = {
  summary: string;
  thisMonth: { total: number; currency: string };
  yearToDate: { total: number; currency: string };
  topCategories: TopCategory[];
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
