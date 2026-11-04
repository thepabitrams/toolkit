// src/tools/productivity/bulletin-board/lib/helpers.ts
import { formatLocalDateKey, parseLocalDate, normalizeToStartOfDay } from './date';

export interface TaskSchedule {
  startDate: string;
  endDate?: string | null;
  freqValue: number;
  freqUnit: 'day' | 'week' | 'month';
  type: 'permanent' | 'temporary';
  isTrash?: boolean;
}

export interface OccurrenceWindowEntry {
  occurrenceDate: Date;
  localDateKey: string;
  occurrenceIndex: number;
}

const MAXIMUM_OCCURRENCE_ITERATIONS = 10000;

export function getOccurrenceDate(
  startDate: Date,
  frequencyValue: number,
  frequencyUnit: 'day' | 'week' | 'month',
  occurrenceIndex: number
): Date {
  const occurrenceDate = new Date(startDate);
  if (frequencyUnit === 'day') {
    occurrenceDate.setDate(occurrenceDate.getDate() + frequencyValue * occurrenceIndex);
  } else if (frequencyUnit === 'week') {
    occurrenceDate.setDate(occurrenceDate.getDate() + frequencyValue * 7 * occurrenceIndex);
  } else if (frequencyUnit === 'month') {
    occurrenceDate.setMonth(occurrenceDate.getMonth() + frequencyValue * occurrenceIndex);
  }
  return occurrenceDate;
}

export function getAnchorOccurrenceIndex(taskSchedule: TaskSchedule, referenceDate: Date): number {
  const startDate = parseLocalDate(taskSchedule.startDate);
  if (Number.isNaN(startDate.getTime())) {
    console.warn('Invalid start date encountered for a task schedule.');
    return 0;
  }
  let occurrenceIndex = 0;
  while (occurrenceIndex <= MAXIMUM_OCCURRENCE_ITERATIONS) {
    const occurrenceDate = getOccurrenceDate(startDate, taskSchedule.freqValue, taskSchedule.freqUnit, occurrenceIndex);
    if (Number.isNaN(occurrenceDate.getTime())) return 0;
    if (occurrenceDate >= referenceDate) return occurrenceIndex;
    occurrenceIndex += 1;
  }
  console.error('getAnchorOccurrenceIndex exceeded iteration limit.');
  return 0;
}

export function getTaskOccurrenceWindow(taskSchedule: TaskSchedule, referenceDate: Date): OccurrenceWindowEntry[] {
  const anchorOccurrenceIndex = getAnchorOccurrenceIndex(taskSchedule, normalizeToStartOfDay(referenceDate));
  const startDate = parseLocalDate(taskSchedule.startDate);
  const occurrenceWindowEntries: OccurrenceWindowEntry[] = [];
  for (let offsetIndex = anchorOccurrenceIndex - 4; offsetIndex <= anchorOccurrenceIndex + 4; offsetIndex += 1) {
    const occurrenceDate = getOccurrenceDate(startDate, taskSchedule.freqValue, taskSchedule.freqUnit, offsetIndex);
    occurrenceWindowEntries.push({
      occurrenceDate,
      localDateKey: formatLocalDateKey(occurrenceDate),
      occurrenceIndex: offsetIndex,
    });
  }
  return occurrenceWindowEntries;
}

export function isTaskActive(taskSchedule: TaskSchedule): boolean {
  if (taskSchedule.isTrash) return false;
  if (taskSchedule.type === 'permanent') return true;
  const currentTimestamp = Date.now();
  const startDate = parseLocalDate(taskSchedule.startDate);
  startDate.setHours(0, 0, 0, 0);
  if (currentTimestamp < startDate.getTime()) return false;
  if (taskSchedule.endDate) {
    const endDate = parseLocalDate(taskSchedule.endDate);
    endDate.setHours(23, 59, 59, 999);
    return currentTimestamp <= endDate.getTime();
  }
  return true;
}