// src/features/comments/components/ThreadView.tsx
import React, { useMemo, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import type { Comment } from '@/shared/store/comment-store';
import { CommentNode } from './CommentNode';
import { ReplyComposer } from './ReplyComposer';
import { getThreadRoot } from './commentTree';

interface ThreadViewProps {
  toolId: string;
  /** the comment the user clicked (root or a nested reply) */
  targetComment: Comment;
  allComments: Comment[];
  /** open with the composer already showing, replying to targetComment */
  startReplying?: boolean;
  onClose: () => void;
}

export function ThreadView({ toolId, targetComment, allComments, startReplying = false, onClose }: ThreadViewProps) {
  // Always show the whole thread from its top-level comment, even if a nested reply was clicked.
  const root = useMemo(() => getThreadRoot(targetComment, allComments), [targetComment, allComments]);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(startReplying ? targetComment : null);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Back to comments"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Replies</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto py-4 pr-2">
        <CommentNode
          comment={root}
          allComments={allComments}
          onReplyClick={setReplyingTo}
          defaultExpanded
        />
      </div>

      {replyingTo ? (
        <ReplyComposer
          toolId={toolId}
          replyTarget={replyingTo}
          onClose={() => setReplyingTo(null)}
          onSuccess={() => setReplyingTo(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setReplyingTo(root)}
          className="shrink-0 w-full text-left rounded-full bg-slate-100 dark:bg-[#1e242d] px-4 py-3 text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          Add a reply...
        </button>
      )}
    </div>
  );
}
