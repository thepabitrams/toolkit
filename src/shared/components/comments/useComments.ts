import { useState, useEffect, useCallback } from 'react';
import type { Comment } from './types';

export function useComments(toolId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?toolId=${toolId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoading(false);
    }
  }, [toolId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string, parentId: string | null = null) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          content,
          parentId,
          authorName: 'Guest User',
          authorAvatar: 'GU',
        }),
      });

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  return { comments, isLoading, addComment };
}