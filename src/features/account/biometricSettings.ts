import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

import { authenticateWithBiometrics } from '@/services/biometrics';
import { secureStorage } from '@/services/secureStorage';

const PREFS_KEY = 'biometric.prefs';

type Prefs = { requireForMessages: boolean; requireForApproval: boolean };

type BiometricSettingsState = Prefs & {
  signInEnabled: boolean;
  isLoaded: boolean;
  load: () => Promise<void>;
  /** Turning on asks for a biometric check first. Returns false if the user cancelled. */
  setSignInEnabled: (enabled: boolean, label: string) => Promise<boolean>;
  setPref: (key: keyof Prefs, value: boolean) => Promise<void>;
};

const DEFAULT_PREFS: Prefs = { requireForMessages: false, requireForApproval: true };

/** Device-only settings: biometric data and these choices never leave the phone. */
export const useBiometricSettings = create<BiometricSettingsState>((set, get) => ({
  ...DEFAULT_PREFS,
  signInEnabled: false,
  isLoaded: false,

  async load() {
    const [token, raw] = await Promise.all([
      secureStorage.getBiometricRefreshToken(),
      SecureStore.getItemAsync(PREFS_KEY),
    ]);
    const prefs = raw
      ? { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) }
      : DEFAULT_PREFS;
    set({ ...prefs, signInEnabled: !!token, isLoaded: true });
  },

  async setSignInEnabled(enabled, label) {
    if (!enabled) {
      await secureStorage.clearBiometricRefreshToken();
      set({ signInEnabled: false });
      return true;
    }
    const session = await secureStorage.getSession();
    if (!session) return false;
    const ok = await authenticateWithBiometrics(`Turn on ${label} sign-in`);
    if (!ok) return false;
    await secureStorage.setBiometricRefreshToken(session.refreshToken);
    set({ signInEnabled: true });
    return true;
  },

  async setPref(key, value) {
    set({ [key]: value } as Pick<Prefs, typeof key>);
    const { requireForMessages, requireForApproval } = get();
    await SecureStore.setItemAsync(
      PREFS_KEY,
      JSON.stringify({ requireForMessages, requireForApproval }),
    );
  },
}));
