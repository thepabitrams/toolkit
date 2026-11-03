// src/tools/finance/split/components/ResultsCard.tsx
import React, { useRef } from 'react';
import { useSplitStore } from '@/tools/finance/bill-splitter/store/useSplitStore';
import { useSettlement } from '@/tools/finance/bill-splitter/hooks/useSettlement';
import { useCopySummary } from '@/tools/finance/bill-splitter/hooks/useCopySummary';
import { useSaveImage } from '@/tools/finance/bill-splitter/hooks/useSaveImage';
import { ReceiptTemplate } from './ReceiptTemplate';
import { MdOutlineContentCopy, MdOutlineImage } from 'react-icons/md';

export function ResultsCard() {
  const { selectedCurrency, groupMembers } = useSplitStore();
  const { totalExpense, perPersonShare, settlementTransactions } = useSettlement();
  const receiptElementRef = useRef<HTMLDivElement>(null);
  
  const { copySummary } = useCopySummary({ 
    currency: selectedCurrency, 
    totalExpense, 
    perPersonShare, 
    groupMembers, 
    settlementTransactions, 
    onSuccess: () => alert('Copied!'), 
    onError: () => alert('Failed to copy') 
  });
  
  const { downloadReceiptImage } = useSaveImage({ 
    onSuccess: () => alert('Image saved!'), 
    onError: () => alert('Failed to save') 
  });

  return (
    <div className="flex flex-col h-full bg-transparent">
      <ReceiptTemplate
        ref={receiptElementRef}
        currency={selectedCurrency}
        totalExpense={totalExpense}
        perPersonShare={perPersonShare}
        groupMembers={groupMembers}
        settlementTransactions={settlementTransactions}
      />

      <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 border-b border-gray-100 dark:border-gray-800">
        <div className="p-5 text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {selectedCurrency} {totalExpense.toFixed(2)}
          </div>
        </div>
        <div className="p-5 text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Per Person</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {selectedCurrency} {perPersonShare.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex-1">
        <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4">
          Who Pays Whom
        </h3>
        <div className="space-y-2">
          {settlementTransactions.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-4">All settled!</div>
          ) : (
            settlementTransactions.map((transactionRecord, transactionIndex) => (
              <div key={transactionIndex} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <div className="text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200">{transactionRecord.fromMember}</span>
                  <span className="text-gray-500 dark:text-gray-400 mx-2">pays</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{transactionRecord.toMember}</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {selectedCurrency} {transactionRecord.transactionAmount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 flex gap-2 shrink-0">
        <button 
          onClick={copySummary} 
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <MdOutlineContentCopy className="w-4 h-4" /> Copy
        </button>
        <button 
          onClick={() => downloadReceiptImage(receiptElementRef)} 
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <MdOutlineImage className="w-4 h-4" /> Image
        </button>
      </div>
    </div>
  );
}