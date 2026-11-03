// src/tools/finance/split/hooks/useCopySummary.ts
import { useCallback } from 'react';
import { formatSummaryText } from '../utils/formatSummary';
import type { Transaction } from '../utils/settlement';

interface UseCopySummaryProps {
  currency: string;
  total: number;
  perPerson: number;
  people: string[];
  transactions: Transaction[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useCopySummary({
  currency,
  total,
  perPerson,
  people,
  transactions,
  onSuccess,
  onError,
}: UseCopySummaryProps) {
  const copySummary = useCallback(async () => {
    try {
      const text = formatSummaryText({
        currency,
        total,
        perPerson,
        people,
        transactions,
      });
      await navigator.clipboard.writeText(text);
      onSuccess('Copied');
    } catch (err) {
      console.error('Copy failed:', err);
      onError('Failed to copy');
    }
  }, [currency, total, perPerson, people, transactions, onSuccess, onError]);

  return { copySummary };
}