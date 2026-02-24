import { type NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/verify',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/api/auth/session',
  ];

  const protectedRoutes = ['/', '/admin'];

  const session = request.cookies.get('session');

  if (
    session &&
    (pathname === '/auth/login' || pathname === '/auth/register')
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
};
