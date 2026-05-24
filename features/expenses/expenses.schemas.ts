import { z } from 'zod';

export const ExpenseFormSchema = z.object({
  amount: z.coerce
    .number({ error: 'Enter an amount' })
    .positive('Must be greater than zero'),
  date: z.string().min(1, 'Pick a date'),
  notes: z.string().max(280, 'Notes are too long').optional().or(z.literal('')),
  categoryId: z.string().min(1, 'Pick a category'),
  moneySourceId: z.string().min(1, 'Pick a source'),
});

export type ExpenseFormValues = z.infer<typeof ExpenseFormSchema>;
