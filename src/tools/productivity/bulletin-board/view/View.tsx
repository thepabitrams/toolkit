// src/tools/productivity/bulletin-board/view/View.tsx
import React, { useMemo } from 'react';
import { Card } from '@/core/components/ui';
import { useTaskStore } from '../store/taskStore';
import { isTaskActive } from '../lib/helpers';
import { Tasks } from './tasks';

export function View(): React.JSX.Element {
  const tasks = useTaskStore((state) => state.tasks);
  const taskOrder = useTaskStore((state) => state.taskOrder);

  const sortedActiveTasks = useMemo(() => {
    const activeTasks = tasks.filter(isTaskActive);
    return [...activeTasks].sort((firstTask, secondTask) => {
      const firstTaskOrderIndex = taskOrder.indexOf(firstTask.id);
      const secondTaskOrderIndex = taskOrder.indexOf(secondTask.id);
      if (firstTaskOrderIndex === -1 && secondTaskOrderIndex === -1) return 0;
      if (firstTaskOrderIndex === -1) return 1;
      if (secondTaskOrderIndex === -1) return -1;
      return firstTaskOrderIndex - secondTaskOrderIndex;
    });
  }, [tasks, taskOrder]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Active Tasks</h3>
        <span className="text-xs text-gray-400">{sortedActiveTasks.length} tasks</span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
        {sortedActiveTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No active tasks. Add one using the + button above!
          </div>
        ) : (
          sortedActiveTasks.map((task, priorityIndex) => (
            <Tasks key={task.id} task={task} priorityIndex={priorityIndex} />
          ))
        )}
      </div>
    </Card>
  );
}