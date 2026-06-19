'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrafegoGate() {
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!senha || carregando) return;
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch('/api/trafego/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      });
      const data = await res.json();
      if (data.ok) {
        router.refresh();
      } else if (data.error === 'nao_configurada') {
        setErro('Senha não configurada no servidor.');
      } else {
        setErro('Senha incorreta.');
        setSenha('');
      }
    } catch {
      setErro('Erro ao validar. Tente de novo.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-[65vh] flex items-center justify-center">
      <div className="glass-strong rounded-card p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-5">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>

        <h2 className="text-xl font-bold mb-1">Área restrita</h2>
        <p className="text-sm text-muted mb-6">
          Digite a senha para acessar o painel de Tráfego Pago.
        </p>

        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()}
          placeholder="Senha"
          autoFocus
          className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-transparent px-4 py-3 text-center text-base outline-none focus:border-accent transition-colors"
        />

        {erro && <p className="text-sm text-red-500 mt-3">{erro}</p>}

        <button
          onClick={entrar}
          disabled={!senha || carregando}
          className="w-full mt-5 rounded-full bg-accent text-white font-semibold py-3 disabled:opacity-50 transition-opacity"
        >
          {carregando ? 'Verificando…' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}
