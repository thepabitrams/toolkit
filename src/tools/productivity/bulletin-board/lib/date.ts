// src/tools/productivity/bulletin-board/lib/date.ts

export function formatLocalDateKey(dateValue: Date): string {
  const yearValue = dateValue.getFullYear();
  const monthValue = String(dateValue.getMonth() + 1).padStart(2, '0');
  const dayValue = String(dateValue.getDate()).padStart(2, '0');
  return `${yearValue}-${monthValue}-${dayValue}`;
}

export function parseLocalDate(dateKey: string): Date {
  const [yearValue, monthValue, dayValue] = dateKey.split('-').map(Number);
  return new Date(yearValue, monthValue - 1, dayValue);
}

export function normalizeToStartOfDay(dateValue: Date): Date {
  const normalizedDate = new Date(dateValue);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}