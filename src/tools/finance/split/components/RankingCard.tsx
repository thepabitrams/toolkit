// src/tools/finance/split/components/RankingCard.tsx
import React from 'react';
import { useSplitStore } from '@/tools/finance/split/store/useSplitStore';

export function RankingCard() {
  const { selectedCurrency, groupMembers, expenseRecords } = useSplitStore();

  const memberRankingData = groupMembers.map((memberName) => ({
    name: memberName,
    totalPaid: expenseRecords
      .filter((expenseRecord) => expenseRecord.payerName === memberName)
      .reduce((runningTotal, expenseRecord) => runningTotal + expenseRecord.expenseAmount, 0)
  })).sort((firstMember, secondMember) => secondMember.totalPaid - firstMember.totalPaid);

  return (
    <div className="p-5 bg-transparent">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Ranking (Who Spent Most)
      </h3>
      <div className="space-y-2">
        {memberRankingData.map((memberData, rankingIndex) => (
          <div key={memberData.name} className="flex items-center gap-3">
            <div className="w-5 text-sm text-gray-400 font-bold">{rankingIndex + 1}.</div>
            <div className={`flex-1 p-3 rounded-lg border flex justify-between items-center ${
              rankingIndex === 0 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 shadow-sm' 
                : 'bg-transparent border-transparent'
            }`}>
              <span className={`text-sm ${
                rankingIndex === 0 
                  ? 'font-bold text-blue-700 dark:text-blue-300' 
                  : 'font-medium text-gray-600 dark:text-gray-400'
              }`}>
                {memberData.name}
              </span>
              <span className={`text-sm font-bold ${
                rankingIndex === 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {selectedCurrency} {memberData.totalPaid.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}