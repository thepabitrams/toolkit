// src/tools/finance/split/components/ReceiptTemplate.tsx
import React, { forwardRef } from 'react';
import type { Transaction } from '../utils/settlement';
import { split } from '../config/split-config';

interface ReceiptTemplateProps {
  currency: string;
  totalExpense: number;
  perPersonShare: number;
  groupMembers: string[];
  settlementTransactions: Transaction[];
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(({
  currency,
  totalExpense,
  perPersonShare,
  groupMembers,
  settlementTransactions,
}, ref) => {
  const currentDateString = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  return (
    <div className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden">
      <div 
        ref={ref} 
        className="w-200 bg-white p-15 text-[#202124] font-sans flex flex-col gap-10"
      >
        <div>
          <h1 className="text-[32px] font-bold mb-6">BILL SPLIT SUMMARY</h1>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <span className="w-40 text-[16px] text-[#5F6368]">Total Spent:</span>
              <span className="text-[18px] font-bold text-[#1A73E8]">{currency} {totalExpense.toFixed(2)}</span>
            </div>
            <div className="flex items-center">
              <span className="w-40 text-[16px] text-[#5F6368]">Per Person:</span>
              <span className="text-[18px] font-bold text-[#1A73E8]">{currency} {perPersonShare.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <hr className="border-t border-[#E5E7EB]" />

        <div>
          <h2 className="text-[18px] font-bold mb-3">Group Members ({groupMembers.length})</h2>
          <p className="text-[16px] text-[#5F6368] leading-relaxed">
            {groupMembers.join(', ')}
          </p>
        </div>

        <hr className="border-t border-[#E5E7EB]" />

        <div>
          <h2 className="text-[18px] font-bold mb-4">Transactions ({settlementTransactions.length})</h2>
          
          {settlementTransactions.length === 0 ? (
            <p className="text-[16px] text-[#1A73E8]">All settled. Everyone is even.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {settlementTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center text-[16px]">
                  <span className="w-37.5 font-bold">{transaction.fromMember}</span>
                  <span className="w-12.5 text-[#5F6368] text-center">→</span>
                  <span className="flex-1 font-bold">{transaction.toMember}</span>
                  <span className="text-[18px] font-bold text-[#1A73E8]">
                    {currency} {transaction.transactionAmount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="border-t border-[#E5E7EB]" />

        <div className="flex flex-col gap-1.5">
          <h3 className="text-[16px] font-bold text-[#1A73E8]">{split.appName}</h3>
          <p className="text-[14px] text-[#5F6368]">Created by {split.authorName}</p>
          <p className="text-[14px] text-[#5F6368]">{split.url}</p>
          <p className="text-[14px] text-[#9AA0A6]">{currentDateString}</p>
        </div>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = 'ReceiptTemplate';