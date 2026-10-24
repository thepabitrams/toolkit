import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { Card } from '@/core/components/ui/card';
import { CommentList } from './CommentList';
import { ThreadView } from './ThreadView';
import { useComments } from './useComments';
import { signIn, useSession } from '@/core/lib/auth-client';
import type { Comment } from './types';

interface CommentSectionProps {
  toolId: string;
}

export function CommentSection({ toolId }: CommentSectionProps) {
  const [activeViewMode, setActiveViewMode] = useState<'list' | 'thread'>('list');
  const [activeReplyTargetComment, setActiveReplyTargetComment] = useState<Comment | null>(null);
  
  const { data: session, isPending: isAuthLoading } = useSession();
  const { comments, addComment, isLoading: isCommentsLoading } = useComments(toolId);

  const handleOpenCommentThread = (targetComment: Comment) => {
    setActiveReplyTargetComment(targetComment);
    setActiveViewMode('thread');
  };

  const handleCloseCommentThread = () => {
    setActiveViewMode('list');
    setTimeout(() => setActiveReplyTargetComment(null), 300);
  };

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: window.location.href,
    });
  };

  return (
    <Card className="w-full overflow-hidden flex flex-col min-h-125 h-150">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#171b22] z-10 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Discussion</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Share your thoughts or ask a question.</p>
        </div>
        
        {!isAuthLoading && !session && (
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-white dark:bg-[#1e242d] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all shrink-0 cursor-pointer"
          >
            <FcGoogle className="w-5 h-5" />
            <span>Sign in to comment</span>
          </button>
        )}

        {session?.user && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {session.user.name}
            </span>
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
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
                isAuthenticated={!!session?.user}
                currentUser={session?.user}
                onSignInRequired={handleGoogleSignIn}
                comments={comments}
                addComment={addComment}
                isLoading={isCommentsLoading}
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
                  allToolComments={comments}
                  addComment={addComment}
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