import { create, isAxiosError } from 'axios';

import { ENDPOINTS } from '@/api/endpoints';
import { env } from '@/config/env';
import { mockAdapter } from '@/mocks/adapter';
import { secureStorage } from '@/services/secureStorage';
import { useAuthStore } from '@/store/authStore';

const PUBLIC_PATHS: string[] = Object.values(ENDPOINTS.auth);

export const apiClient = create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  ...(env.useMocks && { adapter: mockAdapter }),
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(undefined, async (error) => {
  const isAuthCall = PUBLIC_PATHS.includes(error.config?.url ?? '');
  if (isAxiosError(error) && error.response?.status === 401 && !isAuthCall) {
    await useAuthStore.getState().signOut();
  }
  return Promise.reject(error);
});
