import { useState } from 'react';
import { Sparkles, Eye, EyeOff, LogIn, Lock, Mail } from 'lucide-react';

const VALID_EMAIL    = 'monilkumbhani@gmail.com';
const VALID_PASSWORD = 'Monil@0457';
const SESSION_DAYS   = 3;

// ── Cookie helpers ────────────────────────────────────────────────────────
export function setAuthCookie() {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  document.cookie = `mk-auth=true; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function getAuthCookie(): boolean {
  return document.cookie.split(';').some(c => c.trim().startsWith('mk-auth=true'));
}

export function clearAuthCookie() {
  document.cookie = 'mk-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        setAuthCookie();
        onLogin();
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-200 dark:shadow-purple-900/40">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MK Brothers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Event Decoration Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Stay logged in for {SESSION_DAYS} days</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourmail@gmail.com"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          MK Brothers Event Decoration © 2026
        </p>
      </div>
    </div>
  );
}
