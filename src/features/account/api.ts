import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { userSchema } from '@/features/auth/schemas';

import {
  appInfoSchema,
  dashboardWidgetsSchema,
  notificationPreferencesSchema,
  type NotificationPreferences,
} from './schemas';

export const accountApi = {
  async getProfile() {
    const { data } = await apiClient.get(ENDPOINTS.account.profile);
    return userSchema.parse(data);
  },

  async changePassword(input: { currentPassword: string; newPassword: string }) {
    await apiClient.put(ENDPOINTS.account.changePassword, input);
  },

  async getNotificationPreferences() {
    const { data } = await apiClient.get(ENDPOINTS.account.notificationPreferences);
    return notificationPreferencesSchema.parse(data);
  },

  async updateNotificationPreferences(prefs: NotificationPreferences) {
    const { data } = await apiClient.put(ENDPOINTS.account.notificationPreferences, prefs);
    return notificationPreferencesSchema.parse(data);
  },

  async getDashboardWidgets() {
    const { data } = await apiClient.get(ENDPOINTS.account.dashboardWidgets);
    return dashboardWidgetsSchema.parse(data);
  },

  async updateDashboardWidgets(widgets: { id: string; visible: boolean }[]) {
    const { data } = await apiClient.put(ENDPOINTS.account.dashboardWidgets, { widgets });
    return dashboardWidgetsSchema.parse(data);
  },

  async getAppInfo() {
    const { data } = await apiClient.get(ENDPOINTS.app.info);
    return appInfoSchema.parse(data);
  },
};
