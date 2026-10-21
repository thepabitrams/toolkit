// src/core/components/toast/useToast.ts
import { useToastStore, type ToastType } from './toastStore';

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