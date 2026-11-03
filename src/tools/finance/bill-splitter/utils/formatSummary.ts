// src/tools/finance/split/utils/formatSummary.ts
import type { Transaction } from './settlement';
import { split } from '../config/split-config';

interface SummaryTextData {
  currency: string;
  totalExpense: number;
  perPersonShare: number;
  groupMembers: string[];
  settlementTransactions: Transaction[];
}

export function formatSummaryText({ 
  currency, 
  totalExpense, 
  perPersonShare, 
  groupMembers, 
  settlementTransactions 
}: SummaryTextData): string {
  const summaryLines: string[] = [];
  
  summaryLines.push('BILL SPLIT SUMMARY');
  summaryLines.push('');
  
  summaryLines.push(`Total Spent:         ${currency} ${totalExpense.toFixed(2)}`);
  summaryLines.push(`Per Person:          ${currency} ${perPersonShare.toFixed(2)}`);
  summaryLines.push('');
  
  summaryLines.push(`Group Members (${groupMembers.length})`);
  summaryLines.push('');
  summaryLines.push(groupMembers.join(', '));
  summaryLines.push('');
  
  summaryLines.push(`Transactions (${settlementTransactions.length})`);
  summaryLines.push('');
  
  if (settlementTransactions.length === 0) {
    summaryLines.push('All settled. Everyone is even.');
  } else {
    const maxFromLength = Math.max(...settlementTransactions.map(transaction => transaction.fromMember.length));
    const maxToLength = Math.max(...settlementTransactions.map(transaction => transaction.toMember.length));
    
    for (const transactionRecord of settlementTransactions) {
      const paddedFromMember = transactionRecord.fromMember.padEnd(maxFromLength);
      const paddedToMember = transactionRecord.toMember.padEnd(maxToLength);
      const formattedAmount = `${currency} ${transactionRecord.transactionAmount.toFixed(2)}`;
      
      summaryLines.push(`${paddedFromMember}         →  ${paddedToMember}         ${formattedAmount}`);
    }
  }
  
  summaryLines.push('');
  
  const currentDateString = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  summaryLines.push(split.appName);
  summaryLines.push(`Created by ${split.authorName}`);
  summaryLines.push(split.url);
  summaryLines.push(currentDateString);

  return summaryLines.join('\n');
}