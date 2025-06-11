import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const adminKeys = await prisma.adminKeys.findFirst();
    
    if (!adminKeys) {
      return NextResponse.json(
        { error: 'Admin public key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      publicKey: adminKeys.publicKey
    });
  } catch (error) {
    console.error('Error fetching admin public key:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public key' },
      { status: 500 }
    );
  }
}