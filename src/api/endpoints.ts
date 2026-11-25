/**
 * Single source of truth for every backend path.
 * When the real API ships, update the paths here: feature code and mocks both read from this file.
 * Use `:param` placeholders for path params and build them with `buildPath`.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    logout: '/auth/logout',
  },
  dashboard: {
    summary: '/dashboard/summary',
  },
  account: {
    profile: '/me',
    changePassword: '/me/password',
    notificationPreferences: '/me/notification-preferences',
    dashboardWidgets: '/me/dashboard-widgets',
  },
  app: {
    info: '/app/info',
  },
} as const;

export function buildPath(template: string, params: Record<string, string | number>) {
  return template.replace(/:(\w+)/g, (_, key: string) => encodeURIComponent(String(params[key])));
}
