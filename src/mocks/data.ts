/**
 * ALL mock responses live in this file.
 * Edit these objects to change what the app shows while EXPO_PUBLIC_USE_MOCKS=true.
 * Types come from each feature's zod schemas, so mocks can't drift from what the app expects.
 * Handlers mutate these objects in memory (e.g. saving preferences); a reload resets them.
 */
import type { AppInfo, NotificationPreferences } from '@/features/account/schemas';
import type { User } from '@/features/auth/schemas';
import type { DashboardSummary } from '@/features/dashboard/schemas';

/** Demo login: mobiledemo@test.com / Password1! */
export const mockAccounts: { password: string; user: User }[] = [
  {
    password: 'Password1!',
    user: {
      id: 'usr_001',
      fullName: 'Mobile Demo',
      email: 'mobiledemo@test.com',
      phone: '(908) 241-6337',
      title: 'Facility User',
      facilities: ['TESTA', 'BEACH', 'ARTMICK'],
    },
  },
];

/** Every alert type the pharmacy supports. `shortLabel` is used on dashboard tiles. */
export const mockAlertTypes = [
  { id: 'authorization', label: 'Authorization', shortLabel: 'Authorization', openAlerts: 29 },
  { id: 'clarification', label: 'Clarifications', shortLabel: 'Clarification', openAlerts: 11 },
  {
    id: 'prior_auth',
    label: 'Prior Authorization Medication',
    shortLabel: 'Prior Auth',
    openAlerts: 29,
  },
  { id: 'non_covered', label: 'Non-covered', shortLabel: 'Non Covered', openAlerts: 6 },
  { id: 'high_cost', label: 'High Cost Alert', shortLabel: 'High Cost', openAlerts: 7 },
  { id: 'refill_too_soon', label: 'Refill Too Soon', shortLabel: 'Refill Too Soon', openAlerts: 2 },
  { id: 'narcotics_refill', label: 'Narcotics Refill', shortLabel: 'Narcotics', openAlerts: 2 },
  {
    id: 'admission_review',
    label: 'Admission / Medication Review',
    shortLabel: 'Admission Review',
    openAlerts: 2,
  },
  {
    id: 'therapeutic_interchange',
    label: 'Therapeutic Interchange',
    shortLabel: 'Interchange',
    openAlerts: 0,
  },
  { id: 'pump_pickup', label: 'Pump Pickup', shortLabel: 'Pump Pickup', openAlerts: 0 },
  {
    id: 'alf_new_script',
    label: 'ALF - New Script Needed',
    shortLabel: 'ALF Script',
    openAlerts: 0,
  },
];

/** Dashboard widget order + visibility (Customize Widgets screen). */
export const mockDashboardWidgets: { id: string; visible: boolean; locked: boolean }[] = [
  { id: 'authorization', visible: true, locked: true },
  { id: 'clarification', visible: true, locked: false },
  { id: 'prior_auth', visible: true, locked: false },
  { id: 'non_covered', visible: true, locked: false },
  { id: 'high_cost', visible: true, locked: false },
  { id: 'refill_too_soon', visible: true, locked: false },
  { id: 'narcotics_refill', visible: false, locked: false },
  { id: 'admission_review', visible: false, locked: false },
  { id: 'therapeutic_interchange', visible: false, locked: false },
  { id: 'pump_pickup', visible: false, locked: false },
  { id: 'alf_new_script', visible: false, locked: false },
];

/** Dashboard header, stats and delivery. Alert tiles are built from the widgets above. */
export const mockDashboardSummary: Omit<DashboardSummary, 'alertCategories'> = {
  scopeLabel: 'All facilities',
  openAlerts: 29,
  stats: { newToday: 8, pending: 12, urgent: 3 },
  delivery: { toteId: '10231', currentStep: 'out_for_delivery' },
};

export const mockNotificationPreferences: NotificationPreferences = {
  channels: { push: true, email: true, sms: true },
  alertTypes: mockAlertTypes.slice(0, 7).map((t) => ({
    id: t.id,
    label: t.label,
    openAlerts: t.openAlerts,
    enabled: t.id !== 'narcotics_refill',
  })),
  operations: { packingSlips: true, deliveryUpdates: true },
  quietHours: { enabled: true, label: 'Mute 10 PM – 6 AM' },
};

export const mockAppInfo: AppInfo = {
  latestVersion: '1.0.0',
  releaseNotesUrl: 'https://example.com/specialty365/release-notes',
  whatsNew: {
    version: '1.0.0',
    highlights: [
      'Mobile packing slips with delivery tracking',
      'Faster clarification discussions',
      'Alert widget performance fixes',
    ],
  },
};
