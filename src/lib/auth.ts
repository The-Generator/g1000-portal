import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase';
import bcrypt from 'bcryptjs';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-for-development-only');

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  iat: number;
  exp: number;
}


export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
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

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function generateVerificationCode(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeVerificationCode(email: string, code: string) {
  const hashedCode = await hashPassword(code);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
  // Store in a temporary table or cache
  const { error } = await supabaseAdmin
    .from('verification_codes')
    .upsert({
      email,
      code: hashedCode,
      expires_at: expiresAt.toISOString(),
    });
  
  if (error) throw error;
}

export async function verifyVerificationCode(email: string, code: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('verification_codes')
    .select('code, expires_at')
    .eq('email', email)
    .single();

  if (error || !data) return false;
  
  // Check if code has expired
  if (new Date() > new Date(data.expires_at)) {
    // Clean up expired code
    await supabaseAdmin.from('verification_codes').delete().eq('email', email);
    return false;
  }

  const isValid = await verifyPassword(code, data.code);
  
  if (isValid) {
    // Clean up used code
    await supabaseAdmin.from('verification_codes').delete().eq('email', email);
  }
  
  return isValid;
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
    
  if (error || !user) return null;
  
  return user;
}

export function createAuthResponse(token: string, user: unknown) {
  const response = NextResponse.json({
    data: user,
    message: 'Authentication successful'
  });
  
  // Set HTTP-only cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  });
  
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('auth-token');
  return response;
}

// Middleware helper to protect routes
export async function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  return user;
} 