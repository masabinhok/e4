import { User } from "@/types/types";
import { api, setOnUnauthorized } from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearAuth: () => void;
}

const signedOut = { user: null, isAuthenticated: false, isLoading: false };

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => {
      // The auth endpoints only set cookies; load the user they signed in.
      const startSession = async (endpoint: string, body?: object) => {
        set({ isLoading: true });
        try {
          await api(endpoint, {
            method: "POST",
            body: JSON.stringify(body ?? {}),
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
        if (!(await get().checkAuth())) {
          throw new Error(
            "Signed in, but couldn't load your account. Try again.",
          );
        }
      };

      return {
        ...signedOut,
        login: (email, password) =>
          startSession("/auth/login", { email, password }),
        signup: (fullName, email, password) =>
          startSession("/auth/signup", { fullName, email, password }),
        demoLogin: () => startSession("/auth/demo"),

        logout: async () => {
          set({ isLoading: true });
          await api("/auth/logout", { method: "POST" }).catch(() => {});
          set(signedOut);
        },

        checkAuth: async () => {
          set({ isLoading: true });
          try {
            const user = await api<User>("/auth/me");
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          } catch {
            set(signedOut);
            return false;
          }
        },

        clearAuth: () => set(signedOut),
      };
    },
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) state.checkAuth();
      },
    },
  ),
);

// A request that still gets 401 after a refresh means the session is over.
setOnUnauthorized(() => useAuth.getState().clearAuth());
