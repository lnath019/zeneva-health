import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('zeneva_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard and nested routes, and the post-signup password step
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/set-password')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users trying to access login page
  if (pathname.startsWith('/login')) {
    if (token) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/set-password'],
};
