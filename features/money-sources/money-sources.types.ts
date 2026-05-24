export type MoneySource = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  isDefault: boolean;
  budget: number;
  /** ISO string of the latest expense/adjustment against this source, if any. */
  lastActivityAt?: string;
};

export type CreateMoneySourceRequest = {
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  budget?: number;
  isDefault?: boolean;
};

export type UpdateMoneySourceRequest = Partial<CreateMoneySourceRequest>;
