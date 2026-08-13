
import { create } from "zustand";

import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;

  name: string;

  email: string;

  phone: string;

  avatar?: string | null;

  role: string;

  permissions: string[]; // 🚀 ADD THIS LINE
}

interface AuthState {
  user: User | null;

  adminUser: User | null;

  _hasHydrated: boolean;

  isChatOpen: boolean;

  unreadMessageCount: number;

  setAuthUser: (user: User | null) => void;

  setAdminUser: (admin: User | null) => void;

  setHasHydrated: (state: boolean) => void;

  setIsChatOpen: (open: boolean) => void;

  clearAuth: () => void;

  setUnreadMessageCount: (count: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      adminUser: null, // Initialized cleanly to null

      _hasHydrated: false,

      isChatOpen: false,

      unreadMessageCount: 0,

      setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),

      setAuthUser: (user) => set({ user }),

      setAdminUser: (adminUser) => set({ adminUser }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setIsChatOpen: (open) => set({ isChatOpen: open }),

      clearAuth: () => set({ user: null, adminUser: null, isChatOpen: false }),
    }),

    {
      name: "auth-user-storage",

      storage: createJSONStorage(() => localStorage),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      // 🚀 Save BOTH user types concurrently in the persisted storage state

      partialize: (state) => ({
        user: state.user,

        adminUser: state.adminUser,
      }),
    },
  ),
);
