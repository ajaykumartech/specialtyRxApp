import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

import { dashboardSummarySchema } from './schemas';

export const dashboardApi = {
  async getSummary(params: { hideResolved: boolean }) {
    const { data } = await apiClient.get(ENDPOINTS.dashboard.summary, {
      params,
    });
    return dashboardSummarySchema.parse(data);
  },
};
