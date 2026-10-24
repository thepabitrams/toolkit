import React, { useState } from 'react';
import type { Comment } from './types';

interface ReplyComposerProps {
  toolId: string;
  replyTargetComment: Comment;
  addComment: (content: string, parentId: string | null) => Promise<void>;
  onCancelReply: () => void;
  onReplySubmitted: () => void;
}

export function ReplyComposer({
  toolId,
  replyTargetComment,
  addComment,
  onCancelReply,
  onReplySubmitted,
}: ReplyComposerProps) {
  const [draftReplyText, setDraftReplyText] = useState('');
  const isSubmitDisabled = !draftReplyText.trim();

  const handleReplySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedReplyText = draftReplyText.trim();
    if (!trimmedReplyText) return;

    setDraftReplyText('');
    await addComment(trimmedReplyText, replyTargetComment.id);
    onReplySubmitted();
  };

  return (
    <div className="w-full pb-4">
      <form onSubmit={handleReplySubmit}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-xs text-slate-500">
            GU
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={draftReplyText}
              onChange={(e) => setDraftReplyText(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#1e242d] border border-transparent focus:border-blue-500 rounded-full pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder={`Reply to ${replyTargetComment.authorName}...`}
              autoFocus
            />
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-all hover:bg-blue-700"
            >
              <svg className="w-4 h-4 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}