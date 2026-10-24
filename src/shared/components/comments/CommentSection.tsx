import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { Card } from '@/core/components/ui/card';
import { CommentList } from './CommentList';
import { ThreadView } from './ThreadView';
import { useCommentStore, type Comment } from '@/shared/store/comment-store';

interface CommentSectionProps {
  toolId: string;
}

export function CommentSection({ toolId }: CommentSectionProps) {
  const [activeViewMode, setActiveViewMode] = useState<'list' | 'thread'>('list');
  const [activeReplyTargetComment, setActiveReplyTargetComment] = useState<Comment | null>(null);

  const allStoreComments = useCommentStore((state) => state.comments);
  
  const commentsForActiveTool = useMemo(
    () => allStoreComments.filter((comment) => comment.toolId === toolId),
    [allStoreComments, toolId]
  );

  const handleOpenCommentThread = (targetComment: Comment) => {
    setActiveReplyTargetComment(targetComment);
    setActiveViewMode('thread');
  };

  const handleCloseCommentThread = () => {
    setActiveViewMode('list');
    setTimeout(() => setActiveReplyTargetComment(null), 300);
  };

  return (
    <Card className="w-full overflow-hidden flex flex-col min-h-125 h-150">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#171b22] z-10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Community Discussion
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Share your thoughts or ask a question.
          </p>
        </div>
        <button 
          type="button"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-white dark:bg-[#1e242d] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
        >
          <FcGoogle className="w-5 h-5" />
          <span>Sign in to comment</span>
        </button>
      </div>

      <div className="relative flex-1 bg-white dark:bg-[#171b22] overflow-hidden">
        <AnimatePresence mode="wait">
          {activeViewMode === 'list' ? (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 p-6 overflow-y-auto"
            >
              <CommentList 
                toolId={toolId} 
                onReplyClick={handleOpenCommentThread} 
              />
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
              {activeReplyTargetComment && (
                <ThreadView
                  toolId={toolId}
                  targetThreadComment={activeReplyTargetComment}
                  allToolComments={commentsForActiveTool}
                  isComposerInitiallyOpen={true}
                  onCloseThreadView={handleCloseCommentThread}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}