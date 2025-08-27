// apps/frontend/src/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserPreferences, Language } from '../types';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  language: Language;
  location: any | null;   // 👈 இங்கு add பண்ணணும்
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLanguage: (language: Language) => void;
  setLocation: (location: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      language: 'ta',
      location: null,   // 👈 இது stateல வேண்டும்
      isLoading: false,

      setUser: (user) => set({ 
        user, 
        isAdmin: user?.role === 'admin',
        language: user?.language || 'ta' 
      }),
      
      setLanguage: (language) => {
        set({ language });
        const { user } = get();
        if (user) {
          set({ user: { ...user, language } });
        }
      },
      
      setLocation: (location) => set({ location }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        isAdmin: false, 
        location: null 
      }),
      
      updateProfile: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'nanjil-auth-store',
      partialize: (state) => ({
        language: state.language,
        location: state.location,
      }),
    }
  )
);
