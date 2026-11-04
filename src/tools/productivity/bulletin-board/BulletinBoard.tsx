// src/tools/productivity/bulletin-board/BulletinBoard.tsx
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { scaleIn } from '@/config/motion';
import { useTaskStore } from './store/taskStore';
import { Controls } from './controls/Controls';
import { AddTask } from './controls/AddTask';
import { Settings } from './controls/Settings';
import { View } from './view';

export type BulletinBoardWorkspaceMode = 'board' | 'add' | 'settings';

export function BulletinBoard(): React.JSX.Element {
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState<BulletinBoardWorkspaceMode>('board');

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleOpenAddTaskWorkspace = (): void => setActiveWorkspaceMode('add');
  const handleOpenSettingsWorkspace = (): void => setActiveWorkspaceMode('settings');
  const handleCloseWorkspace = (): void => setActiveWorkspaceMode('board');

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        
        {activeWorkspaceMode === 'board' && (
          <motion.div
            key="board-page"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6 w-full"
          >
            <Controls 
              handleOpenAddTaskWorkspace={handleOpenAddTaskWorkspace} 
              handleOpenSettingsWorkspace={handleOpenSettingsWorkspace} 
            />
            <View />
          </motion.div>
        )}

        {activeWorkspaceMode === 'add' && (
          <motion.div
            key="add-page"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <AddTask handleCloseWorkspace={handleCloseWorkspace} />
          </motion.div>
        )}

        {activeWorkspaceMode === 'settings' && (
          <motion.div
            key="settings-page"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            <Settings handleCloseWorkspace={handleCloseWorkspace} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}