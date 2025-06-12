'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Vote, Settings, BarChart3, Lock, Unlock, Eye, EyeOff, Clock, CheckCircle, AlertCircle, Download, User } from 'lucide-react';


interface ValidationErrors {
  title?: string;
  description?: string;
  options?: string;
}

type Ballot = {
  id: string;
  title: string;
  description?: string;
  options: any[];
  isActive?: boolean;
  _count?: { votes?: number };
  // Add other properties as needed
};

const AdminDashboard = () => {
  type Ballot = {
    id: string;
    title: string;
    description?: string;
    options: any[];
    isActive?: boolean;
    _count?: { votes?: number };
    // Add other properties as needed
  };
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [newBallot, setNewBallot] = useState({
    title: '',
    description: '',
    options: ['', '']
  });
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [selectedBallot, setSelectedBallot] = useState<Ballot | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  type DecryptedResults = {
    validVotes: number;
    totalVotes: number;
    results: any[];
    summary?: {
      winner: string;
      winnerVotes: number;
      winnerPercentage: number;
    };
    decryptedVotes: any[];
  };
  const [decryptedResults, setDecryptedResults] = useState<DecryptedResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'voters', 'details'
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    fetchBallots();
  }, []);

  const fetchBallots = async () => {
    try {
      const response = await fetch('/api/admin/ballots');
      const data = await response.json();
      setBallots(data);
    } catch (error) {
      console.error('Error fetching ballots:', error);
    }
  };

  const handleCreateBallot = async () => {
    if (!validateBallotForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/ballots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newBallot.title,
          description: newBallot.description,
          options: newBallot.options.filter(opt => opt.trim() !== '')
        })
      });

      if (response.ok) {
        setNewBallot({ title: '', description: '', options: ['', ''] });
        fetchBallots();
      }
    } catch (error) {
      console.error('Error creating ballot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptVotes = async () => {
    if (!selectedBallot) {
      alert('Aucun ballot sélectionné.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/decrypt-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ballotId: selectedBallot.id,
          adminPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        setDecryptedResults(data);
        setAdminPassword('');
        setViewMode('overview'); // Reset to overview when new results arrive
      } else {
        alert(data.error || 'Erreur lors du déchiffrement');
      }
    } catch (error) {
      console.error('Error decrypting votes:', error);
      alert('Erreur lors du déchiffrement');
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setNewBallot(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index: number) => {
    setNewBallot(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index: number, value: string) => {
    setNewBallot(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const logout = async () => {
    try {
      const endpoint = '/api/auth/signout';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      window.location.href = '/';
    } catch (err) {
      if (err instanceof Error)
        console.log(err.message);
      else console.log('Veuillez vous reconnecter')
    } finally {
      setLoading(false);
    }
  };

  const VotersView = ({ results }: { results: any }) => (
    <div className="space-y-6">
      {results.map((result: any, index: number) => (
        <div key={index} className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-800 flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 bg-indigo-500" />
              {result.optionText}
            </h4>
            <div className="flex items-center space-x-4">
              <span className="text-xl font-bold text-indigo-600">{result.votes} votes</span>
              <span className="text-sm text-gray-500">({result.percentage}%)</span>
            </div>
          </div>

          {result.voters && result.voters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.voters.map((voter: any, voterIndex: number) => (
                <div
                  key={voterIndex}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {voter.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{voter.username}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(voter.voteTime).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucun votant pour cette option</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const DetailsView = ({ data }: { data: any }) => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{data.totalVotes}</div>
          <div className="text-sm text-blue-700">Total Votes</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{data.validVotes}</div>
          <div className="text-sm text-emerald-700">Votes Valides</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{data.invalidVotes}</div>
          <div className="text-sm text-red-700">Votes Invalides</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.validVotes > 0 ? ((data.validVotes / data.totalVotes) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-sm text-purple-700">Taux de Validité</div>
        </div>
      </div>

      {/* Winner */}
      {data.summary && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
          <h4 className="text-lg font-semibold text-amber-800 mb-2 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Gagnant
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-amber-700">{data.summary.winner}</div>
              <div className="text-amber-600">Option gagnante</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{data.summary.winnerVotes}</div>
              <div className="text-sm text-amber-700">{data.summary.winnerPercentage}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Votes Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800">Votes Individuels Déchiffrés</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Votant</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Option Choisie</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date/Heure</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ID Vote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.decryptedVotes.map((vote: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {vote.voter.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{vote.voter}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                      {vote.optionText}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(vote.voteTime).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500">
                      {vote.voteId.substring(0, 8)}...
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const validateBallotForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    // Validate title
    if (!newBallot.title.trim()) {
      errors.title = "Le titre est obligatoire";
      isValid = false;
    }

    // Validate description
    if (!newBallot.description.trim()) {
      errors.description = "La description est obligatoire";
      isValid = false;
    }

    // Validate options - at least 2 non-empty options
    const validOptions = newBallot.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      errors.options = "Au moins 2 options sont requises";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header - Made responsive */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Administration
                </h1>
                <p className="text-sm sm:text-base text-gray-600">Gestion du système de vote</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">RSA 2048</span>
              </div>
              <button
                onClick={() => logout()}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm sm:text-base"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Stats Cards - Made responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-indigo-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Ballots</p>
                <p className="text-3xl font-bold text-indigo-600">{ballots.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Vote className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Votes Totaux</p>
                <p className="text-3xl font-bold text-purple-600">
                  {ballots.reduce((sum, ballot) => sum + (ballot._count?.votes || 0), 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ballots Actifs</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {ballots.filter(b => b.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Create New Ballot - Made responsive */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-indigo-100 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600" />
            Créer un Nouveau Ballot
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du Ballot
                </label>
                <input
                  type="text"
                  value={newBallot.title}
                  onChange={(e) => {
                    setNewBallot(prev => ({ ...prev, title: e.target.value }));
                    setFormErrors(prev => ({ ...prev, title: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.title ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Ex: Élection présidentielle 2024"
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newBallot.description}
                  onChange={(e) => {
                    setNewBallot(prev => ({ ...prev, description: e.target.value }));
                    setFormErrors(prev => ({ ...prev, description: undefined }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    formErrors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                  } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Description du ballot"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Options de Vote
              </label>
              <div className="space-y-3">
                {newBallot.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        updateOption(index, e.target.value);
                        setFormErrors(prev => ({ ...prev, options: undefined }));
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl border ${
                        formErrors.options ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200`}
                      placeholder={`Option ${index + 1}`}
                    />
                    {newBallot.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                {formErrors.options && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.options}</p>
                )}
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                >
                  + Ajouter une option
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateBallot}
                disabled={loading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Création...' : 'Créer le Ballot'}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Ballots - Made responsive */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-indigo-100 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Ballots Existants</h2>

          <div className="grid gap-4 sm:gap-6">
            {ballots.map((ballot) => (
              <div key={ballot.id} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{ballot.title}</h3>
                    {ballot.description && (
                      <p className="text-sm text-gray-600">{ballot.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium w-full sm:w-auto text-center">
                      {ballot._count?.votes || 0} votes
                    </span>
                    <button
                      onClick={() => {
                        setSelectedBallot(ballot);
                        setShowDecryptModal(true);
                        setDecryptedResults(null);
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
                    >
                      <Unlock className="h-4 w-4" />
                      <span>Déchiffrer</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {ballot.options.map((option: any) => (
                    <div key={option.id} className="bg-gray-50 rounded-lg p-3 text-center">
                      <span className="text-sm font-medium text-gray-700">{option.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Made responsive */}
      {showDecryptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Déchiffrement des Votes - {selectedBallot?.title}
              </h3>
              <button
                onClick={() => {
                  setShowDecryptModal(false);
                  setDecryptedResults(null);
                  setAdminPassword('');
                  setViewMode('overview');
                }}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                ✕
              </button>
            </div>

            {!decryptedResults ? (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-amber-600" />
                    <p className="text-amber-800 font-medium">
                      Authentification Admin Requise
                    </p>
                  </div>
                  <p className="text-amber-700 text-sm mt-2">
                    Entrez le mot de passe admin pour déchiffrer les votes avec la clé privée RSA.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe Admin
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Entrez le mot de passe admin"
                      onKeyPress={(e) => e.key === 'Enter' && handleDecryptVotes()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDecryptModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDecryptVotes}
                    disabled={!adminPassword || loading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Déchiffrement...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        <span>Déchiffrer les Votes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <Unlock className="h-5 w-5 text-emerald-600" />
                    <p className="text-emerald-800 font-medium">
                      Déchiffrement Réussi
                    </p>
                  </div>
                  <p className="text-emerald-700 text-sm mt-1">
                    {decryptedResults.validVotes}/{decryptedResults.totalVotes} votes déchiffrés avec succès
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-xl p-2">
                    <div className="flex space-x-2">
                      {[
                        { mode: 'overview', icon: BarChart3, label: 'Aperçu' },
                        { mode: 'voters', icon: Users, label: 'Votants' },
                        { mode: 'details', icon: CheckCircle, label: 'Détails' }
                      ].map(({ mode, icon: Icon, label }) => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${viewMode === mode
                              ? 'bg-indigo-500 text-white shadow-lg'
                              : 'text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content Based on View Mode */}
                {viewMode === 'overview' && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Résultats par Option:</h4>
                    {decryptedResults.results.map((result: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{result.optionText}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-xl font-bold text-indigo-600">{result.votes}</span>
                            <span className="text-sm text-gray-500">({result.percentage}%)</span>
                            {result.voters && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                {result.voters.length} votant(s)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{
                              width: `${parseFloat(result.percentage)}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'voters' && (
                  <VotersView results={decryptedResults.results} />
                )}

                {viewMode === 'details' && (
                  <DetailsView data={decryptedResults} />
                )}

                {/* Export Button */}
                {/* <div className="flex justify-end">
                  <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Exporter les Résultats</span>
                  </button>
                </div> */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;