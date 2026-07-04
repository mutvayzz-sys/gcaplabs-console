import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // API routes enforce their own auth via requireUser()/getSession() (bearer or cookie) and
  // return a proper 401 JSON error — they must never go through the page-redirect-to-/login
  // logic in updateSession(), which replays the original method against a page route and
  // breaks unauthenticated JSON callers (e.g. POST /api/auth/login itself, which by definition
  // has no session yet, was getting redirected to GET-only /login and 405ing).
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
