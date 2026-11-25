import { z } from 'zod';

export const deliveryStepSchema = z.enum(['packed', 'picked_up', 'out_for_delivery', 'delivered']);

export const alertCategorySchema = z.object({
  id: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
  hasUnread: z.boolean(),
});

export const dashboardSummarySchema = z.object({
  scopeLabel: z.string(),
  openAlerts: z.number().int().nonnegative(),
  stats: z.object({
    newToday: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
    urgent: z.number().int().nonnegative(),
  }),
  delivery: z.object({
    toteId: z.string(),
    currentStep: deliveryStepSchema,
  }),
  alertCategories: z.array(alertCategorySchema),
});

export type DeliveryStep = z.infer<typeof deliveryStepSchema>;
export type AlertCategory = z.infer<typeof alertCategorySchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
