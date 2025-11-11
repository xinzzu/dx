'use client';
import { LoginCard } from './LoginCard';

export function LoginContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 px-4">
      <LoginCard />
      <p className="mt-8 text-sm text-slate-500">© 2025 1000CahayaMu</p>
    </div>
  );
}
