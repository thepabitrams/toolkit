// src/core/components/toast/ToastContainer.tsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Stagger } from '@/core/motion/core/Stagger';
import { Toast } from './Toast';
import { useToast } from './useToast';

export function ToastContainer() {
  const { toasts: visibleToasts, dismissToast: handleDismissToast, clearAll: handleClearAllToasts } = useToast();

  useEffect(() => {
    return () => {
      handleClearAllToasts();
    };
  }, [handleClearAllToasts]);

  if (visibleToasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed left-0 right-0 z-9999 flex justify-center pointer-events-none px-4 pt-2"
      style={{
        top: '72px',
      }}
    >
      <div className="w-full max-w-120 flex flex-col gap-1.5">
        <Stagger delay={80}>
          {visibleToasts.map((toastItem) => (
            <Toast
              key={toastItem.id}
              id={toastItem.id}
              type={toastItem.type}
              icon={toastItem.icon}
              title={toastItem.title}
              message={toastItem.message}
              onDismiss={handleDismissToast}
            />
          ))}
        </Stagger>
      </div>
    </div>,
    document.body
  );
}