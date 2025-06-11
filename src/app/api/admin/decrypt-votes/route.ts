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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { ballotId, adminPassword } = await request.json();

    // Validation des entrées
    if (!ballotId || !adminPassword) {
      return NextResponse.json(
        { error: 'Ballot ID and admin password are required' },
        { status: 400 }
      );
    }

    // Récupérer les clés admin
    const adminKeys = await prisma.adminKeys.findFirst();
    if (!adminKeys) {
      return NextResponse.json(
        { error: 'Admin keys not found. Please generate admin keys first.' },
        { status: 500 }
      );
    }

    // Déchiffrer la clé privée admin avec la méthode corrigée
    let privateKey;
    try {
      console.log('🔓 Attempting to decrypt admin private key...');
      
      // Parser le format: salt:iv:authTag:encryptedData
      const parts = adminKeys.privateKey.split(':');
      if (parts.length !== 4) {
        throw new Error('Invalid encrypted private key format');
      }
      
      const [saltHex, ivHex, authTagHex, encryptedData] = parts;
      const salt = Buffer.from(saltHex, 'hex');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      // Dériver la clé de chiffrement à partir du mot de passe
      const key = crypto.pbkdf2Sync(adminPassword, salt, 100000, 32, 'sha256');
      
      // ✅ CORRECTION : Utiliser createDecipheriv pour AES-256-GCM
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);
      
      // Déchiffrer
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      privateKey = decrypted;
      console.log('✅ Admin private key decrypted successfully');
      
    } catch (error: any) {
      console.error('❌ Failed to decrypt admin private key:', error.message);
      return NextResponse.json(
        { error: 'Invalid admin password or corrupted private key' },
        { status: 401 }
      );
    }

    // Récupérer tous les votes pour ce ballot
    console.log(`📊 Fetching votes for ballot: ${ballotId}`);
    const votes = await prisma.vote.findMany({
      where: { ballotId },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    console.log(`📈 Found ${votes.length} votes to decrypt`);

    // Récupérer les options du ballot
    const ballot = await prisma.ballot.findUnique({
      where: { id: ballotId },
      include: {
        options: true
      }
    });

    if (!ballot) {
      return NextResponse.json(
        { error: 'Ballot not found' },
        { status: 404 }
      );
    }

    // Déchiffrer et compter les votes
    const results = new Map();
    const decryptedVotes = [];
    let invalidVotes = 0;

    // Initialiser le compteur pour chaque option
    ballot.options.forEach(option => {
      results.set(option.id, {
        optionId: option.id,
        optionText: option.value,
        votes: 0,
        voters: []
      });
    });

    console.log('🔓 Starting vote decryption...');

    for (const vote of votes) {
      try {
        // Déchiffrer l'ID d'option avec la clé privée admin
        const decryptedBuffer = crypto.privateDecrypt({
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        }, Buffer.from(vote.encryptedVote, 'base64'));

        const decryptedOptionId = decryptedBuffer.toString('utf8');

        // Vérifier que l'option existe
        if (results.has(decryptedOptionId)) {
          const current = results.get(decryptedOptionId);
          current.votes += 1;
          current.voters.push({
            username: vote.user.username,
            voteTime: vote.createdAt
          });
          results.set(decryptedOptionId, current);

          console.log(`✅ Vote ${vote.id} decrypted: ${decryptedOptionId}`);
        } else {
          console.warn(`⚠️ Vote ${vote.id} has invalid option ID: ${decryptedOptionId}`);
          invalidVotes++;
        }

        decryptedVotes.push({
          voteId: vote.id,
          voter: vote.user.username,
          optionId: decryptedOptionId,
          optionText: ballot.options.find(opt => opt.id === decryptedOptionId)?.value || 'UNKNOWN',
          voteTime: vote.createdAt
        });

      } catch (error: any) {
        console.error(`❌ Error decrypting vote ${vote.id}:`, error.message);
        invalidVotes++;
      }
    }

    // Convertir en format pour le frontend
    const formattedResults = Array.from(results.values()).map(result => ({
      optionId: result.optionId,
      optionText: result.optionText,
      votes: result.votes,
      percentage: votes.length > 0 ? ((result.votes / (votes.length - invalidVotes)) * 100).toFixed(1) : '0.0',
      voters: result.voters
    }));

    // Trier par nombre de votes (décroissant)
    formattedResults.sort((a, b) => b.votes - a.votes);

    console.log(`🎉 Decryption complete! ${votes.length - invalidVotes}/${votes.length} votes valid`);

    return NextResponse.json({
      ballotId,
      ballotTitle: ballot.title,
      ballotDescription: ballot.description,
      totalVotes: votes.length,
      validVotes: votes.length - invalidVotes,
      invalidVotes,
      results: formattedResults,
      decryptedVotes: decryptedVotes.sort((a, b) => new Date(b.voteTime).getTime() - new Date(a.voteTime).getTime()),
      decryptedAt: new Date().toISOString(),
      summary: {
        winner: formattedResults[0]?.optionText || 'No votes',
        winnerVotes: formattedResults[0]?.votes || 0,
        winnerPercentage: formattedResults[0]?.percentage || '0.0'
      }
    });

  } catch (error: any) {
    console.error('💥 Decryption error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to decrypt votes',
        details: error.message 
      },
      { status: 500 }
    );
  }
}