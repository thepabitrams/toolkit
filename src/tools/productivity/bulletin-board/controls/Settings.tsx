// src/tools/productivity/bulletin-board/controls/Settings.tsx
import React from 'react';
import { Card, IconButton } from '@/core/components/ui';
import { MdClose, MdDelete, MdRestore } from 'react-icons/md';
import { useTaskStore, type Task } from '../store/taskStore';
import { parseLocalDate } from '../lib/date';

interface SettingsProps {
  handleCloseWorkspace: () => void;
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_TRASH_RETENTION_DAYS = 30;

function computeRemainingTrashDays(task: Task): number {
  if (!task.deletedAt) return 0;
  const deletedAtTimestamp = new Date(task.deletedAt).getTime();
  const elapsedDaysSinceDeletion = Math.floor((Date.now() - deletedAtTimestamp) / MILLISECONDS_PER_DAY);
  const retentionDays = typeof task.trashDays === 'number' ? task.trashDays : DEFAULT_TRASH_RETENTION_DAYS;
  return Math.max(0, retentionDays - elapsedDaysSinceDeletion);
}

function hasTaskExpired(task: Task): boolean {
  if (task.type !== 'temporary' || !task.endDate) return false;
  const endOfEndDate = parseLocalDate(task.endDate);
  endOfEndDate.setHours(23, 59, 59, 999);
  return Date.now() > endOfEndDate.getTime();
}

export function Settings({ handleCloseWorkspace }: SettingsProps): React.JSX.Element {
  const tasks = useTaskStore((state) => state.tasks);
  const restoreTask = useTaskStore((state) => state.restoreTask);
  const permanentlyDeleteTask = useTaskStore((state) => state.permanentlyDeleteTask);

  const trashTasks = tasks.filter((task) => task.isTrash === true);

  const handleRestore = async (task: Task): Promise<void> => {
    if (hasTaskExpired(task)) {
      window.alert(`Cannot restore "${task.title}" – the task has expired.`);
      return;
    }
    try {
      await restoreTask(task.id);
    } catch (caughtError) {
      console.error('Failed to restore task:', caughtError);
    }
  };

  const handlePermanentDelete = async (taskId: string): Promise<void> => {
    if (!window.confirm('Permanently delete this task? This cannot be undone!')) return;
    try {
      await permanentlyDeleteTask(taskId);
    } catch (caughtError) {
      console.error('Failed to permanently delete task:', caughtError);
    }
  };

  return (
    <Card className="p-6 relative">
      <div className="absolute top-4 right-4">
        <IconButton size="sm" onClick={handleCloseWorkspace} ariaLabel="Close" className="text-gray-400 hover:text-gray-600">
          <MdClose size={20} />
        </IconButton>
      </div>

      <div className="flex items-center justify-between mb-4 pr-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Trash</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">{trashTasks.length} items</span>
      </div>

      {trashTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <p className="text-lg">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {trashTasks.map((task) => {
            const remainingDays = computeRemainingTrashDays(task);
            const isExpiringSoon = remainingDays <= 3;
            const taskExpired = hasTaskExpired(task);
            const shouldAutoDelete = remainingDays <= 0;
            const isRestoreBlocked = taskExpired || shouldAutoDelete;

            return (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isRestoreBlocked
                    ? 'border-red-400 dark:border-red-600 bg-red-100 dark:bg-red-900/20'
                    : isExpiringSoon
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {task.deletedAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Deleted: {new Date(task.deletedAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${isExpiringSoon ? 'text-red-500' : 'text-gray-400'}`}>
                      {remainingDays} days left
                    </span>
                    {task.type === 'temporary' && task.endDate && (
                      <span className="text-xs text-gray-400">
                        End: {parseLocalDate(task.endDate).toLocaleDateString()}
                      </span>
                    )}
                    {isRestoreBlocked && (
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-200 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                        Auto-delete
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <IconButton
                    size="sm"
                    onClick={() => void handleRestore(task)}
                    ariaLabel="Restore"
                    className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${isRestoreBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isRestoreBlocked}
                  >
                    <MdRestore size={18} />
                  </IconButton>
                  <IconButton
                    size="sm"
                    onClick={() => void handlePermanentDelete(task.id)}
                    ariaLabel="Delete permanently"
                    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <MdDelete size={18} />
                  </IconButton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {trashTasks.some((task) => typeof task.trashDays === 'number')
            ? 'Temporary tasks auto-delete after their end date passes'
            : `Tasks auto-delete after ${DEFAULT_TRASH_RETENTION_DAYS} days in trash`}
        </p>
      </div>
    </Card>
  );
}