import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { ballotId, encryptedOptionId } = await request.json();

    // Vérifier si l'utilisateur a déjà voté
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_ballotId: {
          userId: user.id,
          ballotId
        }
      }
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted for this ballot' },
        { status: 400 }
      );
    }

    // Vérifier que le ballot existe et est actif
    const ballot = await prisma.ballot.findUnique({
      where: { id: ballotId }
    });

    if (!ballot || !ballot.isActive) {
      return NextResponse.json(
        { error: 'Ballot not available' },
        { status: 400 }
      );
    }

    // Créer le hash anti-double vote
    const voteHash = crypto.createHash('sha256')
      .update(`${user.id}:${ballotId}:${Date.now()}`)
      .digest('hex');

    // Enregistrer le vote avec l'ID d'option chiffré
    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        ballotId,
        encryptedVote: encryptedOptionId, // ID d'option chiffré côté client
        voteHash,
      }
    });

    return NextResponse.json({
      message: 'Vote submitted successfully',
      voteId: vote.id,
      voteHash
    });

  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}