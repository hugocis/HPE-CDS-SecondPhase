'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ValidationState {
  name: boolean;
  email: boolean;
  password: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    name: true,
    email: true,
    password: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  const [showPasswordChecks, setShowPasswordChecks] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
  };

  const updatePasswordValidation = (password: string) => {
    const checks = validatePassword(password);
    setValidation(prev => ({
      ...prev,
      password: checks
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validación en tiempo real
    if (name === 'email') {
      setValidation(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    } else if (name === 'password') {
      updatePasswordValidation(value);
    } else if (name === 'name') {
      setValidation(prev => ({
        ...prev,
        name: value.length >= 2
      }));
    }

    // Limpiar error general si el usuario está corrigiendo
    setError('');
  };

  const getPasswordStrength = () => {
    const checks = Object.values(validation.password);
    const passedChecks = checks.filter(Boolean).length;
    if (passedChecks === 0) return { text: 'Very Weak', color: 'bg-red-500' };
    if (passedChecks <= 2) return { text: 'Weak', color: 'bg-orange-500' };
    if (passedChecks <= 4) return { text: 'Medium', color: 'bg-yellow-500' };
    return { text: 'Strong', color: 'bg-green-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación final antes de enviar
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (!validation.email) {
      setError('Please enter a valid email address');
      return;
    }

    if (!Object.values(validation.password).every(Boolean)) {
      setError('Please ensure your password meets all requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registro exitoso - redirigir al login
      router.push('/auth/signin?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  validation.name ? 'border-gray-300' : 'border-red-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
              {!validation.name && formData.name && (
                <p className="mt-1 text-xs text-red-600">Name must be at least 2 characters long</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  validation.email ? 'border-gray-300' : 'border-red-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              {!validation.email && formData.email && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setShowPasswordChecks(true)}
              />
              
              {showPasswordChecks && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.color.replace('bg-', 'text-')
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                      style={{
                        width: `${(Object.values(validation.password).filter(Boolean).length / 5) * 100}%`
                      }}
                    />
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li className={`flex items-center ${validation.password.length ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.length ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={`flex items-center ${validation.password.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.uppercase ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={`flex items-center ${validation.password.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.lowercase ? '✓' : '○'} One lowercase letter
                    </li>
                    <li className={`flex items-center ${validation.password.number ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.number ? '✓' : '○'} One number
                    </li>
                    <li className={`flex items-center ${validation.password.special ? 'text-green-600' : 'text-gray-500'}`}>
                      {validation.password.special ? '✓' : '○'} One special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formData.confirmPassword === '' || formData.password === formData.confirmPassword
                    ? 'border-gray-300'
                    : 'border-red-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link href="/auth/signin" className="font-medium text-green-600 hover:text-green-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}