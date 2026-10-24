import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc, inArray, isNull } from 'drizzle-orm';
import { comments } from '@/core/db/schema';
import { env } from 'cloudflare:workers';

interface CommentSubmissionPayload {
  toolId: string;
  content: string;
  parentId?: string | null;
}

export const GET: APIRoute = async ({ url }) => {
  const requestedToolId = url.searchParams.get('toolId');
  
  if (!requestedToolId) {
    return new Response(JSON.stringify({ error: 'Missing toolId parameter' }), { status: 400 });
  }

  try {
    const databaseConnection = drizzle(env.DB);
    const toolComments = await databaseConnection
      .select()
      .from(comments)
      .where(eq(comments.toolId, requestedToolId))
      .orderBy(asc(comments.createdAt));

    return new Response(JSON.stringify(toolComments), { status: 200 });
  } catch (databaseError) {
    console.error('Failed to retrieve comments:', databaseError);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const authenticatedUser = locals.user;
  
  if (!authenticatedUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized request' }), { status: 401 });
  }

  try {
    const databaseConnection = drizzle(env.DB);
    
    const commentPayload = (await request.json()) as CommentSubmissionPayload;
    const { toolId, content, parentId } = commentPayload;

    if (!toolId || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    if (!parentId) {
      const rootComments = await databaseConnection
        .select({ id: comments.id })
        .from(comments)
        .where(and(eq(comments.toolId, toolId), isNull(comments.parentId)))
        .orderBy(asc(comments.createdAt));

      const MAXIMUM_ROOT_COMMENTS = 20;
      
      if (rootComments.length >= MAXIMUM_ROOT_COMMENTS) {
        const excessCommentsCount = rootComments.length - MAXIMUM_ROOT_COMMENTS + 1;
        const commentsToDelete = rootComments.slice(0, excessCommentsCount);
        const idsToDelete = commentsToDelete.map(c => c.id);

        if (idsToDelete.length > 0) {
          await databaseConnection.delete(comments).where(inArray(comments.parentId, idsToDelete));
          await databaseConnection.delete(comments).where(inArray(comments.id, idsToDelete));
        }
      }
    }

    const newCommentRecord = {
      id: crypto.randomUUID(),
      toolId,
      parentId: parentId || null,
      authorName: authenticatedUser.name,
      authorAvatar: authenticatedUser.image || authenticatedUser.name.charAt(0).toUpperCase(),
      content,
      createdAt: Date.now(),
    };

    await databaseConnection.insert(comments).values(newCommentRecord);
    return new Response(JSON.stringify(newCommentRecord), { status: 201 });
  } catch (databaseError) {
    console.error('Failed to insert comment:', databaseError);
    return new Response(JSON.stringify({ error: 'Failed to post comment' }), { status: 500 });
  }
};