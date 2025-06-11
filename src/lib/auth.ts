import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export async function getCurrentUser() {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

export function requireAuth() {
  return async function(request: Request) {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  };
}

export function requireAdmin() {
  return async function(request: Request) {
    const auth = await requireAuth()(request);
    
    if (auth.role !== 'ADMIN') {
      throw new Error('Admin access required');
    }

    return auth;
  };
}