// src/core/components/toast/toastStore.ts
import { create } from 'zustand';
import type { ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastData {
  id: number;
  type: ToastType;
  icon: ReactNode;
  title: string;
  message: string;
  duration?: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

interface ToastStore {
  toasts: ToastData[];
  nextToastId: number;
  maxVisibleToasts: number;
  showToast: (
    type: ToastType,
    icon: ReactNode,
    title: string,
    message: string,
    duration?: number
  ) => number;
  dismissToast: (id: number) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  nextToastId: 0,
  maxVisibleToasts: 3,

  showToast: (type, icon, title, message, duration = 4000) => {
    const { toasts, nextToastId, maxVisibleToasts, dismissToast } = get();
    const newToastId = nextToastId + 1;

    const duplicateToastIndex = toasts.findIndex(t => t.title === title && t.message === message);
    if (duplicateToastIndex !== -1) {
      const existingToast = toasts[duplicateToastIndex];
      if (existingToast.timeoutId) clearTimeout(existingToast.timeoutId);
      const timeoutId = setTimeout(() => dismissToast(existingToast.id), duration);
      set((state) => {
        const updatedToasts = [...state.toasts];
        updatedToasts[duplicateToastIndex] = { ...existingToast, timeoutId, duration };
        return { toasts: updatedToasts };
      });
      return existingToast.id;
    }

    const timeoutId = setTimeout(() => {
      dismissToast(newToastId);
    }, duration);

    const newToast: ToastData = {
      id: newToastId,
      type,
      icon,
      title,
      message,
      duration,
      timeoutId,
    };

    set((state) => ({
      toasts: [newToast, ...state.toasts],
      nextToastId: newToastId,
    }));

    setTimeout(() => {
      set((state) => {
        if (state.toasts.length > maxVisibleToasts) {
          const toastsToRemove = state.toasts.slice(maxVisibleToasts);
          toastsToRemove.forEach(t => {
            if (t.timeoutId) clearTimeout(t.timeoutId);
          });
          return { toasts: state.toasts.slice(0, maxVisibleToasts) };
        }
        return state;
      });
    }, 100);

    return newToastId;
  },

  dismissToast: (id: number) => {
    set((state) => {
      const toastToRemove = state.toasts.find(t => t.id === id);
      if (toastToRemove?.timeoutId) clearTimeout(toastToRemove.timeoutId);
      return { toasts: state.toasts.filter(t => t.id !== id) };
    });
  },

  clearAll: () => {
    set((state) => {
      state.toasts.forEach(t => {
        if (t.timeoutId) clearTimeout(t.timeoutId);
      });
      return { toasts: [] };
    });
  },
}));