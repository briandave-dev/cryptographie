import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // Encrypt private key with user's password as key derivation
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encryptedKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedKey += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Combine salt, IV, and auth tag with encrypted key for storage
    const finalEncryptedKey = `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedKey}`;

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        password: await bcrypt.hash(password, 10),
        publicKey,
        encryptedKey: finalEncryptedKey,
      },
    });

    return NextResponse.json({
      message: 'Registration successful',
      userId: newUser.id,
      publicKey,
      privateKey, // Send to client but never store in plain text
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}