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

const INITIAL_VISIBLE_REPLY_COUNT = 3;
const REPLIES_PAGINATION_SIZE = 5;
const CONNECTOR_GUTTER_PIXELS = 24;
const TRUNK_COLOR_CLASS_NAME = 'bg-slate-300 dark:bg-slate-600';

interface ThreadConnectorCurveProps {
  curveWidth: number;
}

const ThreadConnectorCurve = ({ curveWidth }: ThreadConnectorCurveProps) => (
  <svg
    className="absolute -left-[25px] top-0 h-full pointer-events-none z-0"
    style={{ width: curveWidth }}
    overflow="visible"
  >
    <path
      d={`M 1 0 L 1 8 Q 1 16 9 16 L ${curveWidth} 16`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-slate-300 dark:text-slate-600"
    />
  </svg>
);

export function CommentNode({
  comment,
  allComments,
  onReplyClick,
  depth = 0,
  defaultExpanded = false,
}: CommentNodeProps) {
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(defaultExpanded);
  const [visibleReplyCount, setVisibleReplyCount] = useState(INITIAL_VISIBLE_REPLY_COUNT);

  const isRootComment = depth === 0;
  const avatarSizeClassName = isRootComment ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs';
  const avatarCenterXCoordinate = isRootComment ? 20 : 16;

  const childComments = useMemo(
    () => getChildren(comment.id, allComments),
    [comment.id, allComments]
  );
  
  const hasChildComments = childComments.length > 0;

  const visibleChildComments = childComments.slice(0, visibleReplyCount);
  const hiddenCommentCount = childComments.length - visibleReplyCount;

  const handleToggleReplies = () => {
    setIsRepliesExpanded((previousState) => !previousState);
  };

  const handleShowMoreReplies = () => {
    setVisibleReplyCount((previousCount) => previousCount + REPLIES_PAGINATION_SIZE);
  };

  return (
    <div className="relative">
      <div className="flex gap-3 relative z-20">
        <div className="flex flex-col items-center shrink-0">
          <div
            className={`${avatarSizeClassName} rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold`}
          >
            {comment.avatar}
          </div>
          {hasChildComments && <div className={`w-0.5 flex-1 -mb-px ${TRUNK_COLOR_CLASS_NAME}`} />}
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
              type="button"
              onClick={() => onReplyClick(comment)}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors bg-transparent"
            >
              <FiCornerDownRight /> Reply
            </button>
          </div>
        </div>
      </div>

      {hasChildComments && (
        <div
          className="flex flex-col relative"
          style={{ paddingLeft: avatarCenterXCoordinate + CONNECTOR_GUTTER_PIXELS }}
        >
          {!isRepliesExpanded && (
            <div className="relative py-2">
              <ThreadConnectorCurve curveWidth={25} />
              <ViewRepliesButton
                totalReplyCount={childComments.length}
                isRepliesExpanded={false}
                onToggleReplies={handleToggleReplies}
              />
            </div>
          )}

          {isRepliesExpanded && (
            <>
              <div className="relative flex flex-col">
                <div
                  className={`absolute w-0.5 -top-px -bottom-px pointer-events-none z-0 ${TRUNK_COLOR_CLASS_NAME}`}
                  style={{ left: avatarCenterXCoordinate - 1 - (avatarCenterXCoordinate + CONNECTOR_GUTTER_PIXELS) }}
                />

                {visibleChildComments.map((childComment) => (
                  <div key={childComment.id} className="relative pb-4">
                    <ThreadConnectorCurve curveWidth={41} />
                    <CommentNode
                      comment={childComment}
                      allComments={allComments}
                      onReplyClick={onReplyClick}
                      depth={depth + 1}
                    />
                  </div>
                ))}

                {hiddenCommentCount > 0 && (
                  <div className="relative pb-4">
                    <ThreadConnectorCurve curveWidth={25} />
                    <button
                      type="button"
                      onClick={handleShowMoreReplies}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-transparent"
                    >
                      Show more replies ({hiddenCommentCount})
                    </button>
                  </div>
                )}
              </div>

              <div className="relative py-2">
                <ThreadConnectorCurve curveWidth={25} />
                <ViewRepliesButton
                  totalReplyCount={childComments.length}
                  isRepliesExpanded={true}
                  onToggleReplies={handleToggleReplies}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}