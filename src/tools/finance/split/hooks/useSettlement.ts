// src/tools/finance/split/hooks/useSettlement.ts
import { useMemo } from 'react';
import { useSplitStore } from '../store/useSplitStore';
import { calculateBalances, calculateTransactions } from '../utils/settlement';

export function useSettlement() {
  const { groupMembers, expenseRecords } = useSplitStore();

  return useMemo(() => {
    const totalExpense = expenseRecords.reduce((accumulator, expense) => accumulator + expense.expenseAmount, 0);
    const activeMembers = groupMembers.length > 0 ? groupMembers : ['No one'];
    const perPersonShare = activeMembers.length > 0 ? totalExpense / activeMembers.length : 0;
    
    const memberBalances = calculateBalances(groupMembers, expenseRecords);
    const settlementTransactions = calculateTransactions(memberBalances);

    return { 
      totalExpense, 
      perPersonShare, 
      memberBalances, 
      settlementTransactions 
    };
  }, [groupMembers, expenseRecords]);
}