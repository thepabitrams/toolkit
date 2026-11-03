// src/tools/finance/split/components/SearchableSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MdSearch, MdKeyboardArrowDown, MdCheck } from 'react-icons/md';

interface SelectOptionData {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  availableOptions: SelectOptionData[];
  placeholderText?: string;
}

export function SearchableSelect({ 
  selectedValue, 
  onValueChange, 
  availableOptions, 
  placeholderText = 'Select...' 
}: SearchableSelectProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownCoordinates, setDropdownCoordinates] = useState({ top: 0, left: 0, width: 0 });
  
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDropdownOpen && triggerButtonRef.current) {
      const triggerRect = triggerButtonRef.current.getBoundingClientRect();
      setDropdownCoordinates({
        top: triggerRect.bottom + window.scrollY + 4,
        left: triggerRect.left + window.scrollX,
        width: triggerRect.width,
      });
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    function handleOutsideClick(mouseEvent: MouseEvent) {
      if (
        triggerButtonRef.current?.contains(mouseEvent.target as Node) || 
        dropdownMenuRef.current?.contains(mouseEvent.target as Node)
      ) {
        return;
      }
      setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredOptionList = availableOptions.filter((selectOption) =>
    selectOption.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSelectedOption = availableOptions.find((selectOption) => selectOption.value === selectedValue);

  return (
    <>
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full h-11 px-3 text-sm text-left bg-[#F1F3F4] dark:bg-gray-800/80 border border-transparent hover:border-[#DADCE0] dark:hover:border-gray-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] text-[#202124] dark:text-white flex justify-between items-center transition-all shadow-sm"
      >
        <span className="truncate font-medium">
          {activeSelectedOption ? activeSelectedOption.label : placeholderText}
        </span>
        <MdKeyboardArrowDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div 
              ref={dropdownMenuRef}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{ 
                position: 'absolute', 
                top: dropdownCoordinates.top, 
                left: dropdownCoordinates.left, 
                width: dropdownCoordinates.width, 
                zIndex: 9999 
              }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                <div className="relative">
                  <MdSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search currency..."
                    value={searchTerm}
                    onChange={(changeEvent) => setSearchTerm(changeEvent.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1">
                {filteredOptionList.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">No results found.</div>
                ) : (
                  filteredOptionList.map((selectOption) => (
                    <button
                      key={selectOption.value}
                      type="button"
                      onClick={() => {
                        onValueChange(selectOption.value);
                        setIsDropdownOpen(false);
                        setSearchTerm('');
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        selectOption.value === selectedValue
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>{selectOption.label}</span>
                      {selectOption.value === selectedValue && <MdCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}