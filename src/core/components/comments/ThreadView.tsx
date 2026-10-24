import React, { useMemo, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import type { Comment } from './types';
import { CommentNode } from './CommentNode';
import { ReplyComposer } from './ReplyComposer';

interface ThreadViewProps {
  toolId: string;
  targetThreadComment: Comment;
  allToolComments: Comment[];
  addComment: (content: string, parentId: string | null) => Promise<void>;
  isComposerInitiallyOpen?: boolean;
  onCloseThreadView: () => void;
}

export function ThreadView({
  toolId,
  targetThreadComment,
  allToolComments,
  addComment,
  isComposerInitiallyOpen = false,
  onCloseThreadView,
}: ThreadViewProps) {
  const [activeReplyTarget, setActiveReplyTarget] = useState<Comment | null>(
    isComposerInitiallyOpen ? targetThreadComment : null
  );

  const isolatedThreadComments = useMemo(() => {
    return allToolComments.filter(
      (comment) =>
        comment.id === targetThreadComment.id ||
        comment.parentId === targetThreadComment.id
    );
  }, [targetThreadComment, allToolComments]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onCloseThreadView}
          className="p-2 -ml-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Replies</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-4 pr-2">
        <CommentNode
          comment={targetThreadComment}
          allComments={isolatedThreadComments}
          onReplyClick={setActiveReplyTarget}
          defaultExpanded
        />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
        {activeReplyTarget ? (
          <ReplyComposer
            toolId={toolId}
            replyTargetComment={activeReplyTarget}
            addComment={addComment}
            onCancelReply={() => setActiveReplyTarget(null)}
            onReplySubmitted={() => setActiveReplyTarget(null)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setActiveReplyTarget(targetThreadComment)}
            className="w-full text-left rounded-full bg-slate-100 dark:bg-[#1e242d] px-4 py-3 text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Add a reply...
          </button>
        )}
      </div>
    </div>
  );
}