import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { fadeIn, scaleIn } from '@/config/motion';
import { FiX } from 'react-icons/fi';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Overlay({ isOpen, onClose, children }: OverlayProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const isDarkTheme = document.documentElement.classList.contains('dark');
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    backgroundColor: isDarkTheme ? '#030712' : '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay-backdrop"
          style={overlayStyles}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="w-full h-full flex flex-col"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex justify-end p-4 shrink-0">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Close overlay"
              >
                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}