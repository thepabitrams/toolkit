export function redirectWithAuthResponse(response: Response, location: string) {
  const headers = new Headers({ Location: location });
  for (const cookie of response.headers.getSetCookie()) {
    headers.append('Set-Cookie', cookie);
  }
  return new Response(null, { status: 302, headers });
}