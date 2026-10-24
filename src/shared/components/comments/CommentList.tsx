import React, { useMemo, useState } from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import type { Comment } from './types';
import { CommentNode } from './CommentNode';
import { getRootComments } from './commentTree';
import { useComments } from './useComments';

interface CommentListProps {
  toolId: string;
  onReplyClick: (comment: Comment) => void;
}

export function CommentList({ toolId, onReplyClick }: CommentListProps) {
  const { comments, isLoading, addComment } = useComments(toolId);
  const [draftRootCommentText, setDraftRootCommentText] = useState('');

  const rootLevelComments = useMemo(() => getRootComments(comments), [comments]);
  const isRootCommentSubmitDisabled = !draftRootCommentText.trim() || isLoading;

  const handleRootCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedCommentText = draftRootCommentText.trim();
    if (!trimmedCommentText) return;
    setDraftRootCommentText('');
    await addComment(trimmedCommentText);
  };

  return (
    <div className="w-full pb-4">
      <form onSubmit={handleRootCommentSubmit} className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center font-bold text-xs text-slate-500">
            GU
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={draftRootCommentText}
              onChange={(e) => setDraftRootCommentText(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#1e242d] border border-transparent focus:border-blue-500 rounded-full pl-4 pr-12 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Add a comment..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isRootCommentSubmitDisabled}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-slate-400 transition-all hover:bg-blue-700"
            >
              <svg className="w-4 h-4 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-col gap-5">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm animate-pulse">Loading discussion...</div>
        ) : rootLevelComments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-3">
            <FiMessageSquare className="w-10 h-10 opacity-20" />
            <p className="text-sm font-medium">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          rootLevelComments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              allComments={comments}
              onReplyClick={onReplyClick}
            />
          ))
        )}
      </div>
    </div>
  );
}