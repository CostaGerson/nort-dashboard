"use client";

import { getProduto } from "@/lib/calculadora-nova/constants";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";

export function Tela2Placeholder() {
  const { state, setStep, resetar } = useWizard();
  const produto = state.produtoId ? getProduto(state.produtoId) : null;

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-[#1A1A1A]">
      <header className="px-4 md:px-8 lg:px-12 h-[60px] border-b border-[#E8E6E1] flex items-center">
        <button
          type="button"
          onClick={() => {
            setStep(1);
            resetar();
          }}
          className="w-9 h-9 grid place-items-center rounded-full hover:bg-black/5 transition-colors"
          aria-label="Voltar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="flex-1 text-center text-xs font-medium text-[#9B9A95] -ml-9">
          passo 2 de 3 · configuração
        </span>
      </header>

      <main className="px-6 py-16 max-w-[800px] mx-auto text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-semibold mb-4">
          Em construção
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">
          Tela 2 — configuração
        </h1>
        <p className="text-[#9B9A95]">
          Produto escolhido:{" "}
          <span className="font-medium text-[#1A1A1A]">
            {produto?.nome ?? "—"}
          </span>
        </p>
        <p className="text-sm text-[#9B9A95] mt-6">
          A tela de configuração será entregue na próxima rodada.
        </p>
      </main>
    </div>
  );
}
