// src/shared/components/ActionButton.tsx
import React from 'react';
import { Button } from '@/core/components/ui/Button';
import { ToolHub } from '@/core/components/tool-hub';
import { useAction } from '@/shared/components/action-button/useAction';
import { Overlay } from '@/core/components/ui/Overlay';

interface ActionButtonProperties {
  currentToolSlug: string;
  actionVariant: 'single' | 'multiple';
  className?: string;
  handleToolSelection: (selectedToolSlug: string, variant: 'single' | 'multiple') => Promise<void>;
}

export const ActionButton: React.FC<ActionButtonProperties> = ({
  currentToolSlug,
  actionVariant,
  className = '',
  handleToolSelection,
}) => {
  const {
    isActionMenuOpen,
    handleOpenActionMenu,
    handleCloseActionMenu,
    compatibilityFilter,
  } = useAction({ toolId: currentToolSlug });

  const handleSelection = async (selectedToolSlug: string) => {
    if (!selectedToolSlug) return;
    await handleToolSelection(selectedToolSlug, actionVariant);
    handleCloseActionMenu();
  };

  return (
    <>
      <Button
        onClick={handleOpenActionMenu}
        variant="ghost"
        className={`
          relative flex items-center justify-center gap-1.5 px-3 py-2 
          text-sm font-medium text-gray-600 dark:text-gray-300 
          hover:text-blue-600 dark:hover:text-blue-400 
          rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 
          active:scale-[0.97]
          min-w-20
          ${className}
        `}
      >
        <span>{actionVariant === 'single' ? 'Action' : 'Action (All)'}</span>
      </Button>

      <Overlay isOpen={isActionMenuOpen} onClose={handleCloseActionMenu}>
        <ToolHub 
          displayVariant="grid" 
          actionFilter={compatibilityFilter} 
          handleToolSelect={handleSelection} 
        />
      </Overlay>
    </>
  );
};