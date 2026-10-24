// src/features/comments/components/CommentSection.tsx
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiMessageSquare } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Card } from '@/core/components/ui/card';
import { CommentList } from './CommentList';
import { ThreadView } from './ThreadView';
import { useCommentStore, type Comment } from '@/shared/store/comment-store';

export function CommentSection({ toolId }: { toolId: string }) {
  const [view, setView] = useState<'list' | 'thread'>('list');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);

  const allStoreComments = useCommentStore((state) => state.comments);
  const toolComments = useMemo(
    () => allStoreComments.filter((c) => c.toolId === toolId),
    [allStoreComments, toolId]
  );

  const handleOpenThread = (comment: Comment) => {
    setReplyTarget(comment);
    setView('thread');
  };

  const handleCloseThread = () => {
    setView('list');
    setTimeout(() => setReplyTarget(null), 300);
  };

  return (
    <Card className="w-full overflow-hidden flex flex-col min-h-[500px] h-[600px]">
      {/* Fixed Main Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#171b22] z-10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiMessageSquare className="text-blue-500" />
            Community Discussion
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Share your thoughts or ask a question.
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-white dark:bg-[#1e242d] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer">
          <FcGoogle className="w-5 h-5" />
          <span>Sign in to comment</span>
        </button>
      </div>

      {/* Animated View Area */}
      <div className="relative flex-1 bg-white dark:bg-[#171b22] overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              <CommentList toolId={toolId} onReplyClick={handleOpenThread} />
            </motion.div>
          ) : (
            <motion.div
              key="thread-view"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 p-6 flex flex-col bg-white dark:bg-[#171b22]"
            >
              {replyTarget && (
                <ThreadView
                  toolId={toolId}
                  targetComment={replyTarget}
                  allComments={toolComments}
                  startReplying
                  onClose={handleCloseThread}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
