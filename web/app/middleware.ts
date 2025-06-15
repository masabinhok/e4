// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/auth/login', '/auth/signup', '/'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let public routes pass
  if (PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Try reading access token from cookie
  const accessToken = req.cookies.get('access_token')?.value;

  // No token? Redirect to login
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
  
  return NextResponse.next();
}


// middleware.ts (continued)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/your-private-pages/:path*',
  ],
};
