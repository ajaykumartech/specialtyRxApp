import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from './api';

export const dashboardKeys = {
  summary: (hideResolved: boolean) => ['dashboard', 'summary', { hideResolved }] as const,
};

export function useDashboardSummary(hideResolved: boolean) {
  return useQuery({
    queryKey: dashboardKeys.summary(hideResolved),
    queryFn: () => dashboardApi.getSummary({ hideResolved }),
  });
}
