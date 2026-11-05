import React, { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { saveStoredUser } from '../services/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserChange: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export function AuthModal({ isOpen, onClose, onUserChange, currentUser }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const name = displayName.trim() || email.split('@')[0];
      const newUser: UserProfile = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        email: email.trim(),
        isGuest: false,
        joinedAt: Date.now()
      };

      saveStoredUser(newUser);
      onUserChange(newUser);
      setIsLoading(false);
      onClose();
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      const googleUser: UserProfile = {
        id: `google_${Date.now()}`,
        displayName: 'Google Focus Scholar',
        email: 'scholar@gmail.com',
        isGuest: false,
        joinedAt: Date.now()
      };
      saveStoredUser(googleUser);
      onUserChange(googleUser);
      setIsLoading(false);
      onClose();
    }, 700);
  };

  const handleGuestMode = () => {
    const guestUser: UserProfile = {
      id: `guest_${Date.now()}`,
      displayName: 'Guest Athlete',
      email: 'guest@focusaur.app',
      isGuest: true,
      joinedAt: Date.now()
    };
    saveStoredUser(guestUser);
    onUserChange(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-7 bg-[#faf8f5] border border-stone-200/90 rounded-3xl shadow-2xl text-stone-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200/70 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#eaf1eb] text-[#3c5541] mb-3 shadow-xs text-xl">
            🌱
          </div>
          <h2 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            {mode === 'signin' ? 'Welcome Back' : 'Create Free Account'}
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Synchronize your cognitive neuro-benchmarks, streak, and longitudinal analytics.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 mb-5 bg-stone-200/60 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs text-[#a05c44] bg-[#f7ece8] border border-[#c4836a]/30 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Elena Rostova"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#537158]/30 focus:border-[#537158] transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="athlete@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#537158]/30 focus:border-[#537158] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#537158]/30 focus:border-[#537158] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-[#537158] hover:bg-[#435c46] disabled:opacity-60 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                Sign In to Account
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200/80" />
          </div>
          <span className="relative px-3 bg-[#faf8f5] text-[11px] font-medium text-stone-400 uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Guest switch option */}
        {!currentUser.isGuest && (
          <button
            type="button"
            onClick={handleGuestMode}
            className="w-full mt-2.5 py-2 text-[11px] font-medium text-stone-500 hover:text-stone-800 transition-colors"
          >
            Switch to Local Guest Mode
          </button>
        )}
      </div>
    </div>
  );
}
