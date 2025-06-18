import { User } from "@/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tokenRefreshInterval: NodeJS.Timeout | null;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearAuth: () => void;
  refreshToken: () => Promise<boolean>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (tokens usually expire in 15 mins)

const apiCall = async (endpoint: string, options: RequestInit = {}, retry = true): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401 && retry) {
    console.warn('401 detected. Attempting token refresh...');
    try {
      const success = await useAuth.getState().refreshToken();

      if (success) {
        // Retry the original request once after successful refresh
        return apiCall(endpoint, options, false);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }

    // If refresh fails, let the original error fall through
    throw new Error('Unauthorized. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};


export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      tokenRefreshInterval: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (username, password) => {
        try {
          set({ isLoading: true });

          const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Start auto refresh after successful login
          get().startAutoRefresh();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (username, password) => {
        try {
          set({ isLoading: true });

          const data = await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Start auto refresh after successful signup
          get().startAutoRefresh();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          // Stop auto refresh first
          get().stopAutoRefresh();

          await apiCall('/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.error('Logout error:', error);
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

          const data = await apiCall('/auth/me', {
            method: 'GET',
          });

          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Start auto refresh if user is authenticated
          get().startAutoRefresh();
          return true;
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          get().stopAutoRefresh();
          return false;
        }
      },

      refreshToken: async () => {
        try {
          await apiCall('/auth/refresh', {
            method: 'POST',
          });
          
          console.log('Token refreshed successfully');
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          
          // If refresh fails, user needs to login again
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          get().stopAutoRefresh();
          
          // Optionally redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          
          return false;
        }
      },

      startAutoRefresh: () => {
        // Clear existing interval if any
        get().stopAutoRefresh();

        const interval = setInterval(async () => {
          const { isAuthenticated, refreshToken } = get();
          
          if (isAuthenticated) {
            console.log('Auto-refreshing token...');
            const success = await refreshToken();
            
            if (!success) {
              console.log('Auto-refresh failed, stopping interval');
              get().stopAutoRefresh();
            }
          } else {
            // User is not authenticated, stop the interval
            get().stopAutoRefresh();
          }
        }, REFRESH_INTERVAL);

        set({ tokenRefreshInterval: interval });
        console.log('Auto token refresh started');
      },

      stopAutoRefresh: () => {
        const { tokenRefreshInterval } = get();
        
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          set({ tokenRefreshInterval: null });
          console.log('Auto token refresh stopped');
        }
      },

      clearAuth: () => {
        get().stopAutoRefresh();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Don't persist loading state or interval
      }),
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated (page refresh), check auth status
        if (state?.isAuthenticated) {
          state.checkAuth();
        }
      },
    }
  )
);