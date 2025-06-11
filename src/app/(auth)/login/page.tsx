'use client'
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, Shield, Lock, User, Mail, KeyRound, Zap } from 'lucide-react';

const EnhancedAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [requirements, setRequirements] = useState([
    {
      id: 'length',
      label: 'Au moins 8 caractères',
      validator: (pw) => pw.length >= 8,
      met: false
    },
    {
      id: 'uppercase',
      label: 'Une lettre majuscule',
      validator: (pw) => /[A-Z]/.test(pw),
      met: false
    },
    {
      id: 'lowercase',
      label: 'Une lettre minuscule',
      validator: (pw) => /[a-z]/.test(pw),
      met: false
    },
    {
      id: 'number',
      label: 'Un chiffre',
      validator: (pw) => /\d/.test(pw),
      met: false
    },
    {
      id: 'special',
      label: 'Un caractère spécial',
      validator: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
      met: false
    }
  ]);

  useEffect(() => {
    if (!isLogin) {
      setRequirements(prev => 
        prev.map(req => ({
          ...req,
          met: req.validator(formData.password)
        }))
      );
    }
  }, [formData.password, isLogin]);

  const isPasswordValid = requirements.every(req => req.met);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLogin) {
      if (!isPasswordValid) {
        setError('Le mot de passe ne respecte pas tous les critères');
        setLoading(false);
        return;
      }
      if (!passwordsMatch) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      if (isLogin) {
        // Redirection basée sur le rôle
        if (data.user.role === 'ADMIN') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setSuccess('Inscription réussie! Redirection vers la connexion...');
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ username: '', password: '', confirmPassword: '' });
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      if(err instanceof Error)
        setError(err.message);
      else setError('Veuillez vous reconnecter')
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            CryptoVote
          </h1>
          <p className="text-white/80 text-lg">
            Système de vote sécurisé avec chiffrement RSA
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Mode Toggle */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-8">
            <button
              onClick={() => isLogin || switchMode()}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                isLogin
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <User className="h-4 w-4" />
                <span className="font-medium">Connexion</span>
              </div>
            </button>
            <button
              onClick={() => !isLogin || switchMode()}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                !isLogin
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <KeyRound className="h-4 w-4" />
                <span className="font-medium">Inscription</span>
              </div>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <X className="h-5 w-5 text-red-400" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-emerald-400" />
                  <p className="text-emerald-200 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                />
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-white/90 text-sm font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-white/90 text-sm font-medium">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-4 py-4 bg-white/5 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      formData.confirmPassword && !passwordsMatch
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : 'border-white/20 focus:ring-white/30'
                    }`}
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-red-300 text-xs">Les mots de passe ne correspondent pas</p>
                )}
              </div>
            )}

            {/* Password Requirements (Register only) */}
            {!isLogin && formData.password && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-white/90 text-sm font-medium mb-3">Critères du mot de passe :</h4>
                <div className="space-y-2">
                  {requirements.map(req => (
                    <div
                      key={req.id}
                      className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${
                        req.met ? 'text-emerald-300' : 'text-white/60'
                      }`}
                    >
                      {req.met ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || (!isLogin && (!isPasswordValid || !passwordsMatch))}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isLogin ? 'Connexion...' : 'Inscription...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
                </div>
              )}
            </button>

            {/* Security Info */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-start space-x-3">
                <Lock className="h-5 w-5 text-white/60 mt-0.5" />
                <div className="text-xs text-white/70 leading-relaxed">
                  <p className="font-medium mb-1">Sécurité Cryptographique</p>
                  <p>
                    Vos votes sont protégés par un chiffrement RSA 2048 bits. 
                    Seul l'administrateur peut déchiffrer les résultats avec sa clé privée.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Login Info */}
            {isLogin && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div className="text-xs text-amber-200 leading-relaxed">
                    <p className="font-medium mb-1">Accès Administrateur</p>
                    <p>
                      Utilisez le compte <span className="font-mono bg-amber-500/20 px-1 rounded">admin</span> 
                      {' '}avec le mot de passe par défaut pour accéder aux fonctions d'administration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            Système de vote démocratique et transparent
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuth;