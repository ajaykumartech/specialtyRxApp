import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
  biometricRefreshToken: 'biometric.refreshToken',
} as const;

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  user: unknown;
};

export const secureStorage = {
  getAccessToken: () => SecureStore.getItemAsync(KEYS.accessToken),

  async getSession(): Promise<StoredSession | null> {
    const [accessToken, refreshToken, user] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.refreshToken),
      SecureStore.getItemAsync(KEYS.user),
    ]);
    if (!accessToken || !refreshToken || !user) return null;
    return { accessToken, refreshToken, user: JSON.parse(user) };
  },

  async setSession({ accessToken, refreshToken, user }: StoredSession) {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.accessToken, accessToken),
      SecureStore.setItemAsync(KEYS.refreshToken, refreshToken),
      SecureStore.setItemAsync(KEYS.user, JSON.stringify(user)),
    ]);
  },

  async clearSession() {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.accessToken),
      SecureStore.deleteItemAsync(KEYS.refreshToken),
      SecureStore.deleteItemAsync(KEYS.user),
    ]);
  },

  /**
   * Biometric sign-in keeps its own refresh token so it survives logout.
   * It is only read after a successful biometric prompt.
   */
  getBiometricRefreshToken: () => SecureStore.getItemAsync(KEYS.biometricRefreshToken),
  setBiometricRefreshToken: (token: string) =>
    SecureStore.setItemAsync(KEYS.biometricRefreshToken, token),
  clearBiometricRefreshToken: () => SecureStore.deleteItemAsync(KEYS.biometricRefreshToken),
};
