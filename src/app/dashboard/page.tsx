'use client'
import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Vote, Shield, Lock, Unlock, RefreshCw, Download, Eye } from 'lucide-react';

const Dashboard = () => {
  const [ballots, setBallots] = useState([]);
  const [selectedBallot, setSelectedBallot] = useState(null);
  const [decryptedResults, setDecryptedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('chart'); // 'chart', 'table', 'stats'

  useEffect(() => {
    fetchBallots();
    const interval = setInterval(fetchBallots, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchBallots = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin/ballots');
      const data = await response.json();
      setBallots(data);
      if (!selectedBallot && data.length > 0) {
        setSelectedBallot(data[0]);
      }
    } catch (error) {
      console.error('Error fetching ballots:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const logout = async () => {
    

    try {
      const endpoint =  '/api/auth/signout';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

        // Redirection basée sur le rôle
          window.location.href = '/';
        
     
    } catch (err) {
      if(err instanceof Error)
        console.log(err.message);
      else console.log('Veuillez vous reconnecter')
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = ballots.reduce((sum, ballot) => sum + (ballot._count?.votes || 0), 0);
  const activeBallots = ballots.filter(b => b.isActive).length;

  // Simulation de données pour les graphiques (en attendant le vrai déchiffrement)
  const getChartData = (ballot) => {
    if (!ballot || !ballot.options) return [];
    
    // Simulation de résultats réalistes
    return ballot.options.map((option, index) => ({
      label: option.value,
      votes: Math.floor(Math.random() * 50) + 10,
      percentage: Math.floor(Math.random() * 30) + 10,
      color: `hsl(${220 + index * 40}, 70%, 50%)`
    }));
  };

  const chartData = selectedBallot ? getChartData(selectedBallot) : [];
  const maxVotes = Math.max(...chartData.map(d => d.votes), 1);

  const BarChart = ({ data }) => (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="group">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">{item.label}</span>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold" style={{ color: item.color }}>{item.votes}</span>
              <span className="text-sm text-gray-500">({item.percentage}%)</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${(item.votes / maxVotes) * 100}%`,
                backgroundColor: item.color
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PieChartComponent = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.votes, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="300" height="300" className="transform -rotate-90">
            <circle
              cx="150"
              cy="150"
              r="120"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="20"
            />
            {data.map((item, index) => {
              const angle = (item.votes / total) * 360;
              const path = `M 150 150 L 150 30 A 120 120 0 ${angle > 180 ? 1 : 0} 1 ${
                150 + 120 * Math.sin((currentAngle + angle) * Math.PI / 180)
              } ${
                150 - 120 * Math.cos((currentAngle + angle) * Math.PI / 180)
              } Z`;
              
              const result = (
                <path
                  key={index}
                  d={path}
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                  strokeWidth="2"
                  stroke="white"
                />
              );
              
              currentAngle += angle;
              return result;
            })}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8 space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="font-medium text-gray-700">{item.label}</div>
                <div className="text-sm text-gray-500">{item.votes} votes ({item.percentage}%)</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard des Résultats
                </h1>
                <p className="text-gray-600">Analyse en temps réel des votes cryptographiques</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchBallots}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualiser</span>
              </button>
              <button
                onClick={() =>  window.location.href = '/vote'}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                Mes votes
              </button>
              
              <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-2 rounded-lg">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Sécurisé</span>
              </div>
              <button
                onClick={() => logout()}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Ballots</p>
                <p className="text-3xl font-bold text-blue-600">{ballots.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Vote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ballots Actifs</p>
                <p className="text-3xl font-bold text-indigo-600">{activeBallots}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Votes</p>
                <p className="text-3xl font-bold text-purple-600">{totalVotes}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Participation</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {ballots.length > 0 ? Math.round((totalVotes / ballots.length) * 10) / 10 : 0}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Ballot Selection */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sélectionner un Ballot</h3>
          <div className="flex flex-wrap gap-3">
            {ballots.map((ballot) => (
              <button
                key={ballot.id}
                onClick={() => setSelectedBallot(ballot)}
                className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  selectedBallot?.id === ballot.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {ballot.title}
                <span className="ml-2 text-sm opacity-75">
                  ({ballot._count?.votes || 0})
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedBallot && (
          <>
            {/* Ballot Details */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedBallot.title}</h2>
                  {selectedBallot.description && (
                    <p className="text-gray-600 mt-1">{selectedBallot.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Chiffré</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedBallot._count?.votes || 0}
                    </div>
                    <div className="text-sm text-gray-600">votes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-2 border border-slate-200">
                <div className="flex space-x-2">
                  {[
                    { mode: 'chart', icon: BarChart3, label: 'Graphique' },
                    { mode: 'pie', icon: PieChart, label: 'Camembert' },
                    { mode: 'table', icon: Eye, label: 'Tableau' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === mode
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Résultats en Temps Réel
                </h3>
                
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-200">
                    <Download className="h-4 w-4" />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="min-h-[400px] flex items-center justify-center">
                  {viewMode === 'chart' && <BarChart data={chartData} />}
                  {viewMode === 'pie' && <PieChartComponent data={chartData} />}
                  {viewMode === 'table' && (
                    <div className="w-full">
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Option</th>
                              <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Votes</th>
                              <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Pourcentage</th>
                              <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">Visualisation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {chartData.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                  {item.label}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-lg font-bold" style={{ color: item.color }}>
                                    {item.votes}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-600">
                                  {item.percentage}%
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                      className="h-3 rounded-full transition-all duration-500"
                                      style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: item.color
                                      }}
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-600 mb-2">Aucun vote disponible</h3>
                  <p className="text-gray-500">Les résultats apparaîtront ici une fois que les votes seront soumis.</p>
                </div>
              )}
            </div>

            {/* Encryption Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Information sur le Chiffrement</h4>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Ces résultats sont basés sur une simulation. Pour voir les vrais résultats déchiffrés, 
                    l'administrateur doit utiliser sa clé privée RSA 2048 bits pour déchiffrer les votes. 
                    Chaque vote est chiffré individuellement et ne peut être lu que par l'administrateur.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;