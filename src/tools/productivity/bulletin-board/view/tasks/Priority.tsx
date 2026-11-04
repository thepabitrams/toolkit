// src/tools/productivity/bulletin-board/view/tasks/Priority.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/core/components/ui/Input';
import { useTaskStore } from '../../store/taskStore';

interface PriorityProps {
  taskId: string;
  priorityIndex: number;
}

export function Priority({ taskId, priorityIndex }: PriorityProps): React.JSX.Element {
  const taskOrder = useTaskStore((state) => state.taskOrder);
  const moveTask = useTaskStore((state) => state.moveTask);
  const [priorityInputValue, setPriorityInputValue] = useState(String(priorityIndex + 1));
  const isSavingPriority = useRef(false);

  useEffect(() => {
    setPriorityInputValue(String(priorityIndex + 1));
  }, [priorityIndex]);

  const commitPriorityValue = async (): Promise<void> => {
    if (isSavingPriority.current) return;
    const parsedPriority = parseInt(priorityInputValue, 10);
    if (Number.isNaN(parsedPriority) || priorityInputValue === '') {
      setPriorityInputValue(String(priorityIndex + 1));
      return;
    }
    const clampedPriority = Math.max(1, Math.min(taskOrder.length, parsedPriority));
    if (clampedPriority === priorityIndex + 1) {
      setPriorityInputValue(String(priorityIndex + 1));
      return;
    }
    isSavingPriority.current = true;
    try {
      await moveTask(taskId, clampedPriority - 1);
    } catch (caughtError) {
      console.error('Failed to move task:', caughtError);
    } finally {
      isSavingPriority.current = false;
    }
  };

  const handlePriorityKeyDown = (keyboardEvent: React.KeyboardEvent<HTMLInputElement>): void => {
    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      void commitPriorityValue();
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-xs text-gray-400 font-medium">#</span>
      <Input
        type="text"
        value={priorityInputValue}
        onChange={(changeEvent) => setPriorityInputValue(changeEvent.target.value)}
        onBlur={() => void commitPriorityValue()}
        onKeyDown={handlePriorityKeyDown}
        className="w-16 text-center text-sm"
      />
    </div>
  );
}