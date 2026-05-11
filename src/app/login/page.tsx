'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn('credentials', {
      username: username.trim().toUpperCase(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError('Usuário ou senha incorretos.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="glass-strong rounded-card p-8 sm:p-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-bold">
            NS
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Nort Sports</h1>
            <p className="text-xs text-muted">Dashboard interno</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-1">Entrar</h2>
        <p className="text-sm text-muted mb-6">Use seu usuário e senha de acesso.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-medium block mb-2">Usuário</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-glass"
              placeholder="Ex: GERSONCOSTA"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted font-medium block mb-2">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-glass"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 px-3 py-2 rounded-soft bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-accent mt-2 disabled:opacity-60">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
