// src/core/components/ui/Spinner.tsx
import React from 'react';
import { motion } from 'motion/react';

interface SpinnerProperties {
  className?: string;
}

export const Spinner: React.FC<SpinnerProperties> = ({ 
  className = 'w-5 h-5' 
}): React.JSX.Element => {
  return (
    <motion.svg
      viewBox="0 0 50 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    >
      <circle cx="25" cy="25" r="20" opacity="0.2" strokeWidth="4" />
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        strokeWidth="4"
        animate={{
          strokeDasharray: ['1, 150', '90, 150', '90, 150'],
          strokeDashoffset: [0, -35, -124],
        }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};