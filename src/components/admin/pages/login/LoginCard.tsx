'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { loginAdmin } from '@/lib/api/auth-admin';

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const validateForm = () => {
    if (!email.trim()) return 'Email wajib diisi.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Format email tidak valid.';
    if (!password.trim()) return 'Password wajib diisi.';
    if (password.length < 6) return 'Password minimal 6 karakter.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.data.is_admin) {
        router.push('/admin/dashboard');
      } else {
        setErrorMsg('Access denied. You are not an admin.');
        localStorage.clear();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Image src="/logo-1000-cahaya.svg" alt="logo" width={100} height={100} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">1000 CahayaMu Admin</h2>
        <p className="text-slate-600">Login</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 pl-10 pr-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 pl-10 pr-10 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {errorMsg && <p className="text-red-500 text-sm text-center">{errorMsg}</p>}

        <button type="submit" disabled={loading} className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 rounded-md transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
