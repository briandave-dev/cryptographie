import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/'];
  const adminRoutes = ['/admin'];
  const userRoutes = ['/vote', '/dashboard'];

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/vote', request.url));
      }
    }

    // Check user routes
    if (userRoutes.some(route => pathname.startsWith(route))) {
      if (decoded.role !== 'USER' && decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};