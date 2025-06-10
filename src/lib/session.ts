import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const secretKey = process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long!!';
const key = new TextEncoder().encode(secretKey);

export interface SessionData {
  id: string;
  username: string;
  publicKey: string;
}

export async function encryptSession(data: SessionData) {
  return await new SignJWT({ ...data })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Session expires in 1 hour
    .sign(key);
}

export async function decryptSession(request: NextRequest) {
  const session = request.cookies.get('cryptoSession')?.value;
  if (!session) return null;
  
  try {
    const { payload } = await jwtVerify(session, key);
    const { id, username, publicKey } = payload as Record<string, unknown>;
    if (typeof id === 'string' && typeof username === 'string' && typeof publicKey === 'string') {
      return { id, username, publicKey } as SessionData;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function createSession(data: SessionData) {
  const encryptedSession = await encryptSession(data);
  const cookieStore = await cookies();
  cookieStore.set('cryptoSession', encryptedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 // 1 hour
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('cryptoSession');
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get('cryptoSession')?.value;
  
  if (!session) return null;
  
  try {
    const { payload } = await jwtVerify(session, key);
    const { id, username, publicKey } = payload as Record<string, unknown>;
    
    if (typeof id === 'string' && typeof username === 'string' && typeof publicKey === 'string') {
      return { id, username, publicKey };
    }
    
    return null;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
}

// Usage example in a Server Component:
// const session = await getSession();
// if (session) {
//   // User is authenticated
//   console.log(session.username);
// }