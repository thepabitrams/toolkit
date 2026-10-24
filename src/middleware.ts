import { defineMiddleware } from 'astro:middleware';
import { createAuth } from '@/core/lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const authInstance = createAuth();
  const sessionContext = await authInstance.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = sessionContext?.user ?? null;
  context.locals.session = sessionContext?.session ?? null;

  return next();
});