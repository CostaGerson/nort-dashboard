"use client";

import { useState } from "react";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { getProduto, TAMANHOS_LABEL } from "@/lib/calculadora-nova/constants";
import { mensagemFaixa } from "@/lib/calculadora-nova/pricing";
import {
  POSICOES,
  posicaoDisponivelNaTecnica,
  labelPosicao,
} from "@/lib/calculadora-nova/posicoes";
import type {
  LocalEstampa,
  SubLocalEstampa,
  TamanhoEstampa,
} from "@/lib/calculadora-nova/types";
import SilhuetaPeca from "./SilhuetaPeca";
import PopoverTamanhos from "./PopoverTamanhos";

// PosiÃ§Ãµes em % do viewBox da silhueta (400x400).
// FRENTE
const POS_FRENTE: Record<string, { x: number; y: number }> = {
  "frente:esquerdo": { x: 38, y: 38 },
  "frente:centro": { x: 50, y: 55 },
  "frente:direito": { x: 62, y: 38 },
  "frente:inferior": { x: 50, y: 78 },
  "manga-esquerda:padrao": { x: 22, y: 40 },
  "manga-direita:padrao": { x: 78, y: 40 },
};
// COSTAS
const POS_COSTAS: Record<string, { x: number; y: number }> = {
  "costas:topo": { x: 50, y: 30 },
  "costas:centro": { x: 50, y: 55 },
  "costas:barra": { x: 50, y: 80 },
  "manga-esquerda:padrao": { x: 22, y: 40 },
  "manga-direita:padrao": { x: 78, y: 40 },
};

type PosKey = { local: LocalEstampa; subLocal: SubLocalEstampa };

export default function ColunaPeca() {
  const {
    state,
    addEstampa,
    removeEstampa,
    getEstampa,
    setQuantidade,
  } = useWizard();

  const [popover, setPopover] = useState<PosKey | null>(null);

  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);

  const ehSublimacao = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";

  return (
    <section className="flex flex-col gap-4 md:gap-6">
      {/* PeÃ§a(s) */}
      <div className="rounded-3xl bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-6">
        {ehSublimacao ? (
          <PecaSublimacao />
        ) : ehCalca ? (
          <PecaCalca />
        ) : (
          <PecaCamiseta
            onAbrirPopover={(p) => setPopover(p)}
            popoverAberto={popover}
          />
        )}
      </div>

      {/* Lista de estampas (sÃ³ camiseta normal) */}
      {!ehSublimacao && !ehCalca && (
        <div className="rounded-3xl bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-6">
          <h3 className="mb-3 text-[14px] font-semibold text-[#1A1A1A]">
            Estampas adicionadas
            {state.estampas.length > 0 && (
              <span className="ml-2 text-[12px] font-medium text-[#9B9A95]">
                ({state.estampas.length})
              </span>
            )}
          </h3>

          {state.estampas.length === 0 ? (
            <p className="text-[13px] text-[#9B9A95]">
              nenhuma estampa ainda â€” toque num + na peÃ§a
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {state.estampas.map((e) => (
                <li key={e.id}>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F3EF] py-1.5 pl-3 pr-1.5 text-[13px] text-[#1A1A1A]">
                    {labelPosicao(e.local, e.subLocal)} Â· {TAMANHOS_LABEL[e.tamanho]} Â·{" "}
                    {state.tecnica === "dtf" ? "DTF" : "Bordado"}
                    <button
                      type="button"
                      onClick={() => removeEstampa(e.local, e.subLocal)}
                      aria-label={`Remover estampa em ${labelPosicao(e.local, e.subLocal)}`}
                      className="ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#FF6B35] text-white transition hover:bg-[#e85d2a]"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <path d="M1 1 L9 9 M9 1 L1 9" stroke="white" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Quantidade + rÃ©gua */}
      <div className="rounded-3xl bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
          {/* Controle de quantidade */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B9A95]">
              Quantidade
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantidade(Math.max(1, state.quantidade - 1))}
                aria-label="Diminuir quantidade"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F5F3EF] text-[18px] font-medium text-[#1A1A1A] transition hover:bg-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                âˆ’
              </button>
              <input
                type="number"
                min={1}
                value={state.quantidade}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setQuantidade(Number.isFinite(v) && v >= 1 ? v : 1);
                }}
                className="w-16 bg-transparent text-center text-[26px] font-medium text-[#1A1A1A] focus:outline-none"
                aria-label="Quantidade"
              />
              <button
                type="button"
                onClick={() => setQuantidade(state.quantidade + 1)}
                aria-label="Aumentar quantidade"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F5F3EF] text-[18px] font-medium text-[#1A1A1A] transition hover:bg-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                +
              </button>
            </div>
          </div>

          {/* RÃ©gua de faixa */}
          <ReguaFaixa />
        </div>

        {/* Mensagem de incentivo */}
        {(ehSublimacao || ehCalca || state.estampas.length > 0) && (
          <p className="mt-4 text-[13px] text-[#9B9A95]">{mensagemFaixa(state)}</p>
        )}
      </div>

      {/* Popover de tamanhos (provisÃ³rio, sem radial) */}
      {popover && (
        <PopoverTamanhos
          local={popover.local}
          subLocal={popover.subLocal}
          tecnica={state.tecnica}
          onEscolher={(tamanho) => {
            addEstampa(popover.local, popover.subLocal, tamanho);
            setPopover(null);
          }}
          onFechar={() => setPopover(null)}
        />
      )}
    </section>
  );
}

/* ---------- Sub-componentes ---------- */

function PecaCamiseta({
  onAbrirPopover,
  popoverAberto,
}: {
  onAbrirPopover: (p: PosKey) => void;
  popoverAberto: PosKey | null;
}) {
  const { state, removeEstampa, getEstampa } = useWizard();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <PecaVista
        vista="frente"
        mapaPos={POS_FRENTE}
        onAbrirPopover={onAbrirPopover}
      />
      <PecaVista
        vista="costas"
        mapaPos={POS_COSTAS}
        onAbrirPopover={onAbrirPopover}
      />
    </div>
  );
}

function PecaVista({
  vista,
  mapaPos,
  onAbrirPopover,
}: {
  vista: "frente" | "costas";
  mapaPos: Record<string, { x: number; y: number }>;
  onAbrirPopover: (p: PosKey) => void;
}) {
  const { state, removeEstampa, getEstampa } = useWizard();
  if (!state.produtoId) return null;

  // Filtra as POSICOES que pertencem a esta vista
  // (frente/costas estritamente; mangas aparecem nas duas)
  const posicoesDestaVista = POSICOES.filter((p) => {
    if (p.local === "frente") return vista === "frente";
    if (p.local === "costas") return vista === "costas";
    return true; // mangas
  });

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3EF]">
        <SilhuetaPeca
          produtoId={state.produtoId}
          corId={state.corId}
          vista={vista}
        />

        {/* Overlay com "+" */}
        {posicoesDestaVista.map((p) => {
          const disponivel = posicaoDisponivelNaTecnica(p, state.tecnica);
          if (!disponivel) return null; // posiÃ§Ãµes bloqueadas somem

          const key = `${p.local}:${p.subLocal}`;
          const coord = mapaPos[key];
          if (!coord) return null;

          const estampa = getEstampa(p.local, p.subLocal);
          const ocupado = !!estampa;

          return (
            <button
              key={`${vista}-${key}`}
              type="button"
              aria-label={
                ocupado
                  ? `Remover estampa em ${labelPosicao(p.local, p.subLocal)}`
                  : `Adicionar estampa em ${labelPosicao(p.local, p.subLocal)}`
              }
              onClick={() => {
                if (ocupado) {
                  // tocar num "+" aceso: remove direto na 2a
                  removeEstampa(p.local, p.subLocal);
                } else {
                  onAbrirPopover({ local: p.local, subLocal: p.subLocal });
                }
              }}
              style={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full text-[10px] font-bold transition focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                ocupado
                  ? "h-9 w-9 bg-[#FF6B35] text-white shadow-[0_4px_12px_rgba(255,107,53,0.4)] hover:scale-110"
                  : "h-7 w-7 bg-[#FF6B35]/30 text-white hover:bg-[#FF6B35]/60"
              }`}
            >
              {ocupado ? estampa.tamanho.replace("x", "Ã—") : (
                <span className="text-[18px] leading-none text-white/80">+</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-[12px] font-medium uppercase tracking-wider text-[#9B9A95]">
        {vista}
      </p>
    </div>
  );
}

function PecaSublimacao() {
  const { state } = useWizard();
  if (!state.produtoId) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3EF]">
          <SilhuetaPeca produtoId={state.produtoId} corId={null} vista="frente" />
        </div>
        <p className="mt-2 text-center text-[12px] font-medium uppercase tracking-wider text-[#9B9A95]">
          frente
        </p>
      </div>
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3EF]">
          <SilhuetaPeca produtoId={state.produtoId} corId={null} vista="costas" />
        </div>
        <p className="mt-2 text-center text-[12px] font-medium uppercase tracking-wider text-[#9B9A95]">
          costas
        </p>
      </div>
      <div className="md:col-span-2 rounded-2xl bg-[#FFF4EE] p-4 text-center text-[13px] text-[#FF6B35]">
        PeÃ§a inteira personalizada â€” vocÃª envia a arte depois.
      </div>
    </div>
  );
}

function PecaCalca() {
  const { state, setBolsoCalca } = useWizard();
  if (!state.produtoId) return null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr] md:gap-6">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3EF]">
          <SilhuetaPeca produtoId={state.produtoId} corId={state.corId} vista="frente" />
        </div>
        <p className="mt-2 text-center text-[12px] font-medium uppercase tracking-wider text-[#9B9A95]">
          frente
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3">
        <p className="text-[14px] font-semibold text-[#1A1A1A]">Bordar no bolso?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setBolsoCalca(true)}
            className={`flex-1 cursor-pointer rounded-full px-4 py-3 text-[14px] font-medium transition ${
              state.bolsoCalca
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#F5F3EF] text-[#1A1A1A] hover:bg-[#E8E6E1]"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setBolsoCalca(false)}
            className={`flex-1 cursor-pointer rounded-full px-4 py-3 text-[14px] font-medium transition ${
              !state.bolsoCalca
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#F5F3EF] text-[#1A1A1A] hover:bg-[#E8E6E1]"
            }`}
          >
            NÃ£o
          </button>
        </div>
        <p className="text-[11px] text-[#9B9A95]">
          Bordado no bolso (taxa de programaÃ§Ã£o: R$ 20 uma vez).
        </p>
      </div>
    </div>
  );
}

function ReguaFaixa() {
  const { state } = useWizard();
  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);
  const ehSubli = produto.id === "dryfit-sublimacao-total";

  // marcas e faixas
  const marcas = ehSubli ? ["1", "6", "11-20", "21+"] : ["1", "6", "11-19", "20+"];
  const fronteiras = ehSubli ? [1, 6, 11, 21] : [1, 6, 11, 20];

  // posiÃ§Ã£o do pino em % (linear entre fronteiras)
  const q = state.quantidade;
  const max = ehSubli ? 25 : 24;
  const pct = Math.min(100, (Math.min(q, max) / max) * 100);

  // descobrir faixa ativa
  let faixaAtivaIdx = 0;
  for (let i = 0; i < fronteiras.length; i++) {
    if (q >= fronteiras[i]) faixaAtivaIdx = i;
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B9A95]">
        Faixa de preÃ§o
      </p>
      <div className="relative h-[3px] w-full rounded-full bg-[#E8E6E1]">
        <div
          className="h-full rounded-full bg-[#FF6B35] transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6B35] shadow-[0_0_0_3px_rgba(255,107,53,0.2)] transition-all duration-200"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#9B9A95]">
        {marcas.map((m, i) => (
          <span key={m} className={i === faixaAtivaIdx ? "font-semibold text-[#FF6B35]" : ""}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

