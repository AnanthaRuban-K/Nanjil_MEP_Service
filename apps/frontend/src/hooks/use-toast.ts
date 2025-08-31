// src/hooks/use-toast.ts
import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

// Simple toast store - in a real app you might use zustand or context
let toastState: ToastState = { toasts: [] };
let listeners: Array<(state: ToastState) => void> = [];

const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const toast = ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
  const id = generateId();
  const newToast: Toast = { id, title, description, variant, duration };
  
  toastState.toasts.push(newToast);
  listeners.forEach(listener => listener(toastState));

  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
      listeners.forEach(listener => listener(toastState));
    }, duration);
  }
};

export const useToast = () => {
  const [state, setState] = useState<ToastState>(toastState);

  const addListener = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toastState));
  }, []);

  // Subscribe to state changes
  React.useEffect(() => {
    return addListener(setState);
  }, [addListener]);

  return {
    toasts: state.toasts,
    toast,
    removeToast
  };
};

// React import for useEffect
import React from 'react';