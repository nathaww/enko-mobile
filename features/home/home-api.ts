import { api } from '@/api/axios';
import type {
  DashboardOverview,
  DashboardTrends,
  ExpenseOverview,
  Period,
  RecentExpense,
  TotalBalance,
} from './home.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ───────────────────────────── Dashboard ─────────────────────────────

export async function getOverview(): Promise<DashboardOverview> {
  if (useDevStub) {
    await delay(200);
    return {
      totalExpenses: 4120,
      totalBudget: 9000,
      totalBalance: 24380,
      budgetUtilization: 45.78,
    };
  }
  const res = await api.get<DashboardOverview>('/dashboard/overview');
  return res.data;
}

export async function getTotalBalance(period: Period): Promise<TotalBalance> {
  if (useDevStub) {
    await delay(250);
    return {
      totalBalance: 24380,
      currency: 'ETB',
      moneySources: [
        { id: 'cbe', name: 'CBE', balance: 18200, currency: 'ETB', percentageChange: 4.2 },
        { id: 'cash', name: 'Cash', balance: 3180, currency: 'ETB', percentageChange: -2.1 },
        { id: 'awash', name: 'Awash', balance: 3000, currency: 'ETB', percentageChange: 0 },
      ],
    };
  }
  const res = await api.get<TotalBalance>('/dashboard/total-balance', {
    params: { period },
  });
  return res.data;
}

export async function getExpensesOverview(period: Period): Promise<ExpenseOverview> {
  if (useDevStub) {
    await delay(250);
    return {
      summary: 'Spending is on track this month.',
      thisMonth: { total: 4120, currency: 'ETB' },
      yearToDate: { total: 38900, currency: 'ETB' },
      topCategories: [
        { name: 'Food & Dining', amount: 1730, percentage: 42 },
        { name: 'Transportation', amount: 740, percentage: 18 },
        { name: 'Shopping', amount: 540, percentage: 13 },
        { name: 'Entertainment', amount: 330, percentage: 8 },
      ],
    };
  }
  const res = await api.get<ExpenseOverview>('/dashboard/expenses-overview', {
    params: { period },
  });
  return res.data;
}

export async function getTrends(): Promise<DashboardTrends> {
  if (useDevStub) {
    await delay(250);
    // 12 random-ish points that roughly form a downward trend
    const make = (n: number) =>
      Array.from({ length: n }).map((_, i) => ({
        date: new Date(Date.now() - (n - 1 - i) * 86_400_000).toISOString(),
        amount: 350 + Math.round(Math.sin(i / 1.7) * 90 + (n - i) * 8),
      }));
    return { monthlyTrends: make(12), weeklyTrends: make(7) };
  }
  const res = await api.get<DashboardTrends>('/dashboard/trends');
  return res.data;
}

// ─────────────────────────── Recent expenses ───────────────────────────

export async function getRecentExpenses(limit = 5): Promise<RecentExpense[]> {
  if (useDevStub) {
    await delay(250);
    const now = Date.now();
    const stub: RecentExpense[] = [
      {
        id: '1',
        amount: 80,
        date: new Date(now - 3 * 3600_000).toISOString(),
        notes: 'Coffee',
        category: { id: 'food', name: 'Food & Dining' },
        moneySource: { id: 'cash', name: 'Cash' },
      },
      {
        id: '2',
        amount: 250,
        date: new Date(now - 4 * 3600_000).toISOString(),
        notes: 'Uber to office',
        category: { id: 'transit', name: 'Transportation' },
        moneySource: { id: 'cbe', name: 'CBE' },
      },
      {
        id: '3',
        amount: 180,
        date: new Date(now - 6 * 3600_000).toISOString(),
        notes: 'Lunch',
        category: { id: 'food', name: 'Food & Dining' },
        moneySource: { id: 'cbe', name: 'CBE' },
      },
      {
        id: '4',
        amount: 1200,
        date: new Date(now - 86_400_000).toISOString(),
        notes: 'Groceries',
        category: { id: 'shop', name: 'Shopping' },
        moneySource: { id: 'cbe', name: 'CBE' },
      },
    ];
    return stub.slice(0, limit);
  }
  const res = await api.get<RecentExpense[]>('/expenses', {
    params: { limit, sort: 'date:desc' },
  });
  return res.data;
}
