// src/tools/finance/split/utils/settlement.ts
import type { ExpenseRecord } from '../store/useSplitStore';

export interface Transaction {
  fromMember: string;
  toMember: string;
  transactionAmount: number;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateBalances(
  groupMembers: string[],
  expenseRecords: ExpenseRecord[]
): Map<string, number> {
  const memberBalances = new Map<string, number>();
  groupMembers.forEach((memberName) => memberBalances.set(memberName, 0));

  for (const expenseRecord of expenseRecords) {
    if (expenseRecord.sharedByMembers.length === 0) continue;
    
    const shareAmount = roundToTwoDecimals(expenseRecord.expenseAmount / expenseRecord.sharedByMembers.length);
    
    for (const memberName of expenseRecord.sharedByMembers) {
      const currentBalance = memberBalances.get(memberName) || 0;
      memberBalances.set(memberName, roundToTwoDecimals(currentBalance - shareAmount));
    }
    
    const currentPayerBalance = memberBalances.get(expenseRecord.payerName) || 0;
    memberBalances.set(expenseRecord.payerName, roundToTwoDecimals(currentPayerBalance + expenseRecord.expenseAmount));
  }

  for (const [memberName, balanceAmount] of memberBalances) {
    memberBalances.set(memberName, roundToTwoDecimals(balanceAmount));
  }

  return memberBalances;
}

export function calculateTransactions(
  memberBalances: Map<string, number>
): Transaction[] {
  const nonZeroBalances = Array.from(memberBalances.entries())
    .map(([memberName, balanceAmount]) => [memberName, roundToTwoDecimals(balanceAmount)] as [string, number])
    .filter(([, balanceAmount]) => Math.abs(balanceAmount) > 0.01);

  if (nonZeroBalances.length === 0) return [];

  const debtors = nonZeroBalances
    .filter(([, balanceAmount]) => balanceAmount < 0)
    .sort((debtorA, debtorB) => debtorA[1] - debtorB[1]);

  const creditors = nonZeroBalances
    .filter(([, balanceAmount]) => balanceAmount > 0)
    .sort((creditorA, creditorB) => creditorB[1] - creditorA[1]);

  const settlementTransactions: Transaction[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const [debtorName, debtAmount] = debtors[debtorIndex];
    const [creditorName, creditAmount] = creditors[creditorIndex];
    
    const transactionAmount = Math.min(Math.abs(debtAmount), creditAmount);
    const roundedTransactionAmount = roundToTwoDecimals(transactionAmount);

    if (roundedTransactionAmount > 0.01) {
      settlementTransactions.push({ 
        fromMember: debtorName, 
        toMember: creditorName, 
        transactionAmount: roundedTransactionAmount 
      });
    }

    debtors[debtorIndex] = [debtorName, roundToTwoDecimals(debtAmount + roundedTransactionAmount)];
    creditors[creditorIndex] = [creditorName, roundToTwoDecimals(creditAmount - roundedTransactionAmount)];

    if (Math.abs(debtors[debtorIndex][1]) < 0.01) debtorIndex++;
    if (Math.abs(creditors[creditorIndex][1]) < 0.01) creditorIndex++;
  }

  return settlementTransactions;
}