import React, { useState } from 'react';
import { Lock, User, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { adminLogin } from '../lib/api';

interface AdminLoginProps {
  onLoginSuccess: (user: { id: number; username: string }) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(username.trim(), password);
      if (res.success && res.data?.user) {
        onLoginSuccess(res.data.user);
      } else {
        setError(res.error || 'ভুল ইউজারনেম অথবা পাসওয়ার্ড');
      }
    } catch {
      setError('লগইন সার্ভারে যোগাযোগ করতে পারছে না। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onBackToStore}
          className="mb-6 text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>মূল স্টোরে ফিরে যান</span>
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-400/10 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">এডমিন পোর্টাল লগইন</h1>
          <p className="text-xs text-neutral-400 mt-1">
            অর্ডার ও ইনভেন্টরি পরিচালনার জন্য অনুমোদিত ক্রেডেনশিয়াল ব্যবহার করুন।
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              ইউজারনেম
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs sm:text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-400/10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>লগইন করুন</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-800/80 text-[11px] text-neutral-500 text-center">
          <p>প্রাথমিক বুটস্ট্র্যাপ অ্যাকাউন্ট: <span className="font-mono text-neutral-400">admin</span> / <span className="font-mono text-neutral-400">admin12345</span></p>
          <p className="mt-1">লগইন করার পর সেটিংস থেকে পাসওয়ার্ড পরিবর্তন করে নিন।</p>
        </div>
      </div>
    </div>
  );
};
