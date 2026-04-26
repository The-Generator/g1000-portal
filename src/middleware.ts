import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { supabaseAdmin } from '@/lib/supabase';

const PUBLIC_PATHS = new Set(['/', '/login', '/auth/callback', '/onboarding']);

function isPublicPath(pathname: string): boolean {
  // Only the exact paths in PUBLIC_PATHS are public.
  // /auth/callback is handled here explicitly — broad /auth/* is NOT public,
  // so other /auth/* helpers (if any) still go through normal auth checks.
  return PUBLIC_PATHS.has(pathname);
}

function dashboardForRole(role: 'student' | 'owner' | 'admin'): string {
  switch (role) {
    case 'student':
      return '/student/dashboard';
    case 'owner':
      return '/business/dashboard';
    case 'admin':
      return '/admin';
  }
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

/**
 * Copy every cookie from `source` (the upstream Supabase SSR response) onto
 * `target`. Required because `NextResponse.redirect()` and
 * `NextResponse.json()` produce fresh responses with no cookies, and the
 * Supabase auth tokens would otherwise be dropped.
 */
function copySupabaseCookies(target: NextResponse, source: NextResponse): void {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

/**
 * Build an unauthorized response that PROPAGATES Supabase SSR cookies from the
 * upstream `supabaseResponse`. This is required so refreshed auth cookies are
 * not dropped on auth failures (otherwise the browser keeps stale tokens).
 */
function unauthorizedResponse(
  pathname: string,
  request: NextRequest,
  supabaseResponse: NextResponse
): NextResponse {
  let response: NextResponse;
  if (isApiPath(pathname)) {
    response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } else {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    response = NextResponse.redirect(url);
  }
  copySupabaseCookies(response, supabaseResponse);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresh the Supabase session for every request. This MUST run first so
  // cookies are kept in sync regardless of which branch we take below.
  const { supabaseResponse, user } = await updateSession(request);

  // Public paths: allow through without any auth checks, EXCEPT for the
  // landing page `/`. When an authenticated user lands on `/` (e.g. after
  // login completes via `window.location.href = '/'`), redirect them to
  // their role-specific dashboard or to /onboarding if they have no role
  // yet. Unauthenticated visitors continue to see the landing page.
  if (isPublicPath(pathname)) {
    if (pathname === '/' && user) {
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role as 'student' | 'owner' | 'admin' | undefined;

      const url = request.nextUrl.clone();
      url.pathname = role ? dashboardForRole(role) : '/onboarding';
      url.search = '';
      const redirectResponse = NextResponse.redirect(url);
      copySupabaseCookies(redirectResponse, supabaseResponse);
      return redirectResponse;
    }
    return supabaseResponse;
  }

  // Routes outside the protected prefixes (e.g. unknown paths) fall through
  // so Next.js can return a proper 404 instead of forcing a redirect.
  if (!isProtectedPath(pathname)) {
    return supabaseResponse;
  }

  // No session → unauthorized.
  if (!user) {
    return unauthorizedResponse(pathname, request, supabaseResponse);
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
      const apiResponse = NextResponse.json(
        { error: 'Onboarding required' },
        { status: 401 }
      );
      copySupabaseCookies(apiResponse, supabaseResponse);
      return apiResponse;
    }
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    url.search = '';
    const redirectResponse = NextResponse.redirect(url);
    copySupabaseCookies(redirectResponse, supabaseResponse);
    return redirectResponse;
  }

  // Helper for cross-role API 401s that must also propagate cookies.
  const apiUnauthorized = () => {
    const r = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    copySupabaseCookies(r, supabaseResponse);
    return r;
  };

  // Role-based route enforcement.
  if (pathname.startsWith('/student')) {
    if (role !== 'student') return unauthorizedResponse(pathname, request, supabaseResponse);
  } else if (pathname.startsWith('/business')) {
    if (role !== 'owner') return unauthorizedResponse(pathname, request, supabaseResponse);
  } else if (pathname.startsWith('/admin')) {
    if (role !== 'admin') return unauthorizedResponse(pathname, request, supabaseResponse);
  } else if (pathname.startsWith('/api/students')) {
    // Business owners can view applicant profiles; students can read their own.
    if (role !== 'owner' && role !== 'student') {
      return apiUnauthorized();
    }
  } else if (pathname.startsWith('/api/student')) {
    if (role !== 'student') {
      return apiUnauthorized();
    }
  } else if (pathname.startsWith('/api/business')) {
    if (role !== 'owner') {
      return apiUnauthorized();
    }
  } else if (pathname.startsWith('/api/admin')) {
    if (role !== 'admin') {
      return apiUnauthorized();
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
