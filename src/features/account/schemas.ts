import { z } from 'zod';

export const dashboardWidgetSchema = z.object({
  id: z.string(),
  label: z.string(),
  openAlerts: z.number().int().nonnegative(),
  visible: z.boolean(),
  /** Required by the facility admin: can be reordered but not hidden. */
  locked: z.boolean().default(false),
});

/** Array order is the order shown on the dashboard. */
export const dashboardWidgetsSchema = z.object({ widgets: z.array(dashboardWidgetSchema) });

export const notificationPreferencesSchema = z.object({
  channels: z.object({ push: z.boolean(), email: z.boolean(), sms: z.boolean() }),
  alertTypes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      openAlerts: z.number().int().nonnegative(),
      enabled: z.boolean(),
    }),
  ),
  operations: z.object({ packingSlips: z.boolean(), deliveryUpdates: z.boolean() }),
  quietHours: z.object({ enabled: z.boolean(), label: z.string() }),
});

export const appInfoSchema = z.object({
  latestVersion: z.string(),
  releaseNotesUrl: z.url(),
  whatsNew: z.object({ version: z.string(), highlights: z.array(z.string()) }),
});

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number', test: (v: string) => /\d/.test(v) },
  { id: 'symbol', label: 'One symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .refine(
        (v) => PASSWORD_RULES.every((r) => r.test(v)),
        'Password does not meet all the rules',
      ),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: 'New password must be different from the current one',
  });

export type DashboardWidget = z.infer<typeof dashboardWidgetSchema>;
export type DashboardWidgets = z.infer<typeof dashboardWidgetsSchema>;
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type AppInfo = z.infer<typeof appInfoSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
