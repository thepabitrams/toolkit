import React, { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { FiChevronDown } from 'react-icons/fi';
import { duration, easing } from '@/config/motion1';
import { Card } from './Card';

const chevronVariants: Variants = {
  closed: { rotate: 0, transition: { duration: duration.standard, ease: easing.standard } },
  open: { rotate: 180, transition: { duration: duration.standard, ease: easing.standard } },
};

const accordionContentVariants: Variants = {
  hidden: { height: 0, opacity: 0, transition: { duration: duration.standard, ease: easing.standard } },
  visible: { height: 'auto', opacity: 1, transition: { duration: duration.standard, ease: easing.standard } },
  exit: { height: 0, opacity: 0, transition: { duration: duration.standard, ease: easing.standard } },
};

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
  const [isAccordionOpen, setIsAccordionOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4 overflow-hidden w-full">
      <button 
        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        className="w-full p-6 flex justify-between items-center select-none bg-white dark:bg-[#12161c] hover:bg-slate-50 dark:hover:bg-[#1a1f26] transition-colors focus:outline-none"
        aria-expanded={isAccordionOpen}
      >
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white text-left">
          {title}
        </h3>
        
        <motion.span 
          animate={isAccordionOpen ? 'open' : 'closed'}
          variants={chevronVariants}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1e242d] flex items-center justify-center shrink-0 shadow-sm"
        >
          <FiChevronDown className="w-4 h-4 text-slate-600 dark:text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isAccordionOpen && (
          <motion.div
            variants={accordionContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-gray-700 pt-4 bg-slate-100 dark:bg-[#1e242d]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};