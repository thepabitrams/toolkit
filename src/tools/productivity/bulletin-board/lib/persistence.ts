// src/tools/productivity/bulletin-board/lib/persistence.ts
import { db } from '@/core/services/indexeddb';
import { read, remove, write } from '@/core/services/opfs';
import type { Task } from '../store/taskStore';

const TASKS_STORAGE_KEY = 'bulletin-board-tasks.json';
const TASK_ORDER_STORAGE_KEY = 'bulletin-board-order.json';
const METADATA_RECORD_IDENTIFIER = 'bulletin-board-tasks';
const METADATA_OBJECT_STORE_NAME = 'fileStore';

interface PersistedMetadataRecord {
  id: string;
  storageKey: string;
}

async function readMetadataStorageKey(): Promise<string | null> {
  const metadataRecord = (await db.get(METADATA_OBJECT_STORE_NAME, METADATA_RECORD_IDENTIFIER)) as
    | PersistedMetadataRecord
    | undefined;
  return metadataRecord?.storageKey ?? null;
}

async function saveMetadataStorageKey(storageKey: string): Promise<void> {
  await db.put(METADATA_OBJECT_STORE_NAME, { id: METADATA_RECORD_IDENTIFIER, storageKey });
}

async function removeMetadataRecord(): Promise<void> {
  await db.delete(METADATA_OBJECT_STORE_NAME, METADATA_RECORD_IDENTIFIER);
}

export async function readPersistedTasks(): Promise<Task[]> {
  const metadataStorageKey = await readMetadataStorageKey();
  if (metadataStorageKey) {
    try {
      const tasksArrayBuffer = await read(metadataStorageKey);
      const tasksText = new TextDecoder().decode(tasksArrayBuffer);
      const parsedTasks = JSON.parse(tasksText);
      if (Array.isArray(parsedTasks)) return parsedTasks as Task[];
    } catch (caughtError) {
      console.warn('Failed to read tasks from OPFS, falling back to localStorage:', caughtError);
    }
  }
  const legacyTasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
  if (legacyTasksJson) {
    try {
      return JSON.parse(legacyTasksJson) as Task[];
    } catch (caughtError) {
      console.warn('Failed to parse tasks from localStorage:', caughtError);
      return [];
    }
  }
  return [];
}

export async function readPersistedTaskOrder(): Promise<string[]> {
  const legacyOrderJson = localStorage.getItem(TASK_ORDER_STORAGE_KEY);
  if (legacyOrderJson) {
    try {
      return JSON.parse(legacyOrderJson) as string[];
    } catch (caughtError) {
      console.warn('Failed to parse task order from localStorage:', caughtError);
      return [];
    }
  }
  return [];
}

export async function writePersistedTasksAndOrder(tasks: Task[], taskOrder: string[]): Promise<void> {
  const tasksJson = JSON.stringify(tasks, null, 2);
  const taskOrderJson = JSON.stringify(taskOrder, null, 2);
  const encoderInstance = new TextEncoder();
  let opfsWriteSucceeded = false;
  try {
    await write(TASKS_STORAGE_KEY, encoderInstance.encode(tasksJson).buffer);
    await write(TASK_ORDER_STORAGE_KEY, encoderInstance.encode(taskOrderJson).buffer);
    await saveMetadataStorageKey(TASKS_STORAGE_KEY);
    opfsWriteSucceeded = true;
  } catch (caughtError) {
    console.warn('OPFS persistence failed, falling back to localStorage only:', caughtError);
  }
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, tasksJson);
    localStorage.setItem(TASK_ORDER_STORAGE_KEY, taskOrderJson);
  } catch (caughtError) {
    console.error('localStorage persistence also failed:', caughtError);
    if (!opfsWriteSucceeded) {
      throw caughtError;
    }
  }
}

export async function clearAllPersistedData(): Promise<void> {
  try {
    await remove(TASKS_STORAGE_KEY);
  } catch (caughtError) {
    console.warn('Failed to remove tasks file from OPFS:', caughtError);
  }
  try {
    await remove(TASK_ORDER_STORAGE_KEY);
  } catch (caughtError) {
    console.warn('Failed to remove task order file from OPFS:', caughtError);
  }
  try {
    await removeMetadataRecord();
  } catch (caughtError) {
    console.warn('Failed to remove OPFS metadata record:', caughtError);
  }
  localStorage.removeItem(TASKS_STORAGE_KEY);
  localStorage.removeItem(TASK_ORDER_STORAGE_KEY);
}