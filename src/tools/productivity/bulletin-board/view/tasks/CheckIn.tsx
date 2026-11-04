// src/tools/productivity/bulletin-board/view/tasks/CheckIn.tsx
import React from 'react';
import { useTaskStore } from '../../store/taskStore';
import { formatLocalDateKey, parseLocalDate, normalizeToStartOfDay } from '../../lib/date';
import { getTaskOccurrenceWindow, type TaskSchedule } from '../../lib/helpers';

interface CheckInProps {
  taskId: string;
  checkedDates: string[];
  startDate: string;
  endDate?: string | null;
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
}

export function CheckIn({
  taskId,
  checkedDates,
  startDate,
  endDate,
  freqValue,
  freqUnit,
}: CheckInProps): React.JSX.Element {
  const updateTask = useTaskStore((state) => state.updateTask);
  const startOfToday = normalizeToStartOfDay(new Date());
  const todayKey = formatLocalDateKey(startOfToday);

  const taskSchedule: TaskSchedule = {
    startDate,
    endDate: endDate ?? null,
    freqValue,
    freqUnit,
    type: endDate ? 'temporary' : 'permanent',
  };

  const rawOccurrenceWindow = getTaskOccurrenceWindow(taskSchedule, startOfToday);
  const filteredOccurrenceWindow = rawOccurrenceWindow.filter(({ occurrenceDate }) => {
    if (!endDate) return true;
    const endOfEndDate = parseLocalDate(endDate);
    endOfEndDate.setHours(23, 59, 59, 999);
    return occurrenceDate.getTime() <= endOfEndDate.getTime();
  });

  const handleToggleCheckIn = async (occurrenceLocalDateKey: string): Promise<void> => {
    const isAlreadyChecked = checkedDates.includes(occurrenceLocalDateKey);
    const nextCheckedDates = isAlreadyChecked
      ? checkedDates.filter((checkedDateKey) => checkedDateKey !== occurrenceLocalDateKey)
      : [...checkedDates, occurrenceLocalDateKey];
    try {
      await updateTask(taskId, { checkedDates: nextCheckedDates });
    } catch (caughtError) {
      console.error('Failed to toggle check-in:', caughtError);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {filteredOccurrenceWindow.map(({ occurrenceDate, localDateKey }) => {
        const isChecked = checkedDates.includes(localDateKey);
        const isToday = localDateKey === todayKey;

        let buttonClassName =
          'w-10 h-12 rounded-lg text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 cursor-pointer';
        if (isChecked) {
          buttonClassName += ' bg-blue-500 text-white shadow-sm';
        } else {
          buttonClassName +=
            ' bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600';
        }
        if (isToday) {
          buttonClassName += ' shadow-md ring-2 ring-blue-300 ring-offset-2';
        }

        return (
          <button
            key={localDateKey}
            onClick={() => void handleToggleCheckIn(localDateKey)}
            className={buttonClassName}
          >
            <span>{occurrenceDate.getDate()}</span>
            <span className="text-[8px] opacity-80 uppercase">
              {occurrenceDate.toLocaleString('default', { month: 'short' })}
            </span>
          </button>
        );
      })}
    </div>
  );
}