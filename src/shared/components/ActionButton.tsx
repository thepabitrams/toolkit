import React from 'react';
import { Button } from '@/shared/components/Button';
import { useAction } from '@/shared/hooks/useAction';
import { tools } from '@/config/tools';

interface ActionButtonProps {
  toolId: string;
  variant: 'single' | 'multiple';
  className?: string;
  onToolSelect: (selectedToolId: string, variant: 'single' | 'multiple') => Promise<void>;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  toolId, variant, className = '', onToolSelect,
}) => {
  const { isOpen, open, close } = useAction({ toolId });

  const handleSelect = async (selectedToolId: string) => {
    if (!selectedToolId) return;
    await onToolSelect(selectedToolId, variant);
    close();
  };

  return (
    <>
      <Button onClick={open} variant="ghost" className={`relative flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 active:scale-[0.97] min-w-20 ${className}`}>
        <span>{variant === 'single' ? 'Action' : 'Action (All)'}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold">Select Target Tool</h2>
              <button onClick={close} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">✕</button>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.slug}
                  onClick={() => handleSelect(tool.slug)}
                  className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white dark:bg-gray-900"
                >
                  <h3 className="font-medium text-sm">{tool.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{tool.seoDescription}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};