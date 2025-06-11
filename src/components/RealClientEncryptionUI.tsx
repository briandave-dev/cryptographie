import React, { useState, useEffect } from 'react';
import { Lock, Shield, CheckCircle, AlertCircle, Key, X } from 'lucide-react';

// Classe pour le chiffrement RSA côté client
class ClientCrypto {
  // Convertir clé PEM en format utilisable par WebCrypto
  static async importPublicKey(pemKey: any) {
    const binaryDer = this.pemToBinary(pemKey);
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );
  }

  // Convertir PEM en binaire
  static pemToBinary(pem: any) {
    const base64 = pem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');
    
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Chiffrer l'ID d'option avec la clé publique admin
  static async encryptOptionId(optionId: any, publicKey: any) {
    const encoder = new TextEncoder();
    const data = encoder.encode(optionId);
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      data
    );
    
    // Convertir en base64 pour l'envoi
    const encryptedArray = new Uint8Array(encryptedBuffer);
    return btoa(String.fromCharCode(...encryptedArray));
  }
}

const SimpleVotingUI = () => {
  type BallotOption = {
    id: string;
    value: string;
  };
  
  type Ballot = {
    id: string;
    title: string;
    description: string;
    options: BallotOption[];
  };
  
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set()); // Ballots déjà votés
  const [selectedBallot, setSelectedBallot] = useState<Ballot | null>(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [adminPublicKeyCrypto, setAdminPublicKeyCrypto] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(false);
  type VoteResult = {
    success: boolean;
    message: string;
    hash?: string;
  } | null;
  
  const [voteResult, setVoteResult] = useState<VoteResult>(null);

  useEffect(() => {
    fetchBallots();
    fetchAdminPublicKey();
    fetchUserVotes(); // Récupérer les votes existants
  }, []);

  const fetchBallots = async () => {
    try {
      const response = await fetch('/api/ballots');
      const data = await response.json();
      setBallots(data);
    } catch (error) {
      console.error('Error fetching ballots:', error);
    }
  };

  // Récupérer les votes de l'utilisateur connecté
  const fetchUserVotes = async () => {
    try {
      const response = await fetch('/api/user/votes');
      const data = await response.json();
      
      // Créer un Set des ballotIds pour lesquels l'utilisateur a voté
      const votedBallotIds = new Set<string>(data.map((vote: { ballotId: any; }) => vote.ballotId));
      setUserVotes(votedBallotIds);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const fetchAdminPublicKey = async () => {
    try {
      const response = await fetch('/api/admin/public-key');
      const data = await response.json();
      
      // Importer la clé publique pour le chiffrement
      const cryptoKey = await ClientCrypto.importPublicKey(data.publicKey);
      setAdminPublicKeyCrypto(cryptoKey);
    } catch (error) {
      console.error('Error fetching admin public key:', error);
    }
  };

  // Vérifier si l'utilisateur peut ouvrir ce ballot
  const handleBallotClick = (ballot: any) => {
    if (userVotes.has(ballot.id)) {
      // Ballot déjà voté - empêcher l'ouverture
      setVoteResult({
        success: false,
        message: 'Vous avez déjà voté pour ce ballot !'
      });
      setTimeout(() => setVoteResult(null), 3000);
      return;
    }
    
    // Ballot pas encore voté - permettre l'ouverture
    setSelectedBallot(ballot);
    setSelectedOption('');
  };

  const handleVote = async () => {
    if (!selectedOption || !adminPublicKeyCrypto) {
      setVoteResult({
        success: false,
        message: 'Veuillez sélectionner une option et attendre le chargement de la clé publique'
      });
      setTimeout(() => setVoteResult(null), 3000);
      return;
    }

    setLoading(true);

    try {
      // Chiffrement côté client
      const encryptedOptionId = await ClientCrypto.encryptOptionId(selectedOption, adminPublicKeyCrypto);

      if (!selectedBallot) {
        setVoteResult({
          success: false,
          message: 'Aucun ballot sélectionné.'
        });
        setLoading(false);
        setTimeout(() => setVoteResult(null), 3000);
        return;
      }
      
      // Envoi au serveur
      const votePayload = {
        ballotId: selectedBallot.id,
        encryptedOptionId: encryptedOptionId
      };
      
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(votePayload)
      });

      const result = await response.json();
      
      if (response.ok) {
        // Ajouter ce ballot aux votes utilisateur
        setUserVotes(prev => new Set([...prev, selectedBallot.id]));
        
        setVoteResult({
          success: true,
          message: 'Vote enregistré avec succès !',
          hash: result.voteHash
        });
        
        // Reset après succès
        setTimeout(() => {
          setSelectedBallot(null);
          setSelectedOption('');
        }, 3000);
      } else {
        throw new Error(result.error || 'Erreur lors du vote');
      }

    } catch (error: any) {
      setVoteResult({
        success: false,
        message: 'Erreur lors du vote: ' + error.message
      });
    } finally {
      setLoading(false);
      setTimeout(() => setVoteResult(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 mb-8">
          <div className="text-center">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Vote Sécurisé
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Votre vote est chiffré pour garantir la confidentialité
            </p>
            
            {/* Status */}
            <div className="flex justify-center space-x-4">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${
                adminPublicKeyCrypto ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <Key className="h-4 w-4" />
                <span className="font-medium">
                  {adminPublicKeyCrypto ? '✅ Système prêt' : '⏳ Chargement...'}
                </span>
              </div>
              
              {userVotes.size > 0 && (
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">
                    {userVotes.size} vote(s) effectué(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vote Result Notification */}
        {voteResult && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border max-w-sm ${
            voteResult.success 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start space-x-3">
              {voteResult.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{voteResult.message}</p>
                {voteResult.hash && (
                  <p className="text-xs mt-1 font-mono text-emerald-600">
                    Hash: {voteResult.hash.substring(0, 16)}...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedBallot ? (
          /* Sélection du Ballot */
          <div>
            <div className='flex flex-row justify-between items-center'> 
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Votes Disponibles</h2>
            <button
                onClick={() =>  window.location.href = '/dashboard'}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                Mon Dahsboard
              </button>
              </div>
            {ballots.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                  <Shield className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun vote disponible</h3>
                <p className="text-gray-500">Revenez plus tard pour participer aux votes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ballots.map((ballot) => {
                  const hasVoted = userVotes.has(ballot.id);
                  
                  return (
                    <div
                      key={ballot.id}
                      onClick={() => handleBallotClick(ballot)}
                      className={`rounded-2xl p-6 border transition-all duration-200 ${
                        hasVoted
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-75'
                          : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{ballot.title}</h3>
                            {hasVoted && (
                              <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                <CheckCircle className="h-4 w-4" />
                                <span>Voté</span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">{ballot.description}</p>
                          
                          <div className="flex flex-wrap gap-2">
                            {ballot.options.map((option) => (
                              <span
                                key={option.id}
                                className={`px-3 py-1 rounded-full text-sm ${
                                  hasVoted 
                                    ? 'bg-gray-200 text-gray-600'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {option.value}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            hasVoted 
                              ? 'bg-gray-200'
                              : 'bg-blue-100'
                          }`}>
                            {hasVoted ? (
                              <CheckCircle className="h-6 w-6 text-emerald-600" />
                            ) : (
                              <Lock className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {hasVoted && (
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <p className="text-emerald-700 text-sm font-medium">
                            ✅ Vote enregistré. Un seul vote par personne est autorisé.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info si tous votés */}
            {ballots.filter(b => !userVotes.has(b.id)).length === 0 && ballots.length > 0 && (
              <div className="text-center py-12 mt-8">
                <div className="p-4 bg-emerald-100 rounded-full inline-block mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">Tous les votes terminés</h3>
                <p className="text-gray-500">Vous avez participé à tous les votes disponibles.</p>
              </div>
            )}
          </div>
        ) : (
          /* Interface de Vote */
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <div className="mb-6">
              <button
                onClick={() => setSelectedBallot(null)}
                className="text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors"
              >
                ← Retour aux votes
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBallot.title}</h2>
              <p className="text-gray-600">{selectedBallot.description}</p>
            </div>

            {/* Options */}
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-gray-800">Choisissez votre option :</h3>
              {selectedBallot.options.map((option) => (
                <label
                  key={option.id}
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="vote-option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="font-medium text-gray-800 text-lg">{option.value}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Info Sécurité */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">Vote sécurisé</p>
                  <p className="text-blue-700">
                    Votre choix sera chiffré avant l'envoi. Seul l'administrateur peut voir les résultats.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton Vote */}
            <button
              onClick={handleVote}
              disabled={!selectedOption || loading || !adminPublicKeyCrypto}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Confirmer mon Vote</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleVotingUI;