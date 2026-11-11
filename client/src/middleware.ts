import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'synthetica_session';

/** Protege el dashboard antes de renderizar: sin cookie de sesión → login. */
export function middleware(req: NextRequest) {
  if (req.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/dashboard/:path*'] };
