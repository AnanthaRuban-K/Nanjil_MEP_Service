// apps/frontend/src/stores/ui-store.ts
import { create } from 'zustand';
import type { Notification } from '../types';

interface UIState {
  // Navigation
  currentScreen: string;
  screenHistory: string[];
  
  // Loading states
  isGlobalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Notifications
  notifications: Notification[];
  
  // Modals and dialogs
  isModalOpen: boolean;
  modalContent: React.ComponentType<any> | null;
  
  // Actions
  navigateTo: (screen: string) => void;
  goBack: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'> & { duration?: number }) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  openModal: (content: React.ComponentType<any>) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentScreen: '/',
  screenHistory: [],
  isGlobalLoading: false,
  loadingStates: {},
  notifications: [],
  isModalOpen: false,
  modalContent: null,

  navigateTo: (screen) => {
    const { currentScreen, screenHistory } = get();
    set({
      currentScreen: screen,
      screenHistory: [...screenHistory, currentScreen],
    });
  },

  goBack: () => {
    const { screenHistory } = get();
    if (screenHistory.length > 0) {
      const previousScreen = screenHistory[screenHistory.length - 1];
      const newHistory = screenHistory.slice(0, -1);
      set({
        currentScreen: previousScreen,
        screenHistory: newHistory,
      });
    }
  },

  setGlobalLoading: (isGlobalLoading) => set({ isGlobalLoading }),

  setLoadingState: (key, loading) => {
    const { loadingStates } = get();
    set({
      loadingStates: {
        ...loadingStates,
        [key]: loading,
      },
    });
  },

  addNotification: (notification) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      //timestamp: new Date().toISOString(),
    };
    
    const { notifications } = get();
    set({ notifications: [newNotification, ...notifications] });
    
    // Auto-remove notification after duration
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id) => {
    const { notifications } = get();
    set({
      notifications: notifications.filter(n => n.id !== id),
    });
  },

  clearAllNotifications: () => set({ notifications: [] }),

  openModal: (modalContent) => set({ 
    isModalOpen: true, 
    modalContent 
  }),

  closeModal: () => set({ 
    isModalOpen: false, 
    modalContent: null 
  }),
}));
