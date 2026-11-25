import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { authenticateWithBiometrics, getBiometricSupport } from '@/services/biometrics';
import { secureStorage } from '@/services/secureStorage';
import { useAuthStore } from '@/store/authStore';

import { authApi } from './api';
import type { ForgotPasswordInput, LoginInput, Session } from './schemas';

export class BiometricNotSetUpError extends Error {}
export class BiometricCancelledError extends Error {}

export function useBiometricSupport() {
  return useQuery({
    queryKey: ['biometric-support'],
    queryFn: getBiometricSupport,
    staleTime: Infinity,
  });
}

/** Returns the session; the caller decides when to call `completeSignIn`. */
export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
  });
}

export function useBiometricLogin() {
  return useMutation({
    mutationFn: async (label: string): Promise<Session> => {
      const refreshToken = await secureStorage.getBiometricRefreshToken();
      if (!refreshToken) throw new BiometricNotSetUpError();

      const ok = await authenticateWithBiometrics(`Sign in to Specialty365 with ${label}`);
      if (!ok) throw new BiometricCancelledError();

      let session: Session;
      try {
        session = await authApi.refresh(refreshToken);
      } catch (error) {
        // Server rejected the stored token: drop it so the user re-enables after a password login.
        if (isAxiosError(error) && error.response?.status === 401) {
          await secureStorage.clearBiometricRefreshToken();
        }
        throw error;
      }
      await secureStorage.setBiometricRefreshToken(session.refreshToken);
      return session;
    },
    onSuccess: (session) => useAuthStore.getState().signIn(session),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      // Best-effort server logout; local sign-out must happen even if it fails.
      await authApi.logout().catch(() => undefined);
      await useAuthStore.getState().signOut();
    },
  });
}

export async function completeSignIn(session: Session, enableBiometrics: boolean) {
  if (enableBiometrics) {
    await secureStorage.setBiometricRefreshToken(session.refreshToken);
  }
  await useAuthStore.getState().signIn(session);
}

export async function hasBiometricSignIn() {
  return !!(await secureStorage.getBiometricRefreshToken());
}
