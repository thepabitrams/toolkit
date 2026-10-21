// src/core/components/toast/Toast.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ToastType } from './useToast';
import { toastMotion } from '@/core/motion/compositions/toastMotion';

interface ToastProps {
  id: number;
  type: ToastType;
  icon: React.ReactNode;
  title: string;
  message: string;
  onDismiss: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  icon,
  title,
  message,
  onDismiss,
}) => {
  const toastElementRef = useRef<HTMLDivElement>(null);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    const element = toastElementRef.current;
    if (!element) return;
    void element.offsetWidth;
    element.classList.add('visible');
  }, []);

  const handleDismiss = useCallback((isImmediate = false) => {
    if (isDismissing) return;
    setIsDismissing(true);
    if (isImmediate) {
      onDismiss(id);
      return;
    }
    const element = toastElementRef.current;
    if (element) {
      element.classList.remove('visible');
      element.classList.add('hiding');
    }
    setTimeout(() => {
      onDismiss(id);
    }, 350);
  }, [isDismissing, onDismiss, id]);

  useEffect(() => {
    if (isDismissing) return;
    const element = toastElementRef.current;
    if (!element) return;

    let initialX = 0, initialY = 0, offsetX = 0, offsetY = 0;
    let hasStartedSwiping = false, swipeDirection: 'horizontal' | 'vertical' | null = null;
    let isCurrentlyDragging = false;

    const handlePointerDown = (pointerEvent: TouchEvent | MouseEvent) => {
      const pointer = 'touches' in pointerEvent ? pointerEvent.touches[0] : pointerEvent;
      initialX = pointer.clientX;
      initialY = pointer.clientY;
      offsetX = 0; offsetY = 0;
      hasStartedSwiping = false;
      swipeDirection = null;
      isCurrentlyDragging = true;
      element.style.transition = 'none';
    };

    const handlePointerMove = (pointerEvent: TouchEvent | MouseEvent) => {
      if (!isCurrentlyDragging) return;
      const pointer = 'touches' in pointerEvent ? pointerEvent.touches[0] : pointerEvent;
      const deltaX = pointer.clientX - initialX;
      const deltaY = pointer.clientY - initialY;

      if (!hasStartedSwiping) {
        const absoluteX = Math.abs(deltaX);
        const absoluteY = Math.abs(deltaY);
        if (absoluteX > 10 || absoluteY > 10) {
          hasStartedSwiping = true;
          swipeDirection = absoluteX > absoluteY ? 'horizontal' : 'vertical';
        }
        return;
      }

      pointerEvent.preventDefault();

      if (swipeDirection === 'horizontal') {
        offsetX = deltaX;
        const swipeProgress = Math.min(Math.abs(deltaX) / 200, 1);
        element.style.transform = `translateX(${deltaX}px) scale(${0.92 + (1 - swipeProgress) * 0.08})`;
        element.style.opacity = String(1 - swipeProgress * 0.5);
      } else if (swipeDirection === 'vertical' && deltaY < 0) {
        offsetY = deltaY;
        const swipeProgress = Math.min(Math.abs(deltaY) / 150, 1);
        element.style.transform = `translateY(${deltaY}px) scale(${1 - swipeProgress * 0.08})`;
        element.style.opacity = String(1 - swipeProgress * 0.5);
      }
    };

    const handlePointerUp = () => {
      isCurrentlyDragging = false;
      if (!hasStartedSwiping) {
        element.style.transition = '';
        return;
      }

      const dismissalThreshold = 100;

      if (swipeDirection === 'horizontal') {
        if (Math.abs(offsetX) > dismissalThreshold) {
          handleDismiss(true);
        } else {
          element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
          element.style.transform = 'translateX(0) scale(1)';
          element.style.opacity = '1';
          setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.opacity = '';
          }, 350);
        }
      } else if (swipeDirection === 'vertical') {
        if (offsetY < -70) {
          handleDismiss(true);
        } else {
          element.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
          element.style.transform = 'translateY(0) scale(1)';
          element.style.opacity = '1';
          setTimeout(() => {
            element.style.transition = '';
            element.style.transform = '';
            element.style.opacity = '';
          }, 350);
        }
      }

      hasStartedSwiping = false;
      swipeDirection = null;
    };

    element.addEventListener('touchstart', handlePointerDown, { passive: true });
    element.addEventListener('touchmove', handlePointerMove, { passive: false });
    element.addEventListener('touchend', handlePointerUp, { passive: true });
    element.addEventListener('touchcancel', handlePointerUp, { passive: true });

    let isMouseDown = false;
    const handleMouseDown = (mouseEvent: MouseEvent) => {
      isMouseDown = true;
      handlePointerDown(mouseEvent);
    };
    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isMouseDown) return;
      handlePointerMove(mouseEvent);
    };
    const handleMouseUp = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      handlePointerUp();
    };

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('contextmenu', (event) => event.preventDefault());

    return () => {
      element.removeEventListener('touchstart', handlePointerDown);
      element.removeEventListener('touchmove', handlePointerMove);
      element.removeEventListener('touchend', handlePointerUp);
      element.removeEventListener('touchcancel', handlePointerUp);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('contextmenu', () => {});
    };
  }, [handleDismiss, isDismissing]);

  const appliedMotionClasses = toastMotion().className;

  return (
    <div
      ref={toastElementRef}
      className={`
        ${appliedMotionClasses} ${type}
        bg-white dark:bg-gray-800 rounded-xl
        border border-gray-100 dark:border-gray-700
        flex items-start gap-3 px-4 py-3.5
        select-none cursor-grab active:cursor-grabbing
        backdrop-blur-sm touch-none
        pointer-events-auto
        ${isDismissing ? 'hiding' : ''}
      `}
    >
      <div className="toast-icon">{icon}</div>

      <div className="flex-1 min-w-0">
        <div className="toast-title">{title}</div>
        <div className="toast-message">{message}</div>
        <span className="toast-time">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <span className="toast-swipe-hint">↕</span>
    </div>
  );
};