// src/tools/productivity/bulletin-board/store/taskStore.ts
import { create } from 'zustand';
import { parseLocalDate } from '../lib/date';
import { getTaskOccurrenceWindow } from '../lib/helpers';
import {
  readPersistedTasks,
  readPersistedTaskOrder,
  writePersistedTasksAndOrder,
  clearAllPersistedData,
} from '../lib/persistence';

const DEFAULT_TRASH_RETENTION_DAYS = 30;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export interface Task {
  id: string;
  title: string;
  type: 'permanent' | 'temporary';
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
  startDate: string;
  endDate?: string | null;
  checkedDates: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  isTrash: boolean;
  trashDays?: number | null;
}

interface TaskStore {
  tasks: Task[];
  taskOrder: string[];
  loadTasks: () => Promise<void>;
  addTask: (
    taskDraft: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'checkedDates' | 'deletedAt' | 'isTrash' | 'trashDays'>
  ) => Promise<void>;
  updateTask: (taskId: string, taskPatch: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, targetIndex: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  restoreTask: (taskId: string) => Promise<void>;
  permanentlyDeleteTask: (taskId: string) => Promise<void>;
  deleteAllTasks: () => Promise<void>;
  cleanupExpiredTasks: () => Promise<void>;
}

function generateTaskIdentifier(): string {
  return crypto.randomUUID();
}

function computeElapsedDays(startTimestamp: number, endTimestamp: number): number {
  return Math.floor((endTimestamp - startTimestamp) / MILLISECONDS_PER_DAY);
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  taskOrder: [],

  cleanupExpiredTasks: async (): Promise<void> => {
    const currentState = get();
    const currentTimestamp = Date.now();
    const trashRetentionCutoffTimestamp = currentTimestamp - DEFAULT_TRASH_RETENTION_DAYS * MILLISECONDS_PER_DAY;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    let hasChanges = false;

    const cleanedTasks = currentState.tasks
      .map((task): Task | null => {
        if (task.isTrash && task.deletedAt) {
          const deletedAtTimestamp = new Date(task.deletedAt).getTime();
          if (typeof task.trashDays === 'number') {
            const elapsedDaysSinceDeletion = computeElapsedDays(deletedAtTimestamp, currentTimestamp);
            if (elapsedDaysSinceDeletion >= task.trashDays) {
              hasChanges = true;
              return null;
            }
          } else if (deletedAtTimestamp <= trashRetentionCutoffTimestamp) {
            hasChanges = true;
            return null;
          }
          return task;
        }

        if (task.type === 'temporary' && task.endDate) {
          const endOfEndDate = parseLocalDate(task.endDate);
          endOfEndDate.setHours(23, 59, 59, 999);
          if (currentTimestamp > endOfEndDate.getTime()) {
            hasChanges = true;
            return null;
          }
        }

        if (task.checkedDates && task.checkedDates.length > 0) {
          const taskOccurrenceWindow = getTaskOccurrenceWindow(task, startOfToday);
          if (taskOccurrenceWindow.length > 0) {
            const oldestWindowTimestamp = parseLocalDate(taskOccurrenceWindow[0].localDateKey).getTime();
            const filteredCheckedDates = task.checkedDates.filter(
              (checkedDateKey) => parseLocalDate(checkedDateKey).getTime() >= oldestWindowTimestamp
            );
            if (filteredCheckedDates.length !== task.checkedDates.length) {
              hasChanges = true;
              return { ...task, checkedDates: filteredCheckedDates };
            }
          }
        }
        return task;
      })
      .filter((taskOrNull): taskOrNull is Task => taskOrNull !== null);

    if (hasChanges) {
      const validTaskIdentifiers = new Set(cleanedTasks.map((task) => task.id));
      const cleanedTaskOrder = currentState.taskOrder.filter((taskId) => validTaskIdentifiers.has(taskId));
      try {
        await writePersistedTasksAndOrder(cleanedTasks, cleanedTaskOrder);
        set({ tasks: cleanedTasks, taskOrder: cleanedTaskOrder });
      } catch (caughtError) {
        console.error('Failed to persist cleanup result:', caughtError);
      }
    }
  },

  loadTasks: async (): Promise<void> => {
    const persistedTasks = await readPersistedTasks();
    const persistedTaskOrder = await readPersistedTaskOrder();
    const validTaskIdentifiers = new Set(persistedTasks.map((task) => task.id));
    const filteredTaskOrder = persistedTaskOrder.filter((taskId) => validTaskIdentifiers.has(taskId));
    const missingTaskIdentifiers = persistedTasks
      .filter((task) => !filteredTaskOrder.includes(task.id) && !task.isTrash)
      .map((task) => task.id);
    const mergedTaskOrder = [...filteredTaskOrder, ...missingTaskIdentifiers];
    set({ tasks: persistedTasks, taskOrder: mergedTaskOrder });
    await get().cleanupExpiredTasks();
  },

  addTask: async (taskDraft): Promise<void> => {
    const currentState = get();
    const timestamp = new Date().toISOString();
    const newTask: Task = {
      ...taskDraft,
      id: generateTaskIdentifier(),
      checkedDates: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      isTrash: false,
      trashDays: null,
    };
    const nextTasks = [...currentState.tasks, newTask];
    const nextTaskOrder = [...currentState.taskOrder, newTask.id];
    await writePersistedTasksAndOrder(nextTasks, nextTaskOrder);
    set({ tasks: nextTasks, taskOrder: nextTaskOrder });
    await get().cleanupExpiredTasks();
  },

  updateTask: async (taskId, taskPatch): Promise<void> => {
    const currentState = get();
    const timestamp = new Date().toISOString();
    const nextTasks = currentState.tasks.map((task) =>
      task.id === taskId ? { ...task, ...taskPatch, updatedAt: timestamp } : task
    );
    await writePersistedTasksAndOrder(nextTasks, currentState.taskOrder);
    set({ tasks: nextTasks });
    await get().cleanupExpiredTasks();
  },

  moveTask: async (taskId, targetIndex): Promise<void> => {
    const currentState = get();
    const nextTaskOrder = [...currentState.taskOrder];
    const currentIndex = nextTaskOrder.indexOf(taskId);
    if (currentIndex === -1) return;
    nextTaskOrder.splice(currentIndex, 1);
    const clampedTargetIndex = Math.max(0, Math.min(nextTaskOrder.length, targetIndex));
    nextTaskOrder.splice(clampedTargetIndex, 0, taskId);
    await writePersistedTasksAndOrder(currentState.tasks, nextTaskOrder);
    set({ taskOrder: nextTaskOrder });
  },

  deleteTask: async (taskId): Promise<void> => {
    const currentState = get();
    const targetTask = currentState.tasks.find((task) => task.id === taskId);
    if (!targetTask) return;
    const timestamp = new Date().toISOString();

    if (targetTask.type === 'temporary' && targetTask.endDate) {
      const endOfEndDate = parseLocalDate(targetTask.endDate);
      endOfEndDate.setHours(23, 59, 59, 999);
      const remainingDaysUntilExpiry = Math.ceil((endOfEndDate.getTime() - Date.now()) / MILLISECONDS_PER_DAY);
      if (remainingDaysUntilExpiry <= 0) {
        const nextTasks = currentState.tasks.filter((task) => task.id !== taskId);
        const nextTaskOrder = currentState.taskOrder.filter((taskIdentifier) => taskIdentifier !== taskId);
        await writePersistedTasksAndOrder(nextTasks, nextTaskOrder);
        set({ tasks: nextTasks, taskOrder: nextTaskOrder });
        return;
      }
      const trashRetentionDays = Math.max(1, remainingDaysUntilExpiry);
      const nextTasks = currentState.tasks.map((task) =>
        task.id === taskId
          ? { ...task, isTrash: true, deletedAt: timestamp, updatedAt: timestamp, trashDays: trashRetentionDays }
          : task
      );
      const nextTaskOrder = currentState.taskOrder.filter((taskIdentifier) => taskIdentifier !== taskId);
      await writePersistedTasksAndOrder(nextTasks, nextTaskOrder);
      set({ tasks: nextTasks, taskOrder: nextTaskOrder });
      return;
    }

    const nextTasks = currentState.tasks.map((task) =>
      task.id === taskId
        ? { ...task, isTrash: true, deletedAt: timestamp, updatedAt: timestamp, trashDays: DEFAULT_TRASH_RETENTION_DAYS }
        : task
    );
    const nextTaskOrder = currentState.taskOrder.filter((taskIdentifier) => taskIdentifier !== taskId);
    await writePersistedTasksAndOrder(nextTasks, nextTaskOrder);
    set({ tasks: nextTasks, taskOrder: nextTaskOrder });
  },

  restoreTask: async (taskId): Promise<void> => {
    const currentState = get();
    const timestamp = new Date().toISOString();
    const nextTasks = currentState.tasks.map((task) =>
      task.id === taskId
        ? { ...task, isTrash: false, deletedAt: null, updatedAt: timestamp, trashDays: null }
        : task
    );
    const nextTaskOrder = [...currentState.taskOrder, taskId];
    await writePersistedTasksAndOrder(nextTasks, nextTaskOrder);
    set({ tasks: nextTasks, taskOrder: nextTaskOrder });
  },

  permanentlyDeleteTask: async (taskId): Promise<void> => {
    const currentState = get();
    const nextTasks = currentState.tasks.filter((task) => task.id !== taskId);
    const nextTaskOrder = currentState.taskOrder.filter((taskIdentifier) => taskIdentifier !== taskId);
    await writePersistedTasksAndOrder(nextTasks, nextTaskOrder);
    set({ tasks: nextTasks, taskOrder: nextTaskOrder });
  },

  deleteAllTasks: async (): Promise<void> => {
    set({ tasks: [], taskOrder: [] });
    await clearAllPersistedData();
  },
}));