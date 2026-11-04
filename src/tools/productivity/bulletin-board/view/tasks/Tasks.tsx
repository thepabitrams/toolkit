// src/tools/productivity/bulletin-board/view/tasks/Tasks.tsx
import React, { useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import { Card } from '@/core/components/ui';
import { IconButton } from '@/core/components/ui/IconButton';
import { useMobile } from '@/core/hooks/useMobile';
import { useTaskStore, type Task } from '../../store/taskStore';
import { parseLocalDate } from '../../lib/date';
import { Priority } from './Priority';
import { Notes } from './Notes';
import { CheckIn } from './CheckIn';
import { Edit } from './Edit';

interface TasksProps {
  task: Task;
  priorityIndex: number;
}

function formatDateLabel(dateKey: string): string {
  if (!dateKey) return '';
  return parseLocalDate(dateKey).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFrequencyLabel(frequencyValue: number, frequencyUnit: 'day' | 'week' | 'month'): string {
  const unitLabelMap: Record<'day' | 'week' | 'month', string> = {
    day: 'Day',
    week: 'Week',
    month: 'Month',
  };
  const unitLabel = unitLabelMap[frequencyUnit];
  return `Every ${frequencyValue} ${unitLabel}${frequencyValue > 1 ? 's' : ''}`;
}

export function Tasks({ task, priorityIndex }: TasksProps): React.JSX.Element {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isMobileLayout = useMobile(768);

  const handleDelete = async (): Promise<void> => {
    if (!window.confirm(`Move "${task.title}" to trash?`)) return;
    try {
      await deleteTask(task.id);
    } catch (caughtError) {
      console.error('Failed to delete task:', caughtError);
    }
  };

  const handleSave = async (taskId: string, taskPatch: Partial<Task>): Promise<void> => {
    await updateTask(taskId, taskPatch);
  };

  return (
    <>
      <Card className="p-3 shadow-sm hover:shadow-md transition-all duration-200" hover>
        <div className="flex items-center gap-2 mb-2">
          <Priority taskId={task.id} priorityIndex={priorityIndex} />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">
            {task.title}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            <IconButton
              size="sm"
              onClick={() => setIsEditOpen(true)}
              ariaLabel="Edit"
              className="text-gray-400 hover:text-blue-500"
            >
              <MdEdit size={16} />
            </IconButton>
            <IconButton
              size="sm"
              onClick={() => void handleDelete()}
              ariaLabel="Delete"
              className="text-gray-400 hover:text-red-500"
            >
              <MdDelete size={16} />
            </IconButton>
          </div>
        </div>

        <Notes notes={task.notes} />

        <div className="mb-2">
          <CheckIn
            taskId={task.id}
            checkedDates={task.checkedDates ?? []}
            startDate={task.startDate}
            endDate={task.endDate}
            freqValue={task.freqValue}
            freqUnit={task.freqUnit}
          />
        </div>

        <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-700/30">
          <span className="whitespace-nowrap font-medium">
            {task.type === 'permanent' ? 'Permanent' : 'Temporary'}
          </span>

          <span className="text-center">
            {task.type === 'temporary' && task.endDate ? (
              isMobileLayout ? (
                <>
                  {formatDateLabel(task.startDate)} →
                  <br />
                  {formatDateLabel(task.endDate)}
                </>
              ) : (
                `${formatDateLabel(task.startDate)} → ${formatDateLabel(task.endDate)}`
              )
            ) : (
              formatDateLabel(task.startDate)
            )}
          </span>

          <span className="whitespace-nowrap text-right">
            {formatFrequencyLabel(task.freqValue, task.freqUnit)}
          </span>
        </div>
      </Card>

      <Edit isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} task={task} onSave={handleSave} />
    </>
  );
}