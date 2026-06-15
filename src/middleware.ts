import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const sessionToken = request.cookies.get('gisec_session_token')?.value;

    // In a real-world scenario, we verify the JWT token via Supabase or jose library.
    // For local development or mock, we check if the cookie exists.
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      // Pass the original URL to redirect back after login
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Match only the routes we want to guard
export const config = {
  matcher: ['/dashboard/:path*'],
};
