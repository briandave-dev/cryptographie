import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ballots = await prisma.ballot.findMany({
      where: { isActive: true },
      include: {
        options: true,
        _count: {
          select: { votes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(ballots);
  } catch (error) {
    console.error('Error fetching ballots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ballots' },
      { status: 500 }
    );
  }
}