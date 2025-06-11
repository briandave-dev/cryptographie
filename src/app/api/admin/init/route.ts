// src/app/api/admin/init/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';

export async function POST() {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin already exists' },
        { status: 400 }
      );
    }

    // Générer les clés RSA pour l'admin
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

    const adminPassword = 'Azertyuiop@1';
    
    // Chiffrer la clé privée de l'admin
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(adminPassword, salt, 100000, 32, 'sha256');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encryptedKey = cipher.update(privateKey, 'utf8', 'hex');
    encryptedKey += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const finalEncryptedKey = `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedKey}`;

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash(adminPassword, 10),
        role: 'ADMIN',
        publicKey,
        encryptedKey: finalEncryptedKey,
      },
    });

    // Stocker les clés admin pour le système
    await prisma.adminKeys.create({
      data: {
        publicKey,
        privateKey: finalEncryptedKey,
      },
    });

    return NextResponse.json({
      message: 'Admin created successfully',
      username: 'admin',
      password: adminPassword,
      adminId: admin.id,
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}