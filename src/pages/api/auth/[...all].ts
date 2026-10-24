import type { APIRoute } from 'astro';
import { createAuth } from '@/core/lib/auth';

export const ALL: APIRoute = async (context) => {
  const authInstance = createAuth();
  return authInstance.handler(context.request);
};