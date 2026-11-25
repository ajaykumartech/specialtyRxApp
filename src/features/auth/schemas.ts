import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.email(),
  phone: z.string().optional(),
  title: z.string().optional(),
  facilities: z.array(z.string()).default([]),
});

export const sessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
});

export const messageResponseSchema = z.object({ message: z.string() });

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
});

export type User = z.infer<typeof userSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
