// src/tools/finance/split/components/CurrencyCard.tsx
import React from 'react';
import { useSplitStore } from '@/tools/finance/split/store/useSplitStore';
import { CURRENCIES } from '@/tools/finance/split/data/currencyData';
import { SearchableSelect } from './SearchableSelect';

export function CurrencyCard() {
  const { selectedCurrency, updateCurrency } = useSplitStore();
  
  const activeCurrencyData = CURRENCIES.find((currencyItem) => currencyItem.value === selectedCurrency);
  
  const currencySelectOptions = CURRENCIES.map((currencyItem) => ({
    value: currencyItem.value,
    label: currencyItem.label,
  }));

  return (
    <div className="p-5 flex flex-col gap-1.5 bg-transparent">
      <label className="text-[#5F6368] dark:text-gray-400 text-[11px] font-medium uppercase tracking-wide">
        Currency
      </label>
      
      <div className="flex items-center gap-3">
        <span className="text-lg font-medium text-gray-500 dark:text-gray-400 min-w-7 text-center shrink-0">
          {activeCurrencyData?.symbol || '💱'}
        </span>
        
        <div className="flex-1">
          <SearchableSelect
            selectedValue={selectedCurrency}
            onValueChange={updateCurrency}
            availableOptions={currencySelectOptions}
            placeholderText="Select currency..."
          />
        </div>
      </div>
    </div>
  );
}