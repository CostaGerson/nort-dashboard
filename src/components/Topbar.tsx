'use client';

import { signOut } from 'next-auth/react';
import { ThemeToggle } from './ThemeToggle';

export function Topbar({ userName }: { userName: string }) {
  const firstName = userName.split(' ')[0] || userName;

  return (
    <header className="flex items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full glass flex items-center justify-center font-semibold">
          {firstName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">Bem-vindo</p>
          <h1 className="text-lg font-semibold">Olá, {firstName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex glass rounded-full px-4 py-2 items-center gap-2 text-sm text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M21 21l-4.3-4.3"></path>
          </svg>
          <span>Buscar…</span>
        </div>
        <ThemeToggle />
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="glass rounded-full w-10 h-10 flex items-center justify-center card-hover"
          title="Sair"
          aria-label="Sair"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <path d="M16 17l5-5-5-5"></path>
            <path d="M21 12H9"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
