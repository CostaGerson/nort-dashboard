"use client";

import { useRef, useState } from "react";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { getProduto, TAMANHOS_LABEL, formatBRL } from "@/lib/calculadora-nova/constants";
import { mensagemFaixa, economiaPorPeca } from "@/lib/calculadora-nova/pricing";
import {
  POSICOES,
  posicaoDisponivelNaTecnica,
  labelPosicao,
} from "@/lib/calculadora-nova/posicoes";
import type {
  LocalEstampa,
  SubLocalEstampa,
} from "@/lib/calculadora-nova/types";
import SilhuetaPeca from "./SilhuetaPeca";
import RadialTamanhos from "./RadialTamanhos";

// Posicoes em % do viewBox da silhueta (400x400).
const POS_FRENTE: Record<string, { x: number; y: number }> = {
  "frente:esquerdo": { x: 38, y: 38 },
  "frente:centro": { x: 50, y: 55 },
  "frente:direito": { x: 62, y: 38 },
  "frente:inferior": { x: 50, y: 78 },
  "manga-esquerda:padrao": { x: 22, y: 40 },
  "manga-direita:padrao": { x: 78, y: 40 },
};
const POS_COSTAS: Record<string, { x: number; y: number }> = {
  "costas:topo": { x: 50, y: 30 },
  "costas:centro": { x: 50, y: 55 },
  "costas:barra": { x: 50, y: 80 },
  "manga-esquerda:padrao": { x: 22, y: 40 },
  "manga-direita:padrao": { x: 78, y: 40 },
};

interface RadialState {
  local: LocalEstampa;
  subLocal: SubLocalEstampa;
  origemX: number;
  origemY: number;
}

export default function ColunaPeca() {
  const { state, addEstampa, setQuantidade } = useWizard();
  const [radial, setRadial] = useState<RadialState | null>(null);

  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);

  const ehSublimacao = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";

  return (
    <section className="flex flex-col gap-4 md:gap-6">
      {/* Peca(s) */}
      <div className="rounded-3xl bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-6">
        {ehSublimacao ? (
          <PecaSublimacao />
        ) : ehCalca ? (
          <PecaCalca />
        ) : (
          <PecaCamiseta onAbrirRadial={setRadial} />
        )}
      </div>

      {/* Lista de estampas (so camiseta normal) */}
      {!ehSublimacao && !ehCalca && <ListaEstampas />}

      {/* Quantidade + regua */}
      <div className="rounded-3xl bg-white p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] ring-1 ring-black/5 md:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B9A95]">
              Quantidade
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantidade(Math.max(1, state.quantidade - 1))}
                aria-label="Diminuir quantidade"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F5F3EF] text-[20px] font-medium leading-none text-[#1A1A1A] transition hover:bg-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                −
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
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#F5F3EF] text-[20px] font-medium leading-none text-[#1A1A1A] transition hover:bg-[#E8E6E1] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              >
                +
              </button>
            </div>
          </div>

          <ReguaFaixa />
        </div>

        {(ehSublimacao || ehCalca || state.estampas.length > 0) && (
          <>
            <p className="mt-4 text-[13px] text-[#9B9A95]">{mensagemFaixa(state)}</p>
            {economiaPorPeca(state) > 0 && (
              <p className="mt-1 text-[13px] font-medium text-[#FF6B35]">
                Boa! Caiu {formatBRL(economiaPorPeca(state))} por peça 🎉
              </p>
            )}
          </>
        )}
      </div>

      {/* Radial de tamanhos */}
      {radial && (
        <RadialTamanhos
          origemX={radial.origemX}
          origemY={radial.origemY}
          local={radial.local}
          subLocal={radial.subLocal}
          tecnica={state.tecnica}
          onEscolher={(tamanho) => {
            addEstampa(radial.local, radial.subLocal, tamanho);
            setRadial(null);
          }}
          onFechar={() => setRadial(null)}
        />
      )}
    </section>
  );
}

/* ---------- Pecas ---------- */

function PecaCamiseta({
  onAbrirRadial,
}: {
  onAbrirRadial: (r: RadialState) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <PecaVista vista="frente" mapaPos={POS_FRENTE} onAbrirRadial={onAbrirRadial} />
      <PecaVista vista="costas" mapaPos={POS_COSTAS} onAbrirRadial={onAbrirRadial} />
    </div>
  );
}

function PecaVista({
  vista,
  mapaPos,
  onAbrirRadial,
}: {
  vista: "frente" | "costas";
  mapaPos: Record<string, { x: number; y: number }>;
  onAbrirRadial: (r: RadialState) => void;
}) {
  const { state, removeEstampa, getEstampa } = useWizard();
  const containerRef = useRef<HTMLDivElement>(null);
  if (!state.produtoId) return null;

  const posicoesDestaVista = POSICOES.filter((p) => {
    if (p.local === "frente") return vista === "frente";
    if (p.local === "costas") return vista === "costas";
    return true;
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F5F3EF]"
      >
        <SilhuetaPeca
          produtoId={state.produtoId}
          corId={state.corId}
          vista={vista}
        />

        {posicoesDestaVista.map((p) => {
          const disponivel = posicaoDisponivelNaTecnica(p, state.tecnica);
          if (!disponivel) return null;

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
              onClick={(e) => {
                if (ocupado) {
                  removeEstampa(p.local, p.subLocal);
                } else {
                  // descobrir posicao absoluta do "+" para ancorar o radial
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  const origemX = rect.left + rect.width / 2;
                  const origemY = rect.top + rect.height / 2;
                  onAbrirRadial({
                    local: p.local,
                    subLocal: p.subLocal,
                    origemX,
                    origemY,
                  });
                }
              }}
              style={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full font-bold transition focus:outline-none focus:ring-2 focus:ring-[#FF6B35] ${
                ocupado
                  ? "flex h-10 w-10 items-center justify-center bg-[#FF6B35] text-white shadow-[0_4px_12px_rgba(255,107,53,0.4)] hover:scale-110 text-[10px]"
                  : "flex h-8 w-8 items-center justify-center bg-[#FF6B35]/30 text-white hover:bg-[#FF6B35]/60"
              }`}
            >
              {ocupado ? (
                <span className="leading-tight">{TAMANHOS_LABEL[estampa.tamanho]}</span>
              ) : (
                <span className="text-[20px] leading-none text-white/90">+</span>
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
        Peça inteira personalizada — você envia a arte depois.
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
            Não
          </button>
        </div>
        <p className="text-[11px] text-[#9B9A95]">
          Bordado no bolso (taxa de programação: R$ 20 uma vez).
        </p>
      </div>
    </div>
  );
}

/* ---------- Lista ---------- */

function ListaEstampas() {
  const { state, removeEstampa } = useWizard();
  return (
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
          nenhuma estampa ainda — toque num + na peça
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {state.estampas.map((e) => (
            <li key={e.id}>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F3EF] py-1.5 pl-3 pr-1.5 text-[13px] text-[#1A1A1A]">
                {labelPosicao(e.local, e.subLocal)} · {TAMANHOS_LABEL[e.tamanho]} ·{" "}
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
  );
}

/* ---------- Regua arrastavel ---------- */

function ReguaFaixa() {
  const { state, setQuantidade } = useWizard();
  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);
  const ehSubli = produto.id === "dryfit-sublimacao-total";

  const marcas = ehSubli
    ? [{ label: "1", q: 1 }, { label: "6", q: 6 }, { label: "11-20", q: 11 }, { label: "21+", q: 21 }]
    : [{ label: "1", q: 1 }, { label: "6", q: 6 }, { label: "11-19", q: 11 }, { label: "20+", q: 20 }];

  const max = ehSubli ? 25 : 24;
  const q = state.quantidade;
  const pct = Math.min(100, (Math.min(q, max) / max) * 100);

  let faixaAtivaIdx = 0;
  for (let i = 0; i < marcas.length; i++) {
    if (q >= marcas[i].q) faixaAtivaIdx = i;
  }

  function onSlider(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    if (Number.isFinite(v)) setQuantidade(Math.max(1, v));
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#9B9A95]">
        Faixa de preço
      </p>

      <div className="relative h-6">
        {/* trilho de fundo */}
        <div className="absolute left-0 right-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#E8E6E1]" />
        {/* preenchimento laranja */}
        <div
          className="absolute left-0 top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#FF6B35] transition-all duration-150"
          style={{ width: `${pct}%` }}
        />
        {/* range nativo invisível por cima — arrastável */}
        <input
          type="range"
          min={1}
          max={max}
          value={Math.min(q, max)}
          onChange={onSlider}
          aria-label="Ajustar quantidade pelo slider"
          className="absolute left-0 right-0 top-0 h-full w-full cursor-pointer appearance-none bg-transparent focus:outline-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#FF6B35] [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(255,107,53,0.5)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#FF6B35] [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(255,107,53,0.5)]"
        />
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-[#9B9A95]">
        {marcas.map((m, i) => (
          <button
            key={m.label}
            type="button"
            onClick={() => setQuantidade(m.q)}
            className={`cursor-pointer transition hover:text-[#FF6B35] ${
              i === faixaAtivaIdx ? "font-semibold text-[#FF6B35]" : ""
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
