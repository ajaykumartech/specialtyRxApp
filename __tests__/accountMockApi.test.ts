import { describe, expect, it } from '@jest/globals';
import type { InternalAxiosRequestConfig } from 'axios';

import { ENDPOINTS } from '@/api/endpoints';
import { dashboardWidgetsSchema, notificationPreferencesSchema } from '@/features/account/schemas';
import { mockAdapter } from '@/mocks/adapter';

const token = 'mock-access.usr_001.1';

function request(method: string, url: string, data?: unknown) {
  return mockAdapter({
    method,
    url,
    data: data ? JSON.stringify(data) : undefined,
    headers: { Authorization: `Bearer ${token}` },
  } as unknown as InternalAxiosRequestConfig);
}

describe('account mock API', () => {
  it('returns the signed-in profile', async () => {
    const res = await request('get', ENDPOINTS.account.profile);
    expect(res.data.email).toBe('mobiledemo@test.com');
  });

  it('rejects a wrong current password', async () => {
    await expect(
      request('put', ENDPOINTS.account.changePassword, {
        currentPassword: 'wrong',
        newPassword: 'NewPass1!',
      }),
    ).rejects.toMatchObject({ response: { status: 400 } });
  });

  it('saves widget order and visibility, and the dashboard follows it', async () => {
    const { data } = await request('get', ENDPOINTS.account.dashboardWidgets);
    const widgets = dashboardWidgetsSchema.parse(data).widgets;
    const reordered = [widgets[1], widgets[0], ...widgets.slice(2)].map((w) => ({
      id: w.id,
      visible: w.id === 'clarification' ? false : w.visible,
    }));

    await request('put', ENDPOINTS.account.dashboardWidgets, { widgets: reordered });
    const summary = await request('get', ENDPOINTS.dashboard.summary);
    const ids = summary.data.alertCategories.map((c: { id: string }) => c.id);

    expect(ids).not.toContain('clarification');
    expect(ids[0]).toBe('authorization');
  });

  it('keeps locked widgets visible', async () => {
    const res = await request('put', ENDPOINTS.account.dashboardWidgets, {
      widgets: [{ id: 'authorization', visible: false }],
    });
    expect(res.data.widgets[0]).toMatchObject({ id: 'authorization', visible: true });
  });

  it('round-trips notification preferences', async () => {
    const { data } = await request('get', ENDPOINTS.account.notificationPreferences);
    const prefs = notificationPreferencesSchema.parse(data);
    const res = await request('put', ENDPOINTS.account.notificationPreferences, {
      ...prefs,
      channels: { ...prefs.channels, sms: false },
    });
    expect(res.data.channels.sms).toBe(false);
  });
});
