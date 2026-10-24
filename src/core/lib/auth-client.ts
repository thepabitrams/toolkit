import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? "http://localhost:4321"
    : import.meta.env.PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signOut, useSession } = authClient;