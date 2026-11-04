// src/tools/productivity/bulletin-board/controls/Controls.tsx
import React from 'react';
import { Card, IconButton } from '@/core/components/ui';
import { MdAdd, MdSettings } from 'react-icons/md';

interface ControlsProps {
  handleOpenAddTaskWorkspace: () => void;
  handleOpenSettingsWorkspace: () => void;
}

export function Controls({ 
  handleOpenAddTaskWorkspace, 
  handleOpenSettingsWorkspace 
}: ControlsProps): React.JSX.Element {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-1">
          Today's Tasks
        </h2>
        <IconButton
          variant="standard"
          size="sm"
          onClick={handleOpenAddTaskWorkspace}
          ariaLabel="Add task"
          className="text-gray-400 hover:text-blue-500"
        >
          <MdAdd size={22} />
        </IconButton>
        <IconButton
          variant="standard"
          size="sm"
          onClick={handleOpenSettingsWorkspace}
          ariaLabel="Settings"
          className="text-gray-400 hover:text-gray-600"
        >
          <MdSettings size={20} />
        </IconButton>
      </div>
    </Card>
  );
}