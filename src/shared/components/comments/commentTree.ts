import type { Comment } from '@/shared/store/comment-store';

export function getRootComments(allComments: Comment[]): Comment[] {
  const uniqueCommentsById = new Map<Comment['id'], Comment>();
  
  allComments.forEach((comment) => {
    uniqueCommentsById.set(comment.id, comment);
  });

  const deduplicatedComments = Array.from(uniqueCommentsById.values());

  return deduplicatedComments
    .filter((comment) => 
      comment.parentId == null || !uniqueCommentsById.has(comment.parentId)
    )
    .sort((firstComment, secondComment) => 
      secondComment.createdAt - firstComment.createdAt
    );
}

export function getChildren(parentId: Comment['id'], allComments: Comment[]): Comment[] {
  const uniqueChildrenById = new Map<Comment['id'], Comment>();

  allComments.forEach((comment) => {
    if (comment.parentId === parentId && comment.id !== parentId) {
      uniqueChildrenById.set(comment.id, comment);
    }
  });

  return Array.from(uniqueChildrenById.values()).sort(
    (firstComment, secondComment) => 
      firstComment.createdAt - secondComment.createdAt
  );
}

export function getThreadReplies(rootCommentId: Comment['id'], allComments: Comment[]): Comment[] {
  const childrenByParentId = new Map<Comment['id'], Comment[]>();

  allComments.forEach((comment) => {
    if (comment.parentId == null) return;
    
    const existingChildren = childrenByParentId.get(comment.parentId);
    if (existingChildren) {
      existingChildren.push(comment);
    } else {
      childrenByParentId.set(comment.parentId, [comment]);
    }
  });

  const visitedCommentIds = new Set<Comment['id']>([rootCommentId]);
  const commentQueue: Comment['id'][] = [rootCommentId];
  const flattenedReplies: Comment[] = [];

  while (commentQueue.length > 0) {
    const currentCommentId = commentQueue.shift()!;
    const directChildren = childrenByParentId.get(currentCommentId) ?? [];

    for (const childComment of directChildren) {
      if (visitedCommentIds.has(childComment.id)) continue;
      
      visitedCommentIds.add(childComment.id);
      flattenedReplies.push(childComment);
      commentQueue.push(childComment.id);
    }
  }

  return flattenedReplies.sort(
    (firstComment, secondComment) => 
      firstComment.createdAt - secondComment.createdAt
  );
}

export function getThreadRoot(targetComment: Comment, allComments: Comment[]): Comment {
  const commentsById = new Map<Comment['id'], Comment>(
    allComments.map((comment) => [comment.id, comment] as const)
  );
  
  const visitedCommentIds = new Set<Comment['id']>();
  let currentComment = commentsById.get(targetComment.id) ?? targetComment;

  while (currentComment.parentId != null && !visitedCommentIds.has(currentComment.id)) {
    visitedCommentIds.add(currentComment.id);
    
    const parentComment = commentsById.get(currentComment.parentId);
    if (!parentComment) break;
    
    currentComment = parentComment;
  }

  return currentComment;
}

export function formatTimeAgo(timestamp: number): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  
  const timeUnits: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];

  for (const [unitSizeInSeconds, unitName] of timeUnits) {
    const unitCount = Math.floor(elapsedSeconds / unitSizeInSeconds);
    
    if (unitCount >= 1) {
      return `${unitCount} ${unitName}${unitCount > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}