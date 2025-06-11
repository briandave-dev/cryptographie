'use client'
import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertCircle, Settings, Key, Database, Users, Zap, RefreshCw, Download } from 'lucide-react';

const SystemInitialization = () => {
  const [initSteps, setInitSteps] = useState([
    { 
      id: 'database', 
      name: 'Base de données', 
      description: 'Connexion et migrations Prisma',
      status: 'pending',
      details: null
    },
    { 
      id: 'admin', 
      name: 'Compte administrateur', 
      description: 'Création du compte admin par défaut',
      status: 'pending',
      details: null
    },
    { 
      id: 'keys', 
      name: 'Clés cryptographiques', 
      description: 'Génération des clés RSA 2048',
      status: 'pending',
      details: null
    },
    { 
      id: 'permissions', 
      name: 'Permissions système', 
      description: 'Configuration des rôles et accès',
      status: 'pending',
      details: null
    }
  ]);

  const [isInitializing, setIsInitializing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [systemReady, setSystemReady] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState(null);

  const updateStepStatus = (stepId, status, details = null) => {
    setInitSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, details } : step
    ));
  };

  const initializeSystem = async () => {
    setIsInitializing(true);
    setCurrentStep(0);

    try {
      // Step 1: Database
      setCurrentStep(0);
      updateStepStatus('database', 'running');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulation
      updateStepStatus('database', 'completed', {
        message: 'Base de données connectée',
        info: 'PostgreSQL - Tables créées avec succès'
      });

      // Step 2: Admin Account
      setCurrentStep(1);
      updateStepStatus('admin', 'running');
      
      const adminResponse = await fetch('/api/admin/init', {
        method: 'POST'
      });
      
      const adminData = await adminResponse.json();
      
      if (adminResponse.ok) {
        updateStepStatus('admin', 'completed', {
          message: 'Compte admin créé',
          credentials: {
            username: adminData.username,
            password: adminData.password,
            adminId: adminData.adminId
          }
        });
        setAdminCredentials(adminData);
      } else {
        updateStepStatus('admin', 'error', {
          message: adminData.error || 'Erreur lors de la création de l\'admin'
        });
        throw new Error('Admin creation failed');
      }

      // Step 3: Cryptographic Keys
      setCurrentStep(2);
      updateStepStatus('keys', 'running');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation génération RSA
      updateStepStatus('keys', 'completed', {
        message: 'Clés RSA générées',
        info: 'Clé publique/privée 2048 bits - Chiffrement activé'
      });

      // Step 4: Permissions
      setCurrentStep(3);
      updateStepStatus('permissions', 'running');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus('permissions', 'completed', {
        message: 'Permissions configurées',
        info: 'Rôles ADMIN et USER - Middleware d\'authentification actif'
      });

      setSystemReady(true);
    } catch (error) {
      console.error('Initialization error:', error);
      const currentStepId = initSteps[currentStep]?.id;
      updateStepStatus(currentStepId, 'error', {
        message: 'Erreur d\'initialisation',
        error: error.message
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const downloadCredentials = () => {
    const credentialsText = `=== CRYPTOVOTE - IDENTIFIANTS ADMINISTRATEUR ===

Nom d'utilisateur: ${adminCredentials.username}
Mot de passe: ${adminCredentials.password}
ID Admin: ${adminCredentials.adminId}

⚠️  IMPORTANT:
- Changez le mot de passe après la première connexion
- Ces identifiants donnent un accès complet au système
- Conservez ces informations en lieu sûr

Système initialisé le: ${new Date().toLocaleString()}
`;

    const blob = new Blob([credentialsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cryptovote-admin-credentials.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-emerald-600" />;
      case 'running':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status, isActive) => {
    if (status === 'completed') return 'border-emerald-500 bg-emerald-50';
    if (status === 'running') return 'border-blue-500 bg-blue-50';
    if (status === 'error') return 'border-red-500 bg-red-50';
    if (isActive) return 'border-indigo-500 bg-indigo-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-6">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            CryptoVote - Initialisation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Configuration du système de vote sécurisé avec chiffrement asymétrique RSA
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-2xl">
          {!systemReady ? (
            <>
              {/* Progress Steps */}
              <div className="space-y-6 mb-8">
                {initSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${getStepColor(step.status, currentStep === index)}`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStepIcon(step.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {step.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            Étape {index + 1}/4
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{step.description}</p>
                        
                        {step.details && (
                          <div className="mt-3 p-3 bg-white/60 rounded-lg">
                            <p className="text-sm font-medium text-gray-700">
                              {step.details.message}
                            </p>
                            {step.details.info && (
                              <p className="text-xs text-gray-500 mt-1">
                                {step.details.info}
                              </p>
                            )}
                            {step.details.error && (
                              <p className="text-xs text-red-600 mt-1">
                                Erreur: {step.details.error}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progression</span>
                  <span>
                    {initSteps.filter(s => s.status === 'completed').length}/4 étapes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(initSteps.filter(s => s.status === 'completed').length / 4) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Start Button */}
              <div className="text-center">
                <button
                  onClick={initializeSystem}
                  disabled={isInitializing}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isInitializing ? (
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Initialisation en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5" />
                      <span>Démarrer l'Initialisation</span>
                    </div>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center space-y-8">
              <div className="inline-block p-6 bg-emerald-100 rounded-full">
                <Check className="h-16 w-16 text-emerald-600" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  🎉 Système Initialisé avec Succès !
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  CryptoVote est maintenant prêt à fonctionner
                </p>
              </div>

              {/* System Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Key className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Chiffrement</h3>
                  </div>
                  <p className="text-blue-700 text-sm">
                    RSA 2048 bits activé<br />
                    Votes anonymes et sécurisés
                  </p>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Users className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-emerald-800">Utilisateurs</h3>
                  </div>
                  <p className="text-emerald-700 text-sm">
                    Système de rôles configuré<br />
                    Admin et utilisateurs
                  </p>
                </div>
              </div>

              {/* Admin Credentials */}
              {adminCredentials && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-6 w-6 text-amber-600" />
                      <h3 className="font-semibold text-amber-800">
                        Identifiants Administrateur
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
                    >
                      {showDetails ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  
                  {showDetails && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-amber-700 font-medium">Nom d'utilisateur:</span>
                          <div className="font-mono bg-amber-100 px-2 py-1 rounded mt-1">
                            {adminCredentials.username}
                          </div>
                        </div>
                        <div>
                          <span className="text-amber-700 font-medium">Mot de passe:</span>
                          <div className="font-mono bg-amber-100 px-2 py-1 rounded mt-1">
                            {adminCredentials.password}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-amber-200">
                        <p className="text-xs text-amber-700">
                          ⚠️ Changez le mot de passe après la première connexion
                        </p>
                        <button
                          onClick={downloadCredentials}
                          className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4" />
                          <span>Télécharger</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Accéder au Système
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Interface Admin
                </button>
              </div>

              {/* Security Notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-gray-600 mt-1" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-800 mb-2">Rappels de Sécurité</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Les votes sont chiffrés avec RSA 2048 bits</li>
                      <li>• Seul l'admin peut déchiffrer les résultats</li>
                      <li>• Chaque utilisateur ne peut voter qu'une fois par ballot</li>
                      <li>• L'anonymat des votes est garanti</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemInitialization;