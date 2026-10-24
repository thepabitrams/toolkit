import { defineMiddleware } from 'astro:middleware';
import { createAuth } from '@/core/lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const auth = createAuth(context.locals.runtime.env);
  const sessionData = await auth.api.getSession({
    headers: context.request.headers,
  });

  context.locals.user = sessionData?.user ?? null;
  context.locals.session = sessionData?.session ?? null;

  return next();
});