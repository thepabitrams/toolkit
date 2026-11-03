// src/tools/finance/split/components/LedgerWorkspace.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSplitStore } from '@/tools/finance/split/store/useSplitStore';
import { MdDeleteOutline } from 'react-icons/md';

export function LedgerWorkspace() {
  const { 
    groupMembers, 
    addGroupMember, 
    expenseRecords, 
    recordExpense, 
    deleteExpense, 
    selectedCurrency 
  } = useSplitStore();
  
  const [activeMemberName, setActiveMemberName] = useState<string | null>(null);
  const [newMemberInputValue, setNewMemberInputValue] = useState('');
  const [isInputShaking, setIsInputShaking] = useState(false);
  const [expenseAmountInput, setExpenseAmountInput] = useState('');
  const [expenseDescriptionInput, setExpenseDescriptionInput] = useState('');

  useEffect(() => {
    if (groupMembers.length > 0 && (!activeMemberName || !groupMembers.includes(activeMemberName))) {
      setActiveMemberName(groupMembers[0]);
    } else if (groupMembers.length === 0) {
      setActiveMemberName(null);
    }
  }, [groupMembers, activeMemberName]);

  const handleMemberCreation = () => {
    const trimmedMemberName = newMemberInputValue.trim();
    if (!trimmedMemberName) {
      setIsInputShaking(true);
      setTimeout(() => setIsInputShaking(false), 500);
      return;
    }
    
    const normalizedMemberName = trimmedMemberName.charAt(0).toUpperCase() + trimmedMemberName.slice(1).toLowerCase();
    
    if (!groupMembers.includes(normalizedMemberName)) {
      addGroupMember(normalizedMemberName);
      setNewMemberInputValue('');
      setActiveMemberName(normalizedMemberName);
    }
  };

  const handleExpenseSubmission = () => {
    if (!activeMemberName) return;
    
    const numericExpenseAmount = parseFloat(expenseAmountInput);
    if (isNaN(numericExpenseAmount) || numericExpenseAmount <= 0) return;
    
    recordExpense(activeMemberName, numericExpenseAmount, expenseDescriptionInput);
    setExpenseAmountInput('');
    setExpenseDescriptionInput('');
  };

  const activeMemberExpenses = expenseRecords.filter((expenseRecord) => expenseRecord.payerName === activeMemberName);
  const activeMemberTotalPaid = activeMemberExpenses.reduce((runningTotal, expenseRecord) => runningTotal + expenseRecord.expenseAmount, 0);

  return (
    <div className="flex flex-col bg-transparent h-full">
      
      <div className="p-5 bg-transparent border-b border-gray-100 dark:border-gray-800 shrink-0">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Who is in the group?</h2>
        
        <div className="flex gap-2 mb-4">
          <motion.div animate={isInputShaking ? { x: [-10, 10, -10, 10, 0] } : {}} className="flex-1">
            <input
              type="text"
              value={newMemberInputValue}
              onChange={(changeEvent) => setNewMemberInputValue(changeEvent.target.value)}
              onKeyDown={(keyboardEvent) => keyboardEvent.key === 'Enter' && handleMemberCreation()}
              placeholder="Add person name..."
              className="w-full h-11 px-3 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </motion.div>
          <button onClick={handleMemberCreation} className="h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors">
            Add
          </button>
        </div>

        <div className="max-h-25 overflow-y-auto pr-1">
          <div className="flex flex-wrap gap-2">
            {groupMembers.map((memberName) => {
              const isActiveMember = activeMemberName === memberName;
              return (
                <button
                  key={memberName}
                  onClick={() => setActiveMemberName(memberName)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActiveMember
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {memberName}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeMemberName ? (
        <div className="flex flex-col bg-transparent">
          <div className="bg-blue-50/50 dark:bg-blue-900/10 px-5 py-4 border-b border-blue-100 dark:border-blue-900/30 flex justify-between items-center shrink-0">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">{activeMemberName}'s Expenses</h2>
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Total: {selectedCurrency} {activeMemberTotalPaid.toFixed(2)}
            </div>
          </div>

          <div className="p-5 space-y-3 bg-gray-50/30 dark:bg-gray-800/10 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <input
              type="number"
              placeholder="Amount"
              value={expenseAmountInput}
              onChange={(changeEvent) => setExpenseAmountInput(changeEvent.target.value)}
              className="w-full h-11 px-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="What was it for? (e.g. Dinner)"
              value={expenseDescriptionInput}
              onChange={(changeEvent) => setExpenseDescriptionInput(changeEvent.target.value)}
              onKeyDown={(keyboardEvent) => keyboardEvent.key === 'Enter' && handleExpenseSubmission()}
              className="w-full h-11 px-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button onClick={handleExpenseSubmission} className="w-full h-11 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium text-sm rounded-lg transition-colors">
              Add to {activeMemberName}
            </button>
          </div>

          <div className="p-5 space-y-2 h-55 overflow-y-auto">
            <AnimatePresence>
              {activeMemberExpenses.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-4">No expenses yet.</div>
              ) : (
                activeMemberExpenses.map((expenseRecord) => (
                  <motion.div
                    key={expenseRecord.identifier}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-sm"
                  >
                    <div>
                      <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{expenseRecord.expenseDescription}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Shared by {expenseRecord.sharedByMembers.length} people
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {selectedCurrency} {expenseRecord.expenseAmount.toFixed(2)}
                      </span>
                      <button onClick={() => deleteExpense(expenseRecord.identifier)} className="text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 p-1 transition-colors">
                        <MdDeleteOutline className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 bg-transparent flex-1">
          Add a person above to start adding expenses.
        </div>
      )}
    </div>
  );
}