// src/app/api/admin/ballots/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, description, options } = await request.json();

    const ballot = await prisma.ballot.create({
      data: {
        title,
        description,
        createdBy: user.id,
        options: {
          create: options.map((option: string) => ({ value: option }))
        }
      },
      include: {
        options: true
      }
    });

    return NextResponse.json(ballot);
  } catch (error) {
    console.error('Ballot creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ballot' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const ballots = await prisma.ballot.findMany({
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