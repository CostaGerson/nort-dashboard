"use client";

import { useRef, useState } from "react";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { getProduto } from "@/lib/calculadora-nova/constants";
import {
  POSICOES,
  posicaoDisponivelNaTecnica,
  labelPosicao,
} from "@/lib/calculadora-nova/posicoes";
import { TAMANHOS_LABEL } from "@/lib/calculadora-nova/constants";
import type {
  LocalEstampa,
  SubLocalEstampa,
} from "@/lib/calculadora-nova/types";
import SilhuetaPeca from "./SilhuetaPeca";
import RadialTamanhos from "./RadialTamanhos";

// fundo do palco por cor — sempre contrastando com a peça
const STAGE_BG: Record<string, string> = {
  preto: "#E8C9A0",
  branco: "#14242E",
  "azul-marinho": "#B5743F",
  "azul-royal": "#2A2418",
  "cinza-chumbo": "#3E6E7B",
  "indigo-blue": "#3A2E18",
  especial: "#241B33",
};
const STAGE_DEFAULT = "#1E2A38";

// posições do "+" em % do container quadrado da peça
const POS_FRENTE: Record<string, { x: number; y: number }> = {
  "frente:esquerdo": { x: 38, y: 40 },
  "frente:centro": { x: 50, y: 55 },
  "frente:direito": { x: 62, y: 40 },
  "frente:inferior": { x: 50, y: 76 },
  "manga-esquerda:padrao": { x: 17, y: 42 },
  "manga-direita:padrao": { x: 83, y: 42 },
};
const POS_COSTAS: Record<string, { x: number; y: number }> = {
  "costas:topo": { x: 50, y: 32 },
  "costas:centro": { x: 50, y: 55 },
  "costas:barra": { x: 50, y: 78 },
  "manga-esquerda:padrao": { x: 17, y: 42 },
  "manga-direita:padrao": { x: 83, y: 42 },
};

interface RadialState {
  local: LocalEstampa;
  subLocal: SubLocalEstampa;
  origemX: number;
  origemY: number;
}

export default function PalcoPeca() {
  const { state, addEstampa } = useWizard();
  const [radial, setRadial] = useState<RadialState | null>(null);
  if (!state.produtoId) return null;

  const produto = getProduto(state.produtoId);
  const ehSubli = produto.id === "dryfit-sublimacao-total";
  const ehCalca = produto.tipo === "calca";

  const bg =
    (state.corId && STAGE_BG[state.corId]) ?? STAGE_DEFAULT;

  return (
    <div
      className="relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-[22px]"
      style={{ background: bg, transition: "background 700ms cubic-bezier(0.4,0,0.2,1)" }}
    >
      <style jsx>{`
        @keyframes nortPlusPulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.5),
              0 2px 10px rgba(255, 107, 53, 0.4);
          }
          50% {
            transform: scale(1.18);
            box-shadow: 0 0 0 11px rgba(255, 107, 53, 0),
              0 2px 14px rgba(255, 107, 53, 0.55);
          }
        }
        .nort-plus-pulse {
          animation: nortPlusPulse 1.6s ease-in-out infinite;
          background: rgba(255, 107, 53, 0.9) !important;
        }
      `}</style>
      {/* holofote */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 36%, rgba(255,255,255,0.17), rgba(255,255,255,0) 58%)",
        }}
      />
      {/* scrim inferior pra legibilidade */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.30))",
        }}
      />

      {/* passo */}
      <div className="relative z-10 flex items-center gap-2 p-4">
        <span className="flex gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-white/40" />
          <span className="h-1.5 w-6 rounded-full bg-[#FF6B35]" />
          <span className="h-1.5 w-6 rounded-full bg-white/20" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
          Passo 2 · Personalize
        </span>
      </div>

      {/* peças */}
      <div className="relative z-[1] flex flex-1 items-center justify-center gap-4 px-4 md:gap-8">
        {ehCalca ? (
          <Vista vista="frente" comMais={false} onAbrirRadial={setRadial} />
        ) : (
          <>
            <Vista vista="frente" comMais={!ehSubli} onAbrirRadial={setRadial} />
            <Vista vista="costas" comMais={!ehSubli} onAbrirRadial={setRadial} />
          </>
        )}
      </div>

      {/* rodapé do palco */}
      <div className="relative z-10 flex items-end justify-between gap-3 p-4">
        <div className="text-white">
          <div className="font-display text-[17px] font-bold leading-tight">
            {produto.nome}
          </div>
          <div className="text-[11px] text-white/70">
            {ehSubli
              ? "Peça inteira personalizada — arte enviada depois"
              : ehCalca
              ? "Personalização no bolso (no painel ao lado)"
              : "Toque num + pra adicionar estampa"}
          </div>
        </div>
      </div>

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
    </div>
  );
}

function Vista({
  vista,
  comMais,
  onAbrirRadial,
}: {
  vista: "frente" | "costas";
  comMais: boolean;
  onAbrirRadial: (r: RadialState) => void;
}) {
  const { state, removeEstampa, getEstampa } = useWizard();
  const ref = useRef<HTMLDivElement>(null);
  if (!state.produtoId) return null;

  const mapaPos = vista === "frente" ? POS_FRENTE : POS_COSTAS;
  const posicoesDestaVista = POSICOES.filter((p) => {
    if (p.local === "frente") return vista === "frente";
    if (p.local === "costas") return vista === "costas";
    return true; // mangas nas duas
  });

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        className="relative aspect-square"
        style={{ width: "clamp(260px, 23vw, 470px)" }}
      >
        <SilhuetaPeca
          produtoId={state.produtoId}
          corId={state.corId}
          vista={vista}
        />

        {comMais &&
          posicoesDestaVista.map((p) => {
            if (!posicaoDisponivelNaTecnica(p, state.tecnica)) return null;
            const key = `${p.local}:${p.subLocal}`;
            const coord = mapaPos[key];
            if (!coord) return null;

            const estampa = getEstampa(p.local, p.subLocal);
            const ocupado = !!estampa;
            const devePulsar =
              !ocupado &&
              p.local === "frente" &&
              p.subLocal === "esquerdo" &&
              state.estampas.length === 0;

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
                    const rect = e.currentTarget.getBoundingClientRect();
                    onAbrirRadial({
                      local: p.local,
                      subLocal: p.subLocal,
                      origemX: rect.left + rect.width / 2,
                      origemY: rect.top + rect.height / 2,
                    });
                  }
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                {ocupado ? (
                  <span
                    className="grid min-h-[30px] min-w-[30px] place-items-center rounded-full px-1.5 text-[10px] font-bold text-white"
                    style={{
                      background: "#FF6B35",
                      boxShadow: "0 2px 10px rgba(255,107,53,0.55)",
                    }}
                  >
                    {TAMANHOS_LABEL[estampa!.tamanho]}
                  </span>
                ) : (
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-[16px] font-bold leading-none text-white ${
                      devePulsar ? "nort-plus-pulse" : ""
                    }`}
                    style={{
                      background: "rgba(255,107,53,0.5)",
                      boxShadow: "0 0 0 4px rgba(255,107,53,0.14)",
                    }}
                  >
                    +
                  </span>
                )}
              </button>
            );
          })}
      </div>
      <span className="mt-1 rounded-md bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
        {vista}
      </span>
    </div>
  );
}
