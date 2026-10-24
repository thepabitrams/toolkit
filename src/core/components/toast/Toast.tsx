import React from 'react';
import { motion, useDragControls } from 'motion/react';
import type { ToastType } from './useToast';
import { spring, duration, easing } from '@/config/motion';

interface ToastProps {
  id: number;
  type: ToastType;
  icon: React.ReactNode;
  title: string;
  message: string;
  onDismiss: (id: number) => void;
}

const typeStyles: Record<ToastType, string> = {
  info: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400',
  success: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
  warning: 'bg-yellow-50 text-yellow-500 dark:bg-yellow-900/20 dark:text-yellow-400',
  error: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  icon,
  title,
  message,
  onDismiss,
}) => {
  const dragControls = useDragControls();

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y < -50 || Math.abs(info.offset.x) > 50) {
      onDismiss(id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: duration.fast } }}
      transition={spring.standard}
      drag="y"
      dragControls={dragControls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      className={`
        relative flex items-start gap-3 px-4 py-3.5
        bg-white dark:bg-[#171b22] rounded-xl
        border border-gray-100 dark:border-[rgba(255,255,255,0.08)]
        shadow-lg dark:shadow-[0_0_15px_rgba(186,230,253,0.10)]
        select-none cursor-grab active:cursor-grabbing
        touch-none pointer-events-auto
        transition-shadow duration-300
      `}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xl ${typeStyles[type]}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </div>
        <div className="text-[12.5px] text-slate-600 dark:text-slate-400 leading-snug">
          {message}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <span className="text-xs text-slate-300 dark:text-slate-600 opacity-40 shrink-0 pointer-events-none select-none pt-1">
        ↕
      </span>
    </motion.div>
  );
};