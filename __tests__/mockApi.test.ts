import { describe, expect, it } from '@jest/globals';
import type { InternalAxiosRequestConfig } from 'axios';

import { ENDPOINTS } from '@/api/endpoints';
import { sessionSchema } from '@/features/auth/schemas';
import { dashboardSummarySchema } from '@/features/dashboard/schemas';
import { mockAdapter } from '@/mocks/adapter';

function request(method: string, url: string, data?: unknown, token?: string) {
  return mockAdapter({
    method,
    url,
    data: data ? JSON.stringify(data) : undefined,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  } as unknown as InternalAxiosRequestConfig);
}

describe('mock API', () => {
  it('signs in the demo account and returns a valid session', async () => {
    const res = await request('post', ENDPOINTS.auth.login, {
      email: 'mobiledemo@test.com',
      password: 'Password1!',
    });
    expect(sessionSchema.safeParse(res.data).success).toBe(true);
  });

  it('rejects a wrong password with 401', async () => {
    await expect(
      request('post', ENDPOINTS.auth.login, {
        email: 'mobiledemo@test.com',
        password: 'nope',
      }),
    ).rejects.toMatchObject({ response: { status: 401 } });
  });

  it('serves a dashboard summary that matches the schema when signed in', async () => {
    const login = await request('post', ENDPOINTS.auth.login, {
      email: 'mobiledemo@test.com',
      password: 'Password1!',
    });
    const res = await request(
      'get',
      ENDPOINTS.dashboard.summary,
      undefined,
      login.data.accessToken,
    );
    expect(dashboardSummarySchema.safeParse(res.data).success).toBe(true);
  });

  it('returns 401 for the dashboard without a token', async () => {
    await expect(request('get', ENDPOINTS.dashboard.summary)).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it('exchanges a refresh token for a new session (biometric sign-in)', async () => {
    const res = await request('post', ENDPOINTS.auth.refresh, {
      refreshToken: 'mock-refresh.usr_001',
    });
    expect(res.data.user.email).toBe('mobiledemo@test.com');
  });
});
