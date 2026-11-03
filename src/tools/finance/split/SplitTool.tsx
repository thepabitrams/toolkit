// src/tools/finance/split/SplitTool.tsx
import React, { useEffect } from 'react';
import { motion, type Variants } from 'motion/react';
import { Card } from '@/core/components/ui';
import { useSplitStore } from '@/tools/finance/split/store/useSplitStore';
import { CurrencyCard } from '@/tools/finance/split/components/CurrencyCard';
import { LedgerWorkspace } from '@/tools/finance/split/components/LedgerWorkspace';
import { ResultsCard } from '@/tools/finance/split/components/ResultsCard';
import { RankingCard } from '@/tools/finance/split/components/RankingCard';
import { spring, stagger } from '@/config/motion';

const workspaceContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: stagger.standard } },
};

const workspaceCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.standard },
};

export function SplitTool(): React.JSX.Element {
  const { groupMembers, purgeExpiredData, initializeStore } = useSplitStore();

  useEffect(() => {
    purgeExpiredData();
    initializeStore();
  }, [purgeExpiredData, initializeStore]);

  return (
    <div className="w-full flex flex-col gap-6 py-2">
      <motion.div 
        variants={workspaceContainerVariants} 
        initial="hidden" 
        animate="visible" 
        className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start"
      >
        <motion.div variants={workspaceCardVariants} className="lg:col-span-6 w-full space-y-6">
          <Card className="w-full p-0">
            <CurrencyCard />
          </Card>
          <Card className="w-full p-0 overflow-hidden">
            <LedgerWorkspace />
          </Card>
        </motion.div>

        {groupMembers.length > 0 && (
          <motion.div variants={workspaceCardVariants} className="lg:col-span-6 w-full space-y-6">
            <Card className="w-full p-0 overflow-hidden">
              <ResultsCard />
            </Card>
            <Card className="w-full p-0 overflow-hidden">
              <RankingCard />
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}