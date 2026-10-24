// src/features/comments/components/commentTree.ts
// Pure helpers that build the parent -> child structure from the flat store array.
import type { Comment } from '@/shared/store/comment-store';

/** Root comments = parentId is null, OR the parent no longer exists (orphan / deleted parent). Newest first. */
export function getRootComments(comments: Comment[]): Comment[] {
  const unique = new Map<Comment['id'], Comment>();
  comments.forEach((c) => unique.set(c.id, c)); // drops duplicate ids
  const list = Array.from(unique.values());
  return list
    .filter((c) => c.parentId == null || !unique.has(c.parentId))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Direct children of one comment, oldest first (deduped, never returns the comment itself). */
export function getChildren(parentId: Comment['id'], comments: Comment[]): Comment[] {
  const unique = new Map<Comment['id'], Comment>();
  comments.forEach((c) => {
    if (c.parentId === parentId && c.id !== parentId) unique.set(c.id, c);
  });
  return Array.from(unique.values()).sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * Every descendant of `rootId`, flattened (YouTube shows replies-to-replies
 * in the same list under the top comment). Oldest first.
 * The `seen` set prevents duplicates and infinite loops on circular data.
 */
export function getThreadReplies(rootId: Comment['id'], comments: Comment[]): Comment[] {
  const childrenOf = new Map<Comment['id'], Comment[]>();
  comments.forEach((c) => {
    if (c.parentId == null) return;
    const bucket = childrenOf.get(c.parentId);
    if (bucket) bucket.push(c);
    else childrenOf.set(c.parentId, [c]);
  });

  const seen = new Set<Comment['id']>([rootId]);
  const queue: Comment['id'][] = [rootId];
  const result: Comment[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    for (const child of childrenOf.get(id) ?? []) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      result.push(child);
      queue.push(child.id);
    }
  }
  return result.sort((a, b) => a.createdAt - b.createdAt);
}

/** Walk up parentId links to the top-level comment (safe against missing parents and cycles). */
export function getThreadRoot(comment: Comment, comments: Comment[]): Comment {
  const byId = new Map(comments.map((c) => [c.id, c] as const));
  const visited = new Set<Comment['id']>();
  let current = byId.get(comment.id) ?? comment; // use the live copy from the store
  while (current.parentId != null && !visited.has(current.id)) {
    visited.add(current.id);
    const parent = byId.get(current.parentId);
    if (!parent) break;
    current = parent;
  }
  return current;
}

/** "just now", "5 minutes ago", "3 days ago", "2 years ago" */
export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  const units: [number, string][] = [
    [31536000, 'year'],
    [2592000, 'month'],
    [604800, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, label] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}