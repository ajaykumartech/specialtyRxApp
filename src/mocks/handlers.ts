/**
 * Maps each ENDPOINTS path to a mock response built from ./data.
 * To mock a new endpoint: add the path to src/api/endpoints.ts, the data to ./data.ts, and a handler here.
 */
import { ENDPOINTS } from '@/api/endpoints';

import {
  mockAccounts,
  mockAlertTypes,
  mockAppInfo,
  mockDashboardSummary,
  mockDashboardWidgets,
  mockNotificationPreferences,
} from './data';

export type MockRequest = {
  body: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, unknown>;
  authorization?: string;
};

export type MockResult = { status: number; data: unknown };

type Handler = (req: MockRequest) => MockResult;
type AuthedHandler = (req: MockRequest, account: (typeof mockAccounts)[number]) => MockResult;

const MOCK_ACCESS_PREFIX = 'Bearer mock-access.';
const MOCK_REFRESH_PREFIX = 'mock-refresh.';

const unauthorized: MockResult = {
  status: 401,
  data: { message: 'Your session has expired. Please sign in again.' },
};

function issueSession(userId: string) {
  const account = mockAccounts.find((a) => a.user.id === userId);
  if (!account) return null;
  return {
    accessToken: `mock-access.${userId}.${Date.now()}`,
    refreshToken: `${MOCK_REFRESH_PREFIX}${userId}`,
    user: account.user,
  };
}

/** Token format is mock-access.<userId>.<timestamp>. */
function withAuth(handler: AuthedHandler): Handler {
  return (req) => {
    if (!req.authorization?.startsWith(MOCK_ACCESS_PREFIX)) return unauthorized;
    const userId = req.authorization.slice(MOCK_ACCESS_PREFIX.length).split('.')[0];
    const account = mockAccounts.find((a) => a.user.id === userId);
    return account ? handler(req, account) : unauthorized;
  };
}

function alertType(id: string) {
  return mockAlertTypes.find((t) => t.id === id);
}

function widgetsResponse() {
  return {
    widgets: mockDashboardWidgets.flatMap((w) => {
      const type = alertType(w.id);
      return type ? [{ ...w, label: type.label, openAlerts: type.openAlerts }] : [];
    }),
  };
}

export const mockHandlers: Record<string, Handler> = {
  // ---------- auth ----------
  [`POST ${ENDPOINTS.auth.login}`]: ({ body }) => {
    const email = String(body.email ?? '')
      .trim()
      .toLowerCase();
    const account = mockAccounts.find(
      (a) => a.user.email.toLowerCase() === email && a.password === body.password,
    );
    if (!account) return { status: 401, data: { message: 'Invalid email or password.' } };
    return { status: 200, data: issueSession(account.user.id) };
  },

  [`POST ${ENDPOINTS.auth.refresh}`]: ({ body }) => {
    const token = String(body.refreshToken ?? '');
    const session = token.startsWith(MOCK_REFRESH_PREFIX)
      ? issueSession(token.slice(MOCK_REFRESH_PREFIX.length))
      : null;
    if (!session) return { status: 401, data: { message: 'Please sign in with your password.' } };
    return { status: 200, data: session };
  },

  [`POST ${ENDPOINTS.auth.forgotPassword}`]: () => ({
    // Always succeeds so the API never reveals whether an email has an account.
    status: 200,
    data: { message: 'If an account exists for this email, a reset link is on its way.' },
  }),

  [`POST ${ENDPOINTS.auth.logout}`]: () => ({ status: 204, data: null }),

  // ---------- dashboard ----------
  [`GET ${ENDPOINTS.dashboard.summary}`]: withAuth(() => ({
    status: 200,
    data: {
      ...mockDashboardSummary,
      alertCategories: mockDashboardWidgets
        .filter((w) => w.visible)
        .flatMap((w) => {
          const type = alertType(w.id);
          return type
            ? [
                {
                  id: type.id,
                  label: type.shortLabel,
                  count: type.openAlerts,
                  hasUnread: type.openAlerts > 0,
                },
              ]
            : [];
        }),
    },
  })),

  // ---------- account ----------
  [`GET ${ENDPOINTS.account.profile}`]: withAuth((_, account) => ({
    status: 200,
    data: account.user,
  })),

  [`PUT ${ENDPOINTS.account.changePassword}`]: withAuth(({ body }, account) => {
    if (body.currentPassword !== account.password) {
      return { status: 400, data: { message: 'Your current password is incorrect.' } };
    }
    account.password = String(body.newPassword);
    return { status: 200, data: { message: 'Password updated.' } };
  }),

  [`GET ${ENDPOINTS.account.notificationPreferences}`]: withAuth(() => ({
    status: 200,
    data: mockNotificationPreferences,
  })),

  [`PUT ${ENDPOINTS.account.notificationPreferences}`]: withAuth(({ body }) => {
    Object.assign(mockNotificationPreferences, body);
    return { status: 200, data: mockNotificationPreferences };
  }),

  [`GET ${ENDPOINTS.account.dashboardWidgets}`]: withAuth(() => ({
    status: 200,
    data: widgetsResponse(),
  })),

  [`PUT ${ENDPOINTS.account.dashboardWidgets}`]: withAuth(({ body }) => {
    const incoming = (body.widgets ?? []) as { id: string; visible: boolean }[];
    const next = incoming.flatMap((w) => {
      const current = mockDashboardWidgets.find((c) => c.id === w.id);
      if (!current) return [];
      return [{ ...current, visible: current.locked ? true : w.visible }];
    });
    mockDashboardWidgets.splice(0, mockDashboardWidgets.length, ...next);
    return { status: 200, data: widgetsResponse() };
  }),

  // ---------- app ----------
  [`GET ${ENDPOINTS.app.info}`]: () => ({ status: 200, data: mockAppInfo }),
};
