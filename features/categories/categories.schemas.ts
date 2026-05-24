import { z } from 'zod';

// Mirrors backend's CreateCategoryDto: name 1-50, icon max 5 chars (emoji),
// color is a 6-char hex without the leading '#'.
export const CategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name is too long'),
  icon: z
    .string()
    .trim()
    .max(5, 'Icon is too long')
    .optional()
    .or(z.literal('')),
  color: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{6}$/, 'Use a 6-digit hex like FFAA00')
    .optional()
    .or(z.literal('')),
});

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>;
