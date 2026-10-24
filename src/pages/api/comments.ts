import type { APIRoute } from 'astro';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc, inArray, isNull } from 'drizzle-orm';
import { comments } from '@/core/db/schema';

export const GET: APIRoute = async ({ url, locals }) => {
  const toolId = url.searchParams.get('toolId');
  if (!toolId) {
    return new Response(JSON.stringify({ error: 'Missing toolId' }), { status: 400 });
  }

  try {
    const database = drizzle(locals.runtime.env.DB);
    const toolComments = await database
      .select()
      .from(comments)
      .where(eq(comments.toolId, toolId))
      .orderBy(asc(comments.createdAt));

    return new Response(JSON.stringify(toolComments), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to fetch comments' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const database = drizzle(locals.runtime.env.DB);
    const requestBody = await request.json();
    const { toolId, content, parentId } = requestBody;

    if (!toolId || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    if (!parentId) {
      const rootComments = await database
        .select({ id: comments.id })
        .from(comments)
        .where(and(eq(comments.toolId, toolId), isNull(comments.parentId)))
        .orderBy(asc(comments.createdAt));

      if (rootComments.length >= 20) {
        const excessCount = rootComments.length - 19;
        const commentsToDelete = rootComments.slice(0, excessCount);
        const idsToDelete = commentsToDelete.map(c => c.id);

        await database.delete(comments).where(inArray(comments.parentId, idsToDelete));
        await database.delete(comments).where(inArray(comments.id, idsToDelete));
      }
    }

    const newComment = {
      id: crypto.randomUUID(),
      toolId,
      parentId: parentId || null,
      authorName: user.name,
      authorAvatar: user.image || user.name.charAt(0).toUpperCase(),
      content,
      createdAt: Date.now(),
    };

    await database.insert(comments).values(newComment);
    return new Response(JSON.stringify(newComment), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to post comment' }), { status: 500 });
  }
};