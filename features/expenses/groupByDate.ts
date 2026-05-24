import type { Expense } from './expenses.types';

export type DateGroup = {
  /** Human label: "Today" / "Yesterday" / "May 5" / "May 3, 2024". */
  label: string;
  /** Stable key derived from the calendar day, useful for FlatList keys. */
  key: string;
  total: number;
  items: Expense[];
};

/**
 * Group expenses by calendar day in the user's local timezone, with
 * human-friendly labels for the first two days. Output is sorted newest-first
 * and each group's items inherit that order.
 */
export function groupExpensesByDate(expenses: Expense[]): DateGroup[] {
  const buckets = new Map<string, Expense[]>();

  // Stable bucket key = local-date 'YYYY-MM-DD' so DST and timezone shifts
  // don't accidentally split a single calendar day into two groups.
  for (const expense of expenses) {
    const d = new Date(expense.date);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const arr = buckets.get(key) ?? [];
    arr.push(expense);
    buckets.set(key, arr);
  }

  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([key, items]) => {
      const sortedItems = [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const total = sortedItems.reduce((sum, e) => sum + e.amount, 0);
      const label = labelForKey(key, today, yesterday);
      return { label, key, total, items: sortedItems };
    });
}

function labelForKey(key: string, today: Date, yesterday: Date): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';

  // Same year → "May 5". Different year → "May 5, 2024".
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}
