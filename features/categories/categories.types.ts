export type Category = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCategoryRequest = {
  name: string;
  icon?: string;
  color?: string;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
