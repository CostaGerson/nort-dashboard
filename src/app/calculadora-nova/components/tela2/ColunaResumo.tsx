"use client";

import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import {
  getProduto,
  CORES,
  formatBRL,
} from "@/lib/calculadora-nova/constants";

export default function ColunaResumo() {
  const { state, resultado, setStep } = useWizard();
  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);
  const ehSublimacao = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";

  const corNome = state.corId
    ? state.corId === "especial"
      ? "Cor especial"
      : CORES[state.corId].nome
    : "—";

  const tecnicaLabel = state.tecnica === "dtf" ? "DTF" : "Bordado";

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl bg-[#001F3F] p-5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] md:p-6">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">
          Seu orçamento
        </p>
        <h2 className="mb-4 text-[18px] font-semibold">{produto.nome}</h2>

        <dl className="space-y-2 text-[13px]">
          <Linha label="Produto" valor={produto.nome} />

          {!ehSublimacao && <Linha label="Cor" valor={corNome} />}
          {ehSublimacao && <Linha label="Cor" valor="Arte total" />}

          {!ehCalca && produto.permiteManga && (
            <Linha label="Manga" valor={state.manga === "curta" ? "Curta" : "Longa"} />
          )}

          {!ehSublimacao && !ehCalca && (
            <>
              <Linha label="Técnica" valor={tecnicaLabel} />
              <Linha label="Estampas" valor={String(state.estampas.length)} />
            </>
          )}

          {ehCalca && (
            <Linha label="Bolso" valor={state.bolsoCalca ? "Sim" : "Não"} />
          )}

          <Linha
            label="Quantidade"
            valor={`${state.quantidade} ${state.quantidade === 1 ? "peça" : "peças"}`}
          />

          {resultado.taxaProgramacao > 0 && (
            <Linha label="Taxa bordado" valor={formatBRL(resultado.taxaProgramacao)} />
          )}
        </dl>

        <div className="mt-4 rounded-xl bg-white/10 p-3">
          <p className="text-[11px] uppercase tracking-wider text-white/60">por peça</p>
          <p className="text-[20px] font-semibold">{formatBRL(resultado.precoPeca)}</p>
        </div>

        <div className="mt-2 rounded-xl bg-[#FF6B35] p-4">
          <p className="text-[11px] uppercase tracking-wider text-white/80">total</p>
          <p className="text-[28px] font-bold leading-tight">{formatBRL(resultado.total)}</p>
        </div>

        <button
          type="button"
          onClick={() => setStep(3)}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white py-3 text-[14px] font-semibold text-[#001F3F] transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 focus:ring-offset-[#001F3F]"
        >
          continuar
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-white/60">{label}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  );
}
