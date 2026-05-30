"use client";

import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { getProduto } from "@/lib/calculadora-nova/constants";
import PalcoPeca from "./tela2/PalcoPeca";
import PainelConfig from "./tela2/PainelConfig";
import Toast from "./tela2/Toast";

export function Tela2Config() {
  const { state, setStep } = useWizard();
  const produto = state.produtoId ? getProduto(state.produtoId) : null;

  if (!produto) {
    if (typeof window !== "undefined") setStep(1);
    return null;
  }

  return (
    <div className="nort-bg flex min-h-screen flex-col">
      {/* Header */}
      <header className="mx-auto grid h-[64px] w-full max-w-[1600px] shrink-0 grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-8">
        <button
          type="button"
          onClick={() => setStep(1)}
          aria-label="Voltar para a tela de produto"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-white/70 text-[var(--navy)] transition hover:bg-white active:scale-95 focus:outline-none"
          style={{ boxShadow: "var(--sh-sm)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="pointer-events-none text-center text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Passo 2 de 3 · Configuração
        </span>
        <span className="font-display text-right text-[15px] font-bold text-[var(--ink)]">
          {produto.nome}
        </span>
      </header>

      {/* Conteúdo — ocupa toda a tela (totem fullscreen) */}
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 px-4 pb-6 md:px-8">
        <div className="grid w-full flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
          <PalcoPeca />
          <PainelConfig />
        </div>
      </main>

      <Toast />
    </div>
  );
}
