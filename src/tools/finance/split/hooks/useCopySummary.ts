// src/tools/finance/split/hooks/useCopySummary.ts
import { useCallback } from 'react';
import { formatSummaryText } from '../utils/formatSummary';
import type { Transaction } from '../utils/settlement';

interface UseCopySummaryProps {
  currency: string;
  totalExpense: number;
  perPersonShare: number;
  groupMembers: string[];
  settlementTransactions: Transaction[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useCopySummary({
  currency,
  totalExpense,
  perPersonShare,
  groupMembers,
  settlementTransactions,
  onSuccess,
  onError,
}: UseCopySummaryProps) {
  const copySummary = useCallback(async () => {
    try {
      const formattedSummaryText = formatSummaryText({
        currency,
        totalExpense,
        perPersonShare,
        groupMembers,
        settlementTransactions,
      });
      await navigator.clipboard.writeText(formattedSummaryText);
      onSuccess('Copied');
    } catch (error) {
      console.error('Copy failed:', error);
      onError('Failed to copy');
    }
  }, [currency, totalExpense, perPersonShare, groupMembers, settlementTransactions, onSuccess, onError]);

  return { copySummary };
}