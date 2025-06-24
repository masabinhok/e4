import { User } from "@/types/types";
import { redirect } from "next/navigation";
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
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearAuth: () => void;
  refreshToken: () => Promise<boolean>;
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';


const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    console.warn('401 detected. Attempting token refresh...');
    try {
      const success = await useAuth.getState().refreshToken();
      if (success) {
        return apiCall(endpoint, options);
      }
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
    }
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

          const data = await apiCall('/auth/login', {
            method: 'POST',
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

          const data = await apiCall('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ fullName, email,  password }),
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

      logout: async () => {
        try {
          set({ isLoading: true });

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

          return true;
        } catch (error) {
          console.error('Auth check failed:', error);
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
          const hasRefreshToken = document.cookie.includes('refreshToken');

          if(!hasRefreshToken){
            redirect('/auth/login')
          }
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
          
          // Optionally redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
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