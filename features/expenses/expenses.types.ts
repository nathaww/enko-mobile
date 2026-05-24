import type { Category } from '@/features/categories/categories.types';
import type { MoneySource } from '@/features/money-sources/money-sources.types';

export type Expense = {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  /**
   * Backend's ExpenseDto uses `@Exclude()` at class level and does NOT
   * `@Expose()` the foreign-key fields. Only the nested `category` and
   * `moneySource` objects come through. Read IDs via `expense.category.id`
   * and `expense.moneySource.id` — these are guaranteed. The raw foreign
   * keys below stay optional for dev stubs and future backend changes.
   */
  category: Pick<Category, 'id' | 'name' | 'icon' | 'color'>;
  moneySource: Pick<MoneySource, 'id' | 'name' | 'icon' | 'currency'>;
  categoryId?: string;
  moneySourceId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateExpenseRequest = {
  amount: number;
  date: string; // ISO
  notes?: string;
  categoryId: string;
  moneySourceId: string;
};

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>;

export type ExpenseFilters = {
  search?: string;
  categoryId?: string;
  moneySourceId?: string;
  fromDate?: string;
  toDate?: string;
};

/** Response shape for POST /expenses/from-text — the AI's parse result. */
export type ParsedExpense = {
  amount: number;
  date?: string;
  notes?: string;
  categoryId?: string;
  moneySourceId?: string;
  /** Backend may suggest a category by name when no id matches. */
  suggestedCategoryName?: string;
  /** Confidence the model gave to its guess (0..1). */
  confidence?: number;
};
