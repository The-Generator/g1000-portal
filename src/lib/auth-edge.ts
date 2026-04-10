// Edge-compatible auth functions (no bcryptjs)
import { NextRequest } from 'next/server';
import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose';
import { supabaseAdmin } from './supabase';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-for-development-only'
);

interface JWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
}


export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'student' | 'owner' | 'admin',
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

export async function getUserFromRequest(request: NextRequest) {
  // Normal authentication flow
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  // Get full user data from database
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', payload.userId)
    .single();

  if (error || !user) {
    console.error('Middleware auth check failed: User not found in DB', error);
    return null;
  }

  return user;
}