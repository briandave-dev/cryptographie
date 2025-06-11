// 'use client'

// import React, { useState, useEffect } from 'react';
// import { Vote, Lock, Shield, CheckCircle, AlertCircle, Zap, Clock, Users } from 'lucide-react';

// const VotingPage = () => {
//   const [ballots, setBallots] = useState([]);
//   const [selectedBallot, setSelectedBallot] = useState(null);
//   const [selectedOption, setSelectedOption] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [voted, setVoted] = useState(new Set());
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [voteResult, setVoteResult] = useState(null);

//   useEffect(() => {
//     fetchBallots();
//     fetchUserVotes();
//   }, []);

//   const fetchBallots = async () => {
//     try {
//       const response = await fetch('/api/admin/ballots');
//       const data = await response.json();
//       setBallots(data.filter(ballot => ballot.isActive));
//     } catch (error) {
//       console.error('Error fetching ballots:', error);
//     }
//   };

//   const fetchUserVotes = async () => {
//     try {
//       const response = await fetch('/api/user/votes');
//       const data = await response.json();
//       setVoted(new Set(data.map(vote => vote.ballotId)));
//     } catch (error) {
//       console.error('Error fetching user votes:', error);
//     }
//   };

//   const handleVote = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/vote', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ballotId: selectedBallot.id,
//           optionId: selectedOption
//         })
//       });

//       const data = await response.json();
      
//       if (response.ok) {
//         setVoteResult({
//           success: true,
//           message: 'Vote enregistré avec succès!',
//           voteHash: data.voteHash
//         });
//         setVoted(prev => new Set([...prev, selectedBallot.id]));
//         setSelectedBallot(null);
//         setSelectedOption('');
//       } else {
//         setVoteResult({
//           success: false,
//           message: data.error || 'Erreur lors du vote'
//         });
//       }
//       setShowConfirmModal(false);
//     } catch (error) {
//       console.error('Vote error:', error);
//       setVoteResult({
//         success: false,
//         message: 'Erreur de connexion'
//       });
//     } finally {
//       setLoading(false);
//       setTimeout(() => setVoteResult(null), 5000);
//     }
//   };

//   const openBallot = (ballot) => {
//     setSelectedBallot(ballot);
//     setSelectedOption('');
//   };

//   const confirmVote = () => {
//     if (!selectedOption) return;
//     setShowConfirmModal(true);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
//       {/* Header */}
//       <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
//         <div className="max-w-6xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
//                 <Vote className="h-6 w-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                   Système de Vote Cryptographique
//                 </h1>
//                 <p className="text-gray-600">Vote anonyme et sécurisé avec chiffrement RSA</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
//                 <Shield className="h-4 w-4 text-emerald-600" />
//                 <span className="text-sm font-medium text-emerald-700">Sécurisé</span>
//               </div>
//               <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
//                 <Lock className="h-4 w-4 text-blue-600" />
//                 <span className="text-sm font-medium text-blue-700">Anonyme</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Vote Result Notification */}
//       {voteResult && (
//         <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl shadow-lg border max-w-sm ${
//           voteResult.success 
//             ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
//             : 'bg-red-50 border-red-200 text-red-800'
//         }`}>
//           <div className="flex items-start space-x-3">
//             {voteResult.success ? (
//               <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
//             ) : (
//               <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
//             )}
//             <div>
//               <p className="font-medium">{voteResult.message}</p>
//               {voteResult.voteHash && (
//                 <p className="text-xs mt-1 font-mono">Hash: {voteResult.voteHash.substring(0, 16)}...</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-6xl mx-auto p-6">
//         {!selectedBallot ? (
//           <div className="space-y-8">
//             {/* Info Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 bg-blue-100 rounded-xl">
//                     <Shield className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">Chiffrement RSA</h3>
//                     <p className="text-sm text-gray-600">Votes chiffrés avec clé publique 2048 bits</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 bg-purple-100 rounded-xl">
//                     <Lock className="h-6 w-6 text-purple-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">Anonymat Total</h3>
//                     <p className="text-sm text-gray-600">Impossible de relier un vote à un utilisateur</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300">
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 bg-emerald-100 rounded-xl">
//                     <Zap className="h-6 w-6 text-emerald-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-gray-800">Anti-Double Vote</h3>
//                     <p className="text-sm text-gray-600">Hash unique empêche les votes multiples</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Available Ballots */}
//             <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 shadow-lg">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//                 <Vote className="h-6 w-6 mr-3 text-blue-600" />
//                 Votes Disponibles
//               </h2>

//               {ballots.length === 0 ? (
//                 <div className="text-center py-12">
//                   <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
//                     <Vote className="h-8 w-8 text-gray-400" />
//                   </div>
//                   <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun vote disponible</h3>
//                   <p className="text-gray-500">Revenez plus tard pour participer aux votes.</p>
//                 </div>
//               ) : (
//                 <div className="grid gap-6">
//                   {ballots.map((ballot) => {
//                     const hasVoted = voted.has(ballot.id);
//                     return (
//                       <div
//                         key={ballot.id}
//                         className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
//                           hasVoted
//                             ? 'bg-gray-50 border-gray-200 opacity-75'
//                             : 'bg-white border-blue-200 hover:shadow-xl hover:border-blue-300 cursor-pointer'
//                         }`}
//                         onClick={() => !hasVoted && openBallot(ballot)}
//                       >
//                         <div className="p-6">
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1">
//                               <div className="flex items-center space-x-3 mb-3">
//                                 <h3 className="text-xl font-bold text-gray-800">{ballot.title}</h3>
//                                 {hasVoted && (
//                                   <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm">
//                                     <CheckCircle className="h-4 w-4" />
//                                     <span>Voté</span>
//                                   </div>
//                                 )}
//                               </div>
                              
//                               {ballot.description && (
//                                 <p className="text-gray-600 mb-4">{ballot.description}</p>
//                               )}

//                               <div className="flex items-center space-x-6 text-sm text-gray-500">
//                                 <div className="flex items-center space-x-1">
//                                   <Users className="h-4 w-4" />
//                                   <span>{ballot._count?.votes || 0} votes</span>
//                                 </div>
//                                 <div className="flex items-center space-x-1">
//                                   <Clock className="h-4 w-4" />
//                                   <span>Créé le {new Date(ballot.createdAt).toLocaleDateString()}</span>
//                                 </div>
//                               </div>
//                             </div>

//                             {!hasVoted && (
//                               <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
//                                 <Vote className="h-6 w-6 text-blue-600" />
//                               </div>
//                             )}
//                           </div>

//                           <div className="mt-4 flex flex-wrap gap-2">
//                             {ballot.options.slice(0, 4).map((option, index) => (
//                               <span
//                                 key={option.id}
//                                 className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
//                               >
//                                 {option.value}
//                               </span>
//                             ))}
//                             {ballot.options.length > 4 && (
//                               <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
//                                 +{ballot.options.length - 4} autres
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         {!hasVoted && (
//                           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-all duration-300" />
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         ) : (
//           /* Ballot Voting Interface */
//           <div className="max-w-3xl mx-auto">
//             <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 shadow-xl">
//               <div className="flex items-center justify-between mb-6">
//                 <button
//                   onClick={() => setSelectedBallot(null)}
//                   className="text-blue-600 hover:text-blue-800 font-medium"
//                 >
//                   ← Retour aux votes
//                 </button>
//                 <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
//                   <Lock className="h-4 w-4 text-emerald-600" />
//                   <span className="text-sm font-medium text-emerald-700">Chiffrement Actif</span>
//                 </div>
//               </div>

//               <div className="text-center mb-8">
//                 <h2 className="text-3xl font-bold text-gray-800 mb-3">{selectedBallot.title}</h2>
//                 {selectedBallot.description && (
//                   <p className="text-gray-600 text-lg">{selectedBallot.description}</p>
//                 )}
//               </div>

//               <div className="space-y-4 mb-8">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Choisissez votre option :</h3>
//                 {selectedBallot.options.map((option) => (
//                   <label
//                     key={option.id}
//                     className={`block p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
//                       selectedOption === option.id
//                         ? 'border-blue-500 bg-blue-50 shadow-lg'
//                         : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-4">
//                       <input
//                         type="radio"
//                         name="vote-option"
//                         value={option.id}
//                         checked={selectedOption === option.id}
//                         onChange={(e) => setSelectedOption(e.target.value)}
//                         className="w-5 h-5 text-blue-600"
//                       />
//                       <span className="text-lg font-medium text-gray-800">{option.value}</span>
//                     </div>
//                   </label>
//                 ))}
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
//                 <div className="flex items-start space-x-3">
//                   <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
//                   <div className="text-sm">
//                     <p className="font-medium text-blue-800 mb-1">Information sur la sécurité</p>
//                     <p className="text-blue-700">
//                       Votre vote sera chiffré avec la clé publique RSA de l'administrateur. 
//                       Seul l'administrateur pourra déchiffrer les votes pour le comptage final.
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-center">
//                 <button
//                   onClick={confirmVote}
//                   disabled={!selectedOption || loading}
//                   className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
//                 >
//                   {loading ? 'Envoi en cours...' : 'Confirmer mon Vote'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Confirmation Modal */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
//             <div className="text-center mb-6">
//               <div className="p-4 bg-amber-100 rounded-full inline-block mb-4">
//                 <AlertCircle className="h-8 w-8 text-amber-600" />
//               </div>
//               <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirmer votre vote</h3>
//               <p className="text-gray-600">Cette action est irréversible</p>
//             </div>

//             <div className="bg-gray-50 rounded-xl p-4 mb-6">
//               <p className="text-sm text-gray-600 mb-2">Ballot :</p>
//               <p className="font-semibold text-gray-800 mb-3">{selectedBallot.title}</p>
              
//               <p className="text-sm text-gray-600 mb-2">Votre choix :</p>
//               <p className="font-semibold text-blue-600">
//                 {selectedBallot.options.find(opt => opt.id === selectedOption)?.value}
//               </p>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 onClick={() => setShowConfirmModal(false)}
//                 className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200"
//               >
//                 Annuler
//               </button>
//               <button
//                 onClick={handleVote}
//                 disabled={loading}
//                 className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-200"
//               >
//                 {loading ? 'Envoi...' : 'Voter'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VotingPage;

'use client'

import React from 'react';
import RealClientEncryptionUI from '@/components/RealClientEncryptionUI';

export default function VotePage() {
  return <RealClientEncryptionUI />;
}