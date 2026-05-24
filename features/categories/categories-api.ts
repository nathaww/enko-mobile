import { api } from '@/api/axios';
import type { Category } from './categories.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listCategories(): Promise<Category[]> {
  if (useDevStub) {
    await delay(150);
    // Mirrors backend seed defaults so the picker shows realistic options.
    return [
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
  }
  const res = await api.get<Category[]>('/categories');
  return res.data;
}
