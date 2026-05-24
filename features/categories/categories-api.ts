import { api } from '@/api/axios';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from './categories.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍴', isDefault: true },
  { id: 'transport', name: 'Transportation', icon: '🚗', isDefault: true },
  { id: 'housing', name: 'Housing', icon: '🏠', isDefault: true },
  { id: 'utilities', name: 'Utilities', icon: '⚡', isDefault: true },
  { id: 'internet', name: 'Internet', icon: '📶', isDefault: true },
  { id: 'subscriptions', name: 'Subscriptions', icon: '🔄', isDefault: true },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', isDefault: true },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', isDefault: true },
  { id: 'health', name: 'Health & Fitness', icon: '❤️', isDefault: true },
  { id: 'education', name: 'Education', icon: '🎓', isDefault: true },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', isDefault: true },
  { id: 'travel', name: 'Travel & Vacation', icon: '✈️', isDefault: true },
];

// Module-scoped dev stub so create/delete reflect between renders. Reset on reload.
let stubCategories: Category[] | null = null;

function ensureStub(): Category[] {
  if (stubCategories) return stubCategories;
  stubCategories = [...DEFAULT_CATEGORIES];
  return stubCategories;
}

export async function listCategories(): Promise<Category[]> {
  if (useDevStub) {
    await delay(150);
    return [...ensureStub()];
  }
  const res = await api.get<Category[]>('/categories');
  return res.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  if (useDevStub) {
    await delay(250);
    const newCategory: Category = {
      id: String(Date.now()),
      name: data.name,
      icon: data.icon,
      color: data.color,
      isDefault: false,
    };
    stubCategories = [...ensureStub(), newCategory];
    return newCategory;
  }
  const res = await api.post<Category>('/categories', data);
  return res.data;
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<Category> {
  if (useDevStub) {
    await delay(250);
    const list = ensureStub();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const updated: Category = { ...list[idx], ...data, id };
    list[idx] = updated;
    stubCategories = [...list];
    return updated;
  }
  const res = await api.patch<Category>(`/categories/${id}`, data);
  return res.data;
}

export async function deleteCategory(id: string): Promise<void> {
  if (useDevStub) {
    await delay(200);
    stubCategories = ensureStub().filter((c) => c.id !== id);
    return;
  }
  await api.delete(`/categories/${id}`);
}
