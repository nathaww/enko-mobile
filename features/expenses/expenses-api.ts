import { api } from '@/api/axios';
import { unwrapPaginated, type PaginatedResponse } from '@/types/common';
import type {
  CreateExpenseRequest,
  Expense,
  ExpenseFilters,
  ParsedExpense,
  UpdateExpenseRequest,
} from './expenses.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Module-scoped stub state so create/update/delete reflect changes between
// renders during dev. Reset on app reload.
let stubExpenses: Expense[] | null = null;

function ensureStub(): Expense[] {
  if (stubExpenses) return stubExpenses;
  const now = Date.now();
  stubExpenses = [
    {
      id: '1',
      amount: 80,
      date: new Date(now - 3 * 3600_000).toISOString(),
      notes: 'Coffee',
      categoryId: 'food',
      category: { id: 'food', name: 'Food & Dining', icon: '🍴' },
      moneySourceId: 'cash',
      moneySource: { id: 'cash', name: 'Cash', icon: '💵', currency: 'ETB' },
    },
    {
      id: '2',
      amount: 250,
      date: new Date(now - 4 * 3600_000).toISOString(),
      notes: 'Uber to office',
      categoryId: 'transport',
      category: { id: 'transport', name: 'Transportation', icon: '🚗' },
      moneySourceId: 'cbe',
      moneySource: { id: 'cbe', name: 'CBE', icon: '🏦', currency: 'ETB' },
    },
    {
      id: '3',
      amount: 180,
      date: new Date(now - 6 * 3600_000).toISOString(),
      notes: 'Lunch',
      categoryId: 'food',
      category: { id: 'food', name: 'Food & Dining', icon: '🍴' },
      moneySourceId: 'cbe',
      moneySource: { id: 'cbe', name: 'CBE', icon: '🏦', currency: 'ETB' },
    },
    {
      id: '4',
      amount: 1200,
      date: new Date(now - 86_400_000).toISOString(),
      notes: 'Groceries',
      categoryId: 'shopping',
      category: { id: 'shopping', name: 'Shopping', icon: '🛍️' },
      moneySourceId: 'cbe',
      moneySource: { id: 'cbe', name: 'CBE', icon: '🏦', currency: 'ETB' },
    },
  ];
  return stubExpenses;
}

function buildStubExpense(data: CreateExpenseRequest): Expense {
  const list = ensureStub();
  const categoryNames: Record<string, string> = {
    food: 'Food & Dining',
    transport: 'Transportation',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
  };
  const sourceNames: Record<string, string> = {
    cbe: 'CBE',
    cash: 'Cash',
    awash: 'Awash',
  };
  return {
    id: String(Date.now()),
    amount: data.amount,
    date: data.date,
    notes: data.notes,
    categoryId: data.categoryId,
    category: { id: data.categoryId, name: categoryNames[data.categoryId] ?? 'Other' },
    moneySourceId: data.moneySourceId,
    moneySource: {
      id: data.moneySourceId,
      name: sourceNames[data.moneySourceId] ?? 'Unknown',
      currency: 'ETB',
    },
  };
}

/**
 * Translate UI-friendly filter shape into the backend's PaginatedRequestDto
 * params. Backend uses a generic `filterField` + `filterValue` for equality
 * (only one at a time), `search` for text, and `dateField` + `startDate` /
 * `endDate` for date ranges. The UI keeps the friendlier { categoryId, ... }
 * shape so feature code doesn't have to know about backend quirks.
 *
 * Limitation: backend supports ONE filterField at a time. If both a category
 * and a money-source filter are set, we prioritize category.
 */
function toBackendParams(filters: ExpenseFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.search) params.search = filters.search;

  if (filters.categoryId) {
    params.filterField = 'categoryId';
    params.filterValue = filters.categoryId;
  } else if (filters.moneySourceId) {
    params.filterField = 'moneySourceId';
    params.filterValue = filters.moneySourceId;
  }

  if (filters.fromDate || filters.toDate) {
    params.dateField = 'date';
    if (filters.fromDate) params.startDate = filters.fromDate;
    if (filters.toDate) params.endDate = filters.toDate;
  }

  return params;
}

export async function listExpenses(filters: ExpenseFilters = {}): Promise<Expense[]> {
  if (useDevStub) {
    await delay(180);
    let result = [...ensureStub()];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.notes?.toLowerCase().includes(q) ||
          e.category.name.toLowerCase().includes(q) ||
          e.moneySource.name.toLowerCase().includes(q)
      );
    }
    if (filters.categoryId) result = result.filter((e) => e.categoryId === filters.categoryId);
    if (filters.moneySourceId)
      result = result.filter((e) => e.moneySourceId === filters.moneySourceId);
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  // Backend wraps the list in PaginatedResponseDto: { data, hasMore, page, pageSize }.
  // Unwrap so callers always get a plain Expense[] regardless of pagination.
  const res = await api.get<PaginatedResponse<Expense> | Expense[]>('/expenses', {
    params: toBackendParams(filters),
  });
  return unwrapPaginated(res.data);
}

export async function getExpense(id: string): Promise<Expense> {
  if (useDevStub) {
    await delay(100);
    const found = ensureStub().find((e) => e.id === id);
    if (!found) throw new Error('Expense not found');
    return found;
  }
  const res = await api.get<Expense>(`/expenses/${id}`);
  return res.data;
}

export async function createExpense(data: CreateExpenseRequest): Promise<Expense> {
  if (useDevStub) {
    await delay(300);
    const newExpense = buildStubExpense(data);
    stubExpenses = [newExpense, ...ensureStub()];
    return newExpense;
  }
  const res = await api.post<Expense>('/expenses', data);
  return res.data;
}

export async function updateExpense(
  id: string,
  data: UpdateExpenseRequest
): Promise<Expense> {
  if (useDevStub) {
    await delay(300);
    const list = ensureStub();
    const idx = list.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Expense not found');
    const updated: Expense = { ...list[idx], ...data, id };
    list[idx] = updated;
    stubExpenses = [...list];
    return updated;
  }
  const res = await api.patch<Expense>(`/expenses/${id}`, data);
  return res.data;
}

export async function deleteExpense(id: string): Promise<void> {
  if (useDevStub) {
    await delay(200);
    stubExpenses = ensureStub().filter((e) => e.id !== id);
    return;
  }
  await api.delete(`/expenses/${id}`);
}

export async function parseExpenseFromText(text: string): Promise<ParsedExpense> {
  if (useDevStub) {
    await delay(700);
    // Naive heuristic so the AI parse button "does something" in dev: pull
    // a number out and guess at the rest. Real backend uses Gemini.
    const amountMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;
    const lower = text.toLowerCase();
    let categoryId = 'food';
    if (/uber|taxi|bus|fuel|gas|transport/.test(lower)) categoryId = 'transport';
    else if (/groceries|shop|bought|store/.test(lower)) categoryId = 'shopping';
    return {
      amount,
      date: new Date().toISOString(),
      notes: text,
      categoryId,
      moneySourceId: 'cbe',
      confidence: 0.85,
    };
  }
  const res = await api.post<ParsedExpense>('/expenses/from-text', { text });
  return res.data;
}
