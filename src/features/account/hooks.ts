import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { useAuthStore } from '@/store/authStore';

import { accountApi } from './api';
import type { DashboardWidgets, NotificationPreferences } from './schemas';

export const accountKeys = {
  profile: ['account', 'profile'] as const,
  notificationPreferences: ['account', 'notification-preferences'] as const,
  dashboardWidgets: ['account', 'dashboard-widgets'] as const,
  appInfo: ['app', 'info'] as const,
};

export function useProfile() {
  const cachedUser = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: accountKeys.profile,
    queryFn: accountApi.getProfile,
    // Show the user from the login response instantly, then refresh from the API.
    placeholderData: cachedUser ?? undefined,
  });
}

/**
 * Saves immediately and updates the UI before the server answers.
 * Rolls back and shows an alert if the save fails.
 */
function useOptimisticSave<T>(
  queryKey: QueryKey,
  save: (next: T) => Promise<T>,
  invalidate: QueryKey[] = [],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: save,
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<T>(queryKey);
      queryClient.setQueryData(queryKey, next);
      return { previous };
    },
    onError: (error, _next, context) => {
      queryClient.setQueryData(queryKey, context?.previous);
      Alert.alert('Could not save', getErrorMessage(error));
    },
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
    onSettled: () =>
      Promise.all(invalidate.map((key) => queryClient.invalidateQueries({ queryKey: key }))),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: accountKeys.notificationPreferences,
    queryFn: accountApi.getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  return useOptimisticSave<NotificationPreferences>(
    accountKeys.notificationPreferences,
    accountApi.updateNotificationPreferences,
  );
}

export function useDashboardWidgets() {
  return useQuery({
    queryKey: accountKeys.dashboardWidgets,
    queryFn: accountApi.getDashboardWidgets,
  });
}

export function useUpdateDashboardWidgets() {
  return useOptimisticSave<DashboardWidgets>(
    accountKeys.dashboardWidgets,
    ({ widgets }) =>
      accountApi.updateDashboardWidgets(widgets.map(({ id, visible }) => ({ id, visible }))),
    [['dashboard']],
  );
}

export function useChangePassword() {
  return useMutation({ mutationFn: accountApi.changePassword });
}

export function useAppInfo() {
  return useQuery({ queryKey: accountKeys.appInfo, queryFn: accountApi.getAppInfo });
}
