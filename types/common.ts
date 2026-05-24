export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};

/**
 * Backend pagination wrapper. The NestJS PaginatedResponseDto returns this
 * exact shape from any paginated list endpoint (/expenses, /money-sources,
 * etc.). Use `unwrapPaginated()` to extract the items array.
 */
export type PaginatedResponse<T> = {
  data: T[];
  hasMore: boolean;
  pageSize: number;
  page: number;
};

/**
 * Pull the items array out of a backend paginated response. Tolerates both
 * the wrapped shape and a bare array (some endpoints return raw arrays).
 */
export function unwrapPaginated<T>(payload: PaginatedResponse<T> | T[] | undefined | null): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload.data) ? payload.data : [];
}
