import { z } from 'zod';

export const MoneySourceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),
  balance: z.coerce
    .number({ error: 'Enter a balance' })
    .min(0, 'Cannot be negative'),
  currency: z
    .string()
    .trim()
    .min(1, 'Pick a currency')
    .max(8, 'Currency is too long'),
  icon: z.string().trim().max(5, 'Icon is too long').optional().or(z.literal('')),
  budget: z.coerce
    .number({ error: 'Enter a budget' })
    .min(0, 'Cannot be negative')
    .optional(),
  isDefault: z.boolean().optional(),
});

export type MoneySourceFormValues = z.infer<typeof MoneySourceFormSchema>;
