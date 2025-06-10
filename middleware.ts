import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decryptSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/', '/api/auth/signin', '/api/auth/register', '/api/auth/signout'];
  
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for session cookie
  const session = request.cookies.get('session');
  
  if (!session) {
    console.log('No session found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const sessionData = await decryptSession(request);
    
    if (!sessionData) {
      console.log('Invalid session, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}