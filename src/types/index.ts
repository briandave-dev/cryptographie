export interface User {
    id: string;
    username: string;
    passwordHash: string;
    publicKey: string;
    encryptedKey: string; // Encrypted private key
}

export interface Vote {
    id: string;
    userId: string;
    ballotId: string;
    encryptedVote: string;
    signature: string;
}

export interface Ballot {
    id: string;
    title: string;
    options: string[];
    createdAt: Date;
    updatedAt: Date;
}