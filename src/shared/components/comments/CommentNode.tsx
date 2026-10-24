// src/features/comments/components/CommentNode.tsx
import React, { useMemo, useState } from 'react';
import { FiCornerDownRight } from 'react-icons/fi';
import type { Comment } from '@/shared/store/comment-store';
import { ViewRepliesButton } from './ViewRepliesButton';
import { getChildren, formatTimeAgo } from './commentTree';

interface CommentNodeProps {
  comment: Comment;
  allComments: Comment[];
  onReplyClick: (comment: Comment) => void;
  depth?: number;
  defaultExpanded?: boolean;
}

export const CommentNode = ({
  comment,
  allComments,
  onReplyClick,
  depth = 0,
  defaultExpanded = false,
}: CommentNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [visibleCount, setVisibleCount] = useState(3);

  const isRoot = depth === 0;
  const avatarClass = isRoot ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';

  const children = useMemo(() => getChildren(comment.id, allComments), [comment.id, allComments]);
  const hasChildren = children.length > 0;

  const visible = children.slice(0, visibleCount);
  const remaining = children.length - visibleCount;

  return (
    <div className="relative">
      
      {/* 1. PARENT ROW */}
      <div className="flex gap-3 relative z-20">
        <div className={`${avatarClass} shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold`}>
          {comment.avatar}
        </div>

        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">{comment.author}</span>
            <span className="text-xs text-slate-400">{formatTimeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {comment.content}
          </p>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => onReplyClick(comment)}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <FiCornerDownRight /> Reply
            </button>
          </div>
        </div>
      </div>

      {/* 2. THE CONTINUOUS TRUNK LINE 
          Starts exactly at the bottom of the parent avatar (top-[40px]) 
          and stretches to the absolute bottom of the tree. */}
      {hasChildren && (
        <div className="absolute left-[19px] top-[40px] bottom-0 w-[2px] bg-slate-200 dark:bg-slate-700 z-0 pointer-events-none" />
      )}

      {/* 3. CHILDREN CONTAINER 
          Indented exactly 44px so the text aligns under the parent text. */}
      {hasChildren && (
        <div className="flex flex-col pl-[44px] mt-2 relative">
          
          {/* --- COLLAPSED STATE --- */}
          {!isExpanded && (
            <div className="relative py-2">
              {/* Elbow to Button: Starts at trunk (-25px) top-0. Height 16px hits the center. */}
              <div className="absolute left-[-25px] top-0 w-[25px] h-[16px] border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl z-10 pointer-events-none" />
              {/* Mask: Stops the trunk exactly at the center (top-16px) */}
              <div className="absolute left-[-26px] top-[16px] bottom-[-16px] w-[4px] bg-white dark:bg-[#171b22] z-10 pointer-events-none" />
              
              <ViewRepliesButton
                replyCount={children.length}
                isExpanded={false}
                onClick={() => setIsExpanded(true)}
              />
            </div>
          )}

          {/* --- EXPANDED STATE --- */}
          {isExpanded && (
            <div className="flex flex-col gap-4">
              {visible.map((child, index) => {
                const isLastChild = index === visible.length - 1;
                const isVeryLast = isLastChild && remaining === 0;
                
                return (
                  <div key={child.id} className="relative">
                    {/* Elbow to Child: Starts at trunk (-25px) top-0. Width 41px hits the avatar center (16px) */}
                    <div className="absolute left-[-25px] top-0 w-[41px] h-[16px] border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl z-10 pointer-events-none" />
                    
                    {/* Mask: Only if it's the very last element in the tree */}
                    {isVeryLast && (
                      <div className="absolute left-[-26px] top-[16px] bottom-[-20px] w-[4px] bg-white dark:bg-[#171b22] z-10 pointer-events-none" />
                    )}
                    
                    <CommentNode
                      comment={child}
                      allComments={allComments}
                      onReplyClick={onReplyClick}
                      depth={depth + 1}
                    />
                  </div>
                );
              })}

              {remaining > 0 && (
                <div className="relative">
                  {/* Elbow to Show More */}
                  <div className="absolute left-[-25px] top-0 w-[25px] h-[16px] border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl z-10 pointer-events-none" />
                  <button
                    onClick={() => setVisibleCount((c) => c + 5)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-transparent"
                  >
                    Show more replies ({remaining})
                  </button>
                </div>
              )}

              {/* Hide replies button */}
              <div className="relative py-2">
                {/* Elbow to Hide Replies */}
                <div className="absolute left-[-25px] top-0 w-[25px] h-[16px] border-l-2 border-b-2 border-slate-200 dark:border-slate-700 rounded-bl-xl z-10 pointer-events-none" />
                {/* Mask: Stops the trunk exactly here */}
                <div className="absolute left-[-26px] top-[16px] bottom-[-16px] w-[4px] bg-white dark:bg-[#171b22] z-10 pointer-events-none" />
                
                <ViewRepliesButton
                  replyCount={children.length}
                  isExpanded={true}
                  onClick={() => setIsExpanded(false)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};