/**
 * Runtime config read from .env.<environment>.
 * EXPO_PUBLIC_ vars must be accessed with dot notation so Expo can inline them.
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  /** When true, every API call is answered by src/mocks instead of the network. */
  useMocks: process.env.EXPO_PUBLIC_USE_MOCKS === 'true',
  appEnv: (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as
    'development' | 'staging' | 'production',
} as const;

export const envLabel = { development: 'DEV', staging: 'STAGING', production: 'PROD' }[env.appEnv];
