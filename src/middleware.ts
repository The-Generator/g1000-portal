import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-edge';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes that don't need auth, static files, and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/seed') ||
    pathname.startsWith('/api/test-email') ||
    pathname === '/test-email' ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/student-coming-soon' ||
    pathname === '/business/register' ||
    pathname === '/business/login' ||
    pathname === '/admin/login'
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const user = await getUserFromRequest(request);

  // Redirect unauthenticated users to appropriate login page
  if (!user) {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/business')) {
      return NextResponse.redirect(new URL('/business/login', request.url));
    }
    // Default to student login for other routes
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based route protection
  if (pathname.startsWith('/student')) {
    if (user.role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } else if (pathname.startsWith('/business')) {
    if (user.role !== 'owner') {
      return NextResponse.redirect(new URL('/business/login', request.url));
    }
  } else if (pathname.startsWith('/admin')) {
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // API route protection
  // Note: /api/students routes can be accessed by business owners viewing student profiles
  if (pathname.startsWith('/api/students')) {
    // Allow business owners to access student profiles for applicants
    if (user.role !== 'owner' && user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (pathname.startsWith('/api/student') && user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (pathname.startsWith('/api/business') && user.role !== 'owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (pathname.startsWith('/api/admin') && user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 