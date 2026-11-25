import { create } from 'zustand';

import { userSchema, type Session, type User } from '@/features/auth/schemas';
import { secureStorage } from '@/services/secureStorage';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  async hydrate() {
    try {
      const session = await secureStorage.getSession();
      const user = session ? userSchema.safeParse(session.user) : null;
      set({
        user: user?.success ? user.data : null,
        isAuthenticated: !!user?.success,
        isHydrated: true,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },

  async signIn(session) {
    await secureStorage.setSession(session);
    set({ user: session.user, isAuthenticated: true });
  },

  async signOut() {
    await secureStorage.clearSession();
    set({ user: null, isAuthenticated: false });
  },
}));
