'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { api } from '@/lib/api';
import Cookies from 'js-cookie';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const response = await api.login(email, password);
          const { user, token } = response.data;
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          const response = await api.register(data);
          const { user, token } = response.data;
          Cookies.set('token', token, { expires: 7, secure: true, sameSite: 'strict' });
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          Cookies.remove('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      checkAuth: async () => {
        const token = Cookies.get('token');
        if (!token) {
          set({ isLoading: false });
          return;
        }
        try {
          const response = await api.getMe();
          set({ user: response.data, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          Cookies.remove('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
