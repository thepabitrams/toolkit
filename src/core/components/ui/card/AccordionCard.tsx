import React, { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiChevronDown } from 'react-icons/fi';

interface AccordionCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const AccordionCard: React.FC<AccordionCardProps> = ({ 
  title, 
  children, 
  defaultOpen = false 
}): React.JSX.Element => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl mb-4 shadow-sm overflow-hidden">
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex justify-between items-center select-none hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white text-left">
          {title}
        </h3>
        
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center shrink-0"
        >
          <FiChevronDown className="w-4 h-4 text-slate-600 dark:text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-gray-800 pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};