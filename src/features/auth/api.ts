import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';

import {
  messageResponseSchema,
  sessionSchema,
  type ForgotPasswordInput,
  type LoginInput,
} from './schemas';

export const authApi = {
  async login(input: LoginInput) {
    const { data } = await apiClient.post(ENDPOINTS.auth.login, input);
    return sessionSchema.parse(data);
  },

  async refresh(refreshToken: string) {
    const { data } = await apiClient.post(ENDPOINTS.auth.refresh, {
      refreshToken,
    });
    return sessionSchema.parse(data);
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const { data } = await apiClient.post(ENDPOINTS.auth.forgotPassword, input);
    return messageResponseSchema.parse(data);
  },

  async logout() {
    await apiClient.post(ENDPOINTS.auth.logout);
  },
};
