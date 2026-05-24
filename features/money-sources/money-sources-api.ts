import { api } from '@/api/axios';
import { unwrapPaginated, type PaginatedResponse } from '@/types/common';
import type { MoneySource } from './money-sources.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listMoneySources(): Promise<MoneySource[]> {
  if (useDevStub) {
    await delay(150);
    return [
      { id: 'cbe', name: 'CBE', balance: 18200, currency: 'ETB', icon: '🏦', isDefault: true, budget: 5000 },
      { id: 'cash', name: 'Cash', balance: 3180, currency: 'ETB', icon: '💵', isDefault: false, budget: 1000 },
      { id: 'awash', name: 'Awash', balance: 3000, currency: 'ETB', icon: '💳', isDefault: false, budget: 2000 },
    ];
  }
  // Backend wraps the list in PaginatedResponseDto.
  const res = await api.get<PaginatedResponse<MoneySource> | MoneySource[]>('/money-sources');
  return unwrapPaginated(res.data);
}
