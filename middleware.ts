import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PREFIX = '/admin';
const LOGIN_PATH = '/admin/login';

async function computeToken(password: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(password);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  // Allow login page through without auth check
  if (pathname === LOGIN_PATH || pathname === `${LOGIN_PATH}/`) {
    return NextResponse.next();
  }

  const adminAuth = request.cookies.get('admin_auth')?.value;
  if (!adminAuth) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const password = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.ADMIN_SECRET || 'default-secret';
  const expectedToken = await computeToken(password, secret);

  if (adminAuth !== expectedToken) {
    const url = new URL(LOGIN_PATH, request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
