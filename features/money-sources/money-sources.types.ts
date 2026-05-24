export type MoneySource = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  isDefault: boolean;
  budget: number;
};
