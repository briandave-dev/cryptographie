import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all ballots with their options and votes
    const ballots = await prisma.ballot.findMany({
      include: {
        options: true,
        votes: true,
      },
    });

    // Transform the data for the chart
    const results = ballots.map(ballot => ({
      id: ballot.id,
      title: ballot.title,
      options: ballot.options.map(option => ({
        label: option.value,
        votes: ballot.votes.filter(vote => {
          // In a real app, you'd decrypt the vote here
          return vote.encryptedVote === option.id;
        }).length
      }))
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}