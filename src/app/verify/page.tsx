// filepath: c:\Users\DMountou\Documents\Projects\cryptographie\src\app\verify\page.tsx
"use client"
import React, { useState } from 'react';

const VerifyVote = () => {
  const [voteId, setVoteId] = useState('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerify = async () => {
    // Call the backend API to verify the vote
    const response = await fetch(`/api/verify/${voteId}`);
    const data = await response.json();
    setVerificationResult(data.isValid ? 'Vote is valid!' : 'Vote is invalid.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Verify Your Vote</h1>
      <input
        type="text"
        value={voteId}
        onChange={(e) => setVoteId(e.target.value)}
        placeholder="Enter your vote ID"
        className="border p-2 mb-4"
      />
      <button onClick={handleVerify} className="bg-blue-500 text-white p-2 rounded">
        Verify Vote
      </button>
      {verificationResult && <p className="mt-4">{verificationResult}</p>}
    </div>
  );
};

export default VerifyVote;