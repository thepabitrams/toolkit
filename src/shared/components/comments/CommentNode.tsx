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

const INITIAL_VISIBLE_REPLIES = 3;
const REPLIES_PAGE_SIZE = 5;
const CONNECTOR_GUTTER_PX = 24;
const TRUNK_COLOR_CLASS = 'bg-slate-300 dark:bg-slate-600';

const ThreadCurve = ({ width }: { width: number }) => (
  <svg
    className="absolute left-[-25px] top-0 h-full pointer-events-none z-0"
    style={{ width }}
    overflow="visible"
  >
    <path
      d={`M 1 0 L 1 8 Q 1 16 9 16 L ${width} 16`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-300 dark:text-slate-600"
    />
  </svg>
);

export const CommentNode = ({
  comment,
  allComments,
  onReplyClick,
  depth = 0,
  defaultExpanded = false,
}: CommentNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [visibleReplyCount, setVisibleReplyCount] = useState(INITIAL_VISIBLE_REPLIES);

  const isRootComment = depth === 0;
  const avatarClassName = isRootComment ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const avatarCenterX = isRootComment ? 20 : 16;

  const replies = useMemo(
    () => getChildren(comment.id, allComments),
    [comment.id, allComments],
  );
  const hasReplies = replies.length > 0;

  const visibleReplies = replies.slice(0, visibleReplyCount);
  const hiddenReplyCount = replies.length - visibleReplyCount;

  return (
    <div className="relative">
      <div className="flex gap-3 relative z-20">
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`${avatarClassName} rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold`}
          >
            {comment.avatar}
          </div>
          {hasReplies && <div className={`w-[2px] flex-1 -mb-px ${TRUNK_COLOR_CLASS}`} />}
        </div>

        <div className="flex-1 min-w-0 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              {comment.author}
            </span>
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

      {hasReplies && (
        <div
          className="flex flex-col relative"
          style={{ paddingLeft: avatarCenterX + CONNECTOR_GUTTER_PX }}
        >
          {!isExpanded && (
            <div className="relative py-2">
              <ThreadCurve width={25} />
              <ViewRepliesButton
                replyCount={replies.length}
                isExpanded={false}
                onClick={() => setIsExpanded(true)}
              />
            </div>
          )}

          {isExpanded && (
            <>
              <div className="relative flex flex-col">
                <div
                  className={`absolute w-[2px] -top-px -bottom-px pointer-events-none z-0 ${TRUNK_COLOR_CLASS}`}
                  style={{ left: avatarCenterX - 1 - (avatarCenterX + CONNECTOR_GUTTER_PX) }}
                />

                {visibleReplies.map((reply) => (
                  <div key={reply.id} className="relative pb-4">
                    <ThreadCurve width={41} />
                    <CommentNode
                      comment={reply}
                      allComments={allComments}
                      onReplyClick={onReplyClick}
                      depth={depth + 1}
                    />
                  </div>
                ))}

                {hiddenReplyCount > 0 && (
                  <div className="relative pb-4">
                    <ThreadCurve width={25} />
                    <button
                      onClick={() => setVisibleReplyCount((count) => count + REPLIES_PAGE_SIZE)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-transparent"
                    >
                      Show more replies ({hiddenReplyCount})
                    </button>
                  </div>
                )}
              </div>

              <div className="relative py-2">
                <ThreadCurve width={25} />
                <ViewRepliesButton
                  replyCount={replies.length}
                  isExpanded={true}
                  onClick={() => setIsExpanded(false)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};