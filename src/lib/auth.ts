// Node-only auth utilities (bcrypt + JWT signing + response helpers).
// JWT verification and request-based auth helpers are re-exported from
// the edge-compatible module so there is a single source of truth.
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export {
  verifyToken,
  getTokenFromRequest,
  getUserFromRequest,
} from './auth-edge';
export type { JWTPayload } from './auth-edge';

if (!process.env.JWT_SECRET) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: {
  userId: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function createAuthResponse(token: string, user: unknown) {
  const response = NextResponse.json({
    data: user,
    message: 'Authentication successful',
  });

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });

  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('auth-token');
  return response;
}

// Middleware helper to protect routes
export async function requireAuth(
  request: import('next/server').NextRequest,
  allowedRoles?: string[],
) {
  const { getUserFromRequest } = await import('./auth-edge');
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return user;
}
