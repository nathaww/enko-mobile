import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(60, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

export const VerifyCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Enter all 6 digits')
    .regex(/^\d{6}$/, 'Digits only'),
});

export type LoginValues = z.infer<typeof LoginSchema>;
export type RegisterValues = z.infer<typeof RegisterSchema>;
export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;
export type VerifyCodeValues = z.infer<typeof VerifyCodeSchema>;
