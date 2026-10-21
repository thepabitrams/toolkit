// src/core/hooks/useToast.ts
import { useToastStore } from '@/core/store/toastStore';
import type { ToastType } from '@/core/store/toastStore';

export function useToast() {
  const { 
    toasts: activeToasts, 
    showToast: handleShowToast, 
    dismissToast: handleDismissToast, 
    clearAll: handleClearAllToasts 
  } = useToastStore();

  return {
    toasts: activeToasts,
    showToast: handleShowToast,
    dismissToast: handleDismissToast,
    clearAll: handleClearAllToasts,
  };
}

export type { ToastType };