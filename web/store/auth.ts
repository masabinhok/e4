import { User } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearAuth: () => void;
  refreshToken: () => Promise<boolean>;
}

// Same origin: app/api/[...path]/route.ts proxies to the NestJS API.
const API_BASE_URL = "/api";

let retried = false;

const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  const tryRequest = async () => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    // A 401 from /auth/* (e.g. a wrong password) is an answer, not an expired session.
    if (response.status === 401 && !retried && !endpoint.startsWith("/auth/")) {
      retried = true;
      console.warn("401 detected. Attempting token refresh...");
      const success = await useAuth.getState().refreshToken();
      if (success) return tryRequest(); // Retry once after refresh
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  };

  return tryRequest();
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        try {
          set({ isLoading: true });

          const data = await apiCall("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (fullName, email, password) => {
        try {
          set({ isLoading: true });

          const data = await apiCall("/auth/signup", {
            method: "POST",
            body: JSON.stringify({ fullName, email, password }),
          });

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      demoLogin: async () => {
        set({ isLoading: true });
        try {
          await apiCall("/auth/demo", { method: "POST" });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
        // The demo endpoint only sets cookies; load the user it created.
        if (!(await useAuth.getState().checkAuth())) {
          throw new Error("Could not start the demo session");
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          await apiCall("/auth/logout", {
            method: "POST",
          });
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });

          const data = await apiCall("/auth/me", {
            method: "GET",
          });

          set({
            user: data,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error("Auth check failed:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return false;
        }
      },

      refreshToken: async () => {
        try {
          await apiCall("/auth/refresh", {
            method: "POST",
          });
          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });

          if (typeof window !== "undefined") {
            window.location.href = "/auth/login";
          }

          return false;
        }
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated) {
          state.checkAuth();
        }
      },
    },
  ),
);
