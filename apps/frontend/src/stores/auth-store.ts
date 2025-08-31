// apps/frontend/src/stores/auth-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  phone?: string
  address?: string
  email?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  language: 'ta' | 'en'
  
  // Actions
  login: (user: User) => void
  logout: () => void
  setLanguage: (language: 'ta' | 'en') => void
  updateProfile: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      language: 'ta', // Default to Tamil for local users
      
      login: (user: User) => {
        set({ user, isAuthenticated: true })
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
        // Clear session storage
        sessionStorage.removeItem('bookingData')
        sessionStorage.removeItem('completedBooking')
      },
      
      setLanguage: (language: 'ta' | 'en') => {
        set({ language })
      },
      
      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
      }),
    }
  )
)