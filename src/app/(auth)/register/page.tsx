// filepath: /cryptographie/src/app/(auth)/register/page.tsx
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  met: boolean;
}

const Register = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([
    {
      id: 'length',
      label: 'At least 8 characters long',
      validator: (pw) => pw.length >= 8,
      met: false
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter',
      validator: (pw) => /[A-Z]/.test(pw),
      met: false
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter',
      validator: (pw) => /[a-z]/.test(pw),
      met: false
    },
    {
      id: 'number',
      label: 'Contains number',
      validator: (pw) => /\d/.test(pw),
      met: false
    },
    {
      id: 'special',
      label: 'Contains special character',
      validator: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
      met: false
    }
  ]);

  // Check password requirements whenever password changes
  useEffect(() => {
    setRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.validator(password)
      }))
    );
  }, [password]);

  // Check if all requirements are met
  const isPasswordValid = requirements.every(req => req.met);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Store private key in localStorage (in production, use more secure storage)
      localStorage.setItem('privateKey', data.privateKey);
      
      setSuccess('Registration successful! You can now log in.');
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Please fill in your details to register
          </p>
          
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-500 text-center">{success}</p>
            )}
            
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password requirements checklist */}
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Requirements:
                </p>
                <ul className="space-y-1">
                  {requirements.map(req => (
                    <li 
                      key={req.id}
                      className={`flex items-center text-sm ${
                        req.met 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {req.met ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <X className="w-4 h-4 mr-2" />
                      )}
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid}
              className={`w-full py-2 rounded-md transition-colors ${
                isPasswordValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;