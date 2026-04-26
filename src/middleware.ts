import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { supabaseAdmin } from '@/lib/supabase';

const PUBLIC_PATHS = new Set(['/', '/login', '/auth/callback', '/onboarding']);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // Allow OAuth callback subpaths (e.g. /auth/callback?code=...) and /auth/* helpers
  if (pathname.startsWith('/auth/')) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/student') ||
    pathname.startsWith('/business') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/student') ||
    pathname.startsWith('/api/students') ||
    pathname.startsWith('/api/business') ||
    pathname.startsWith('/api/admin')
  );
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function unauthorizedResponse(pathname: string, request: NextRequest): NextResponse {
  if (isApiPath(pathname)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh the Supabase session for every request. This MUST run first so
  // cookies are kept in sync regardless of which branch we take below.
  const { supabaseResponse, user } = await updateSession(request);

  // Public paths: allow through without any auth checks.
  if (isPublicPath(pathname)) {
    return supabaseResponse;
  }

  // Routes outside the protected prefixes (e.g. unknown paths) fall through
  // so Next.js can return a proper 404 instead of forcing a redirect.
  if (!isProtectedPath(pathname)) {
    return supabaseResponse;
  }

  // No session → unauthorized.
  if (!user) {
    return unauthorizedResponse(pathname, request);
  }

  // Look up the user's role from the `users` table. A missing row means the
  // user has authenticated with Supabase but has not completed onboarding.
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role as 'student' | 'owner' | 'admin' | undefined;

  if (!role) {
    // No role yet → send them to onboarding (API requests get 401).
    if (isApiPath(pathname)) {
      return NextResponse.json({ error: 'Onboarding required' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Role-based route enforcement.
  if (pathname.startsWith('/student')) {
    if (role !== 'student') return unauthorizedResponse(pathname, request);
  } else if (pathname.startsWith('/business')) {
    if (role !== 'owner') return unauthorizedResponse(pathname, request);
  } else if (pathname.startsWith('/admin')) {
    if (role !== 'admin') return unauthorizedResponse(pathname, request);
  } else if (pathname.startsWith('/api/students')) {
    // Business owners can view applicant profiles; students can read their own.
    if (role !== 'owner' && role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (pathname.startsWith('/api/student')) {
    if (role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (pathname.startsWith('/api/business')) {
    if (role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (pathname.startsWith('/api/admin')) {
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - common static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
