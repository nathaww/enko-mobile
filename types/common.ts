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
