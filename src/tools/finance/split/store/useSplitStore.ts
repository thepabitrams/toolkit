// src/tools/finance/split/store/useSplitStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ExpenseRecord {
  identifier: string;
  expenseDescription: string;
  expenseAmount: number;
  payerName: string;
  sharedByMembers: string[];
}

interface SplitStoreState {
  groupMembers: string[];
  expenseRecords: ExpenseRecord[];
  selectedCurrency: string;
  lastActivityTimestamp: number;

  addGroupMember: (memberName: string) => void;
  removeGroupMember: (memberName: string) => void;
  recordExpense: (payerName: string, expenseAmount: number, expenseDescription: string) => void;
  deleteExpense: (expenseIdentifier: string) => void;
  updateCurrency: (currencyCode: string) => void;
  resetSession: () => void;
  purgeExpiredData: () => void;
  initializeStore: () => void;
}

const DATA_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

export const useSplitStore = create<SplitStoreState>()(
  persist(
    (set, get) => ({
      groupMembers: [],
      expenseRecords: [],
      selectedCurrency: 'INR',
      lastActivityTimestamp: Date.now(),

      addGroupMember: (memberName) => set((currentState) => ({
        groupMembers: [...currentState.groupMembers, memberName.trim()],
        lastActivityTimestamp: Date.now(),
      })),

      removeGroupMember: (memberName) => set((currentState) => ({
        groupMembers: currentState.groupMembers.filter((member) => member !== memberName),
        expenseRecords: currentState.expenseRecords
          .filter((expense) => expense.payerName !== memberName)
          .map((expense) => ({
            ...expense,
            sharedByMembers: expense.sharedByMembers.filter((member) => member !== memberName),
          })),
        lastActivityTimestamp: Date.now(),
      })),

      recordExpense: (payerName, expenseAmount, expenseDescription) => set((currentState) => ({
        expenseRecords: [
          ...currentState.expenseRecords,
          {
            identifier: crypto.randomUUID(),
            expenseDescription: expenseDescription || 'Expense',
            expenseAmount,
            payerName,
            sharedByMembers: [...currentState.groupMembers],
          },
        ],
        lastActivityTimestamp: Date.now(),
      })),

      deleteExpense: (expenseIdentifier) => set((currentState) => ({
        expenseRecords: currentState.expenseRecords.filter((expense) => expense.identifier !== expenseIdentifier),
        lastActivityTimestamp: Date.now(),
      })),

      updateCurrency: (currencyCode) => set({ 
        selectedCurrency: currencyCode, 
        lastActivityTimestamp: Date.now() 
      }),

      resetSession: () => set({ 
        groupMembers: [], 
        expenseRecords: [], 
        lastActivityTimestamp: Date.now() 
      }),

      purgeExpiredData: () => {
        const { lastActivityTimestamp } = get();
        if (Date.now() - lastActivityTimestamp > DATA_EXPIRATION_MS) {
          set({ 
            groupMembers: [], 
            expenseRecords: [], 
            lastActivityTimestamp: Date.now() 
          });
        }
      },

      initializeStore: () => {
        if (!get().lastActivityTimestamp) {
          set({ lastActivityTimestamp: Date.now() });
        }
      },
    }),
    {
      name: 'toolkit-finance-split',
      storage: createJSONStorage(() => localStorage),
    }
  )
);