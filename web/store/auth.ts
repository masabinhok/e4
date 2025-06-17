import { apiClient } from "@/lib/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  //actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, passwrod: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist((set)=> ({
    user: null, 
    isLoading: false, 
    isAuthenticated: false,

    setUser: (user) => set({
      user, 
      isAuthenticated: !!user,
      isLoading: false
    }),

    setLoading: (isLoading) => set({isLoading}),

    login: async (username, password) => {
      try{
        set({isLoading: true});

        const response = await apiClient.post<{user: User}>('/auth/login', {
          username, 
          password
        } );

        set({
          user: response.user,
          isAuthenticated: true, 
          isLoading: false,
        });
      }catch(error){
        set({isLoading: false});
        throw error;
      }
    },

    signup: async(username, password) => {
      try {
        set({isLoading: true});
        const response = await apiClient.post<{user: User, message: string}>('auth/signup', {
          username, password
        });
        set({
          user: response?.user,
          isLoading: false, 
          isAuthenticated: true,
        })
      }catch(error){
        set({isLoading: false});
        throw error;
      }
    },

    logout: async() => {
      try {
        set({isLoading: true})
        await apiClient.post('auth/logout');
      }
      catch(error){
        console.error('Logout error:', error);
      }finally {
        set({
          user: null,
          isAuthenticated: false, 
          isLoading: false
        })
      }
    },

    checkAuth: async () => {
      try {
        set({isLoading: true});

        const response = await apiClient.get<{user: User}>('auth/me');
        console.log(response);
        set({
          user: response.user,
          isAuthenticated: true, 
          isLoading: false,
        });
      }
      catch(error){
        set({
          user: null, 
          isAuthenticated: false, 
          isLoading: false
        })
      }
    },

    clearAuth: () => {
      set({
        user: null, 
        isAuthenticated: false, 
        isLoading: false, 
      })
    },
}), {
  name: 'auth-storage',
  partialize: (state) => ({
    isLoading: state.isLoading,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  })
})
)