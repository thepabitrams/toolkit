import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface ViewRepliesButtonProps {
  totalReplyCount: number;
  isRepliesExpanded?: boolean;
  onToggleReplies: () => void;
}

export function ViewRepliesButton({
  totalReplyCount,
  isRepliesExpanded = false,
  onToggleReplies,
}: ViewRepliesButtonProps) {
  if (totalReplyCount === 0) return null;

  const ChevronIcon = isRepliesExpanded ? FiChevronUp : FiChevronDown;
  const replyNoun = totalReplyCount === 1 ? 'reply' : 'replies';
  const buttonLabel = isRepliesExpanded ? 'Hide replies' : `${totalReplyCount} ${replyNoun}`;

  return (
    <button
      type="button"
      onClick={onToggleReplies}
      aria-expanded={isRepliesExpanded}
      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors z-20 relative bg-transparent"
    >
      <ChevronIcon className="w-4 h-4" />
      <span>{buttonLabel}</span>
    </button>
  );
}