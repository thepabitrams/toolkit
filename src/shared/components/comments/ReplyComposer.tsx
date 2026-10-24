// src/features/comments/components/ReplyComposer.tsx
import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useCommentStore, type Comment } from '@/shared/store/comment-store';
import { Button } from '@/core/components/ui/Button';

interface ReplyComposerProps {
  toolId: string;
  replyTarget: Comment;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReplyComposer({ toolId, replyTarget, onClose, onSuccess }: ReplyComposerProps) {
  const addComment = useCommentStore((state) => state.addComment);
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    addComment(toolId, replyText.trim(), replyTarget.id); // parentId = the comment being replied to
    setReplyText('');
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-slate-100 dark:border-slate-800 pt-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Replying to <span className="font-semibold text-slate-900 dark:text-white">{replyTarget.author}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close reply"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>

      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        rows={2}
        autoFocus
        placeholder="Add a reply..."
        aria-label={`Reply to ${replyTarget.author}`}
        className="w-full resize-none rounded-xl bg-slate-100 dark:bg-[#1e242d] border border-transparent focus:border-blue-500 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
      />

      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!replyText.trim()}>
          Reply
        </Button>
      </div>
    </form>
  );
}
