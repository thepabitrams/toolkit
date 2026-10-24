// src/features/comments/components/ViewRepliesButton.tsx
import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ViewRepliesButtonProps {
  replyCount: number;
  isExpanded?: boolean;
  onClick: () => void;
}

export const ViewRepliesButton = ({ replyCount, isExpanded = false, onClick }: ViewRepliesButtonProps) => {
  if (replyCount === 0) return null;

  const Icon = isExpanded ? FiChevronUp : FiChevronDown;
  const label = isExpanded ? 'Hide replies' : `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isExpanded}
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors z-20 relative"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};