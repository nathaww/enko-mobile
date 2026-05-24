import { api } from '@/api/axios';
import { unwrapPaginated, type PaginatedResponse } from '@/types/common';
import type {
  CreateMoneySourceRequest,
  MoneySource,
  UpdateMoneySourceRequest,
} from './money-sources.types';

const useDevStub = __DEV__ && !process.env.EXPO_PUBLIC_API_URL;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Module-scoped stub state so create/update/delete reflect changes between
// renders during dev. Reset on app reload.
let stubSources: MoneySource[] | null = null;

function ensureStub(): MoneySource[] {
  if (stubSources) return stubSources;
  const now = Date.now();
  stubSources = [
    {
      id: 'cbe',
      name: 'CBE',
      balance: 18200,
      currency: 'ETB',
      icon: '🏦',
      isDefault: true,
      budget: 5000,
      lastActivityAt: new Date(now - 3 * 3600_000).toISOString(),
    },
    {
      id: 'cash',
      name: 'Cash',
      balance: 3180,
      currency: 'ETB',
      icon: '💵',
      isDefault: false,
      budget: 1000,
      lastActivityAt: new Date(now - 86_400_000).toISOString(),
    },
    {
      id: 'awash',
      name: 'Awash',
      balance: 3000,
      currency: 'ETB',
      icon: '💳',
      isDefault: false,
      budget: 2000,
      lastActivityAt: new Date(now - 3 * 86_400_000).toISOString(),
    },
  ];
  return stubSources;
}

export async function listMoneySources(): Promise<MoneySource[]> {
  if (useDevStub) {
    await delay(150);
    return [...ensureStub()];
  }
  // Backend wraps the list in PaginatedResponseDto.
  const res = await api.get<PaginatedResponse<MoneySource> | MoneySource[]>('/money-sources');
  return unwrapPaginated(res.data);
}

export async function getMoneySource(id: string): Promise<MoneySource> {
  if (useDevStub) {
    await delay(100);
    const found = ensureStub().find((s) => s.id === id);
    if (!found) throw new Error('Money source not found');
    return found;
  }
  const res = await api.get<MoneySource>(`/money-sources/${id}`);
  return res.data;
}

export async function createMoneySource(
  data: CreateMoneySourceRequest
): Promise<MoneySource> {
  if (useDevStub) {
    await delay(300);
    const list = ensureStub();
    // Only one source can be default. If the new one claims it, demote others.
    const next = data.isDefault
      ? list.map((s) => ({ ...s, isDefault: false }))
      : [...list];
    const created: MoneySource = {
      id: String(Date.now()),
      name: data.name,
      balance: data.balance,
      currency: data.currency,
      icon: data.icon,
      isDefault: !!data.isDefault || list.length === 0,
      budget: data.budget ?? 0,
    };
    stubSources = [...next, created];
    return created;
  }
  const res = await api.post<MoneySource>('/money-sources', data);
  return res.data;
}

export async function updateMoneySource(
  id: string,
  data: UpdateMoneySourceRequest
): Promise<MoneySource> {
  if (useDevStub) {
    await delay(300);
    const list = ensureStub();
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Money source not found');

    // Promote-to-default has to demote whoever currently holds the flag.
    let next = [...list];
    if (data.isDefault) {
      next = next.map((s) => ({ ...s, isDefault: false }));
    }
    const updated: MoneySource = { ...next[idx], ...data, id };
    next[idx] = updated;
    stubSources = next;
    return updated;
  }
  const res = await api.patch<MoneySource>(`/money-sources/${id}`, data);
  return res.data;
}

export async function deleteMoneySource(id: string): Promise<void> {
  if (useDevStub) {
    await delay(200);
    const list = ensureStub();
    const target = list.find((s) => s.id === id);
    if (!target) return;
    if (target.isDefault && list.length > 1) {
      throw new Error('Set another source as default first.');
    }
    stubSources = list.filter((s) => s.id !== id);
    return;
  }
  await api.delete(`/money-sources/${id}`);
}
