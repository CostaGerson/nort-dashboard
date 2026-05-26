"use client";

import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { getProduto, formatBRL } from "@/lib/calculadora-nova/constants";
import ColunaFina from "./tela2/ColunaFina";
import ColunaPeca from "./tela2/ColunaPeca";
import ColunaResumo from "./tela2/ColunaResumo";
import Toast from "./tela2/Toast";

export function Tela2Config() {
  const { state, setStep } = useWizard();
  const produto = state.produtoId ? getProduto(state.produtoId) : null;

  if (!produto) {
    // segurança — sem produto, volta pra 1
    if (typeof window !== "undefined") setStep(1);
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header */}
      <header className="border-b border-[#E8E6E1] bg-[#F5F3EF]">
        <div className="mx-auto grid h-[60px] max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 md:px-8">
          <button
            type="button"
            onClick={() => setStep(1)}
            aria-label="Voltar para a tela de produto"
            className="cursor-pointer rounded-full p-2 text-[#1A1A1A] transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="pointer-events-none text-center text-[12px] font-medium text-[#9B9A95]">
            passo 2 de 3 · configuração
          </span>
          <span className="text-[14px] font-medium text-[#1A1A1A]">{produto.nome}</span>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[140px_1fr_320px]">
          <ColunaFina />
          <ColunaPeca />
          <ColunaResumo />
        </div>
      </main>

      <Toast />
    </div>
  );
}
