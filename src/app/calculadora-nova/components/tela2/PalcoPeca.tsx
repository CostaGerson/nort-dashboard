"use client";

import { useRef, useState } from "react";
import { useWizard } from "@/lib/calculadora-nova/wizard-context";
import { getProduto, CORES, TAMANHOS_LABEL } from "@/lib/calculadora-nova/constants";
import {
  POSICOES,
  posicaoDisponivelNaTecnica,
  labelPosicao,
} from "@/lib/calculadora-nova/posicoes";
import type {
  LocalEstampa,
  SubLocalEstampa,
  ProdutoId,
  CorId,
  MangaTipo,
  TamanhoEstampa,
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

// posições do "+" em % do quadro 4:5 da peça (calibradas nas imagens reais)
const POS_FRENTE: Record<string, { x: number; y: number }> = {
  "frente:esquerdo": { x: 36, y: 32 },
  "frente:centro": { x: 50, y: 42 },
  "frente:direito": { x: 64, y: 32 },
  "frente:inferior": { x: 50, y: 60 },
  "manga-esquerda:padrao": { x: 11, y: 30 },
  "manga-direita:padrao": { x: 89, y: 30 },
};
const POS_COSTAS: Record<string, { x: number; y: number }> = {
  "costas:topo": { x: 50, y: 24 },
  "costas:centro": { x: 50, y: 46 },
  "costas:barra": { x: 50, y: 68 },
  "manga-esquerda:padrao": { x: 11, y: 31 },
  "manga-direita:padrao": { x: 89, y: 31 },
};

// produto -> peça do mockup (null = calça, usa silhueta SVG)
type PecaMockupKey = "camiseta" | "polo" | "manga-longa";
function mockupPecaKey(
  produtoId: ProdutoId,
  manga: MangaTipo
): PecaMockupKey | null {
  if (produtoId === "calca-brim" || produtoId === "calca-jeans") return null;
  if (produtoId === "polo-piquet") return "polo";
  return manga === "longa" ? "manga-longa" : "camiseta";
}

function corHexDaPeca(corId: CorId | null): string {
  if (!corId) return "#D4D2CC"; // sublimação (sem cor)
  if (corId === "especial") return "#C9C7C2"; // cor a definir — neutro
  return CORES[corId].hex;
}

// estampa "aceso" vira um retângulo proporcional à medida (em cm) e verde.
// regra: a maior medida fica na horizontal (largura), a menor na vertical.
const PX_POR_CM = 4.5; // escala visual da estampa na peça
function retanguloEstampa(tamanho: TamanhoEstampa) {
  const [a, b] = tamanho.split("x").map(Number);
  const maior = Math.max(a, b);
  const menor = Math.min(a, b);
  return {
    w: Math.round(maior * PX_POR_CM),
    h: Math.round(menor * PX_POR_CM),
    label: TAMANHOS_LABEL[tamanho],
  };
}

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

  const bg = (state.corId && STAGE_BG[state.corId]) ?? STAGE_DEFAULT;

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

      {/* peças — empilha no celular, lado a lado no desktop */}
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center gap-4 px-4 py-2 md:flex-row md:gap-8">
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

  const pecaKey = mockupPecaKey(state.produtoId, state.manga);
  const corHex = corHexDaPeca(state.corId);

  const mapaPos = vista === "frente" ? POS_FRENTE : POS_COSTAS;
  const posicoesDestaVista = POSICOES.filter((p) => {
    if (p.local === "frente") return vista === "frente";
    if (p.local === "costas") return vista === "costas";
    return true; // mangas nas duas
  });

  return (
    <div className="flex w-full max-w-[300px] flex-col items-center md:max-w-[440px] md:flex-1">
      <div ref={ref} className="relative aspect-[4/5] w-full">
        {pecaKey ? (
          <PecaImagemMockup pecaKey={pecaKey} vista={vista} corHex={corHex} />
        ) : (
          <SilhuetaPeca
            produtoId={state.produtoId}
            corId={state.corId}
            vista={vista}
          />
        )}

        {comMais &&
          posicoesDestaVista.map((p) => {
            if (!posicaoDisponivelNaTecnica(p, state.tecnica)) return null;
            const key = `${p.local}:${p.subLocal}`;
            const coord = mapaPos[key];
            if (!coord) return null;

            const estampa = getEstampa(p.local, p.subLocal);
            const ocupado = !!estampa;
            const ret = estampa ? retanguloEstampa(estampa.tamanho) : null;
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
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                {ocupado && ret ? (
                  <span
                    className="relative grid place-items-center"
                    style={{ minWidth: 26, minHeight: 26 }}
                  >
                    <span
                      style={{
                        width: ret.w,
                        height: ret.h,
                        background: "#0da60d",
                        border: "1.5px solid rgba(255,255,255,0.92)",
                        borderRadius: 3,
                        boxShadow: "0 2px 10px rgba(13,166,13,0.5)",
                      }}
                    />
                    <span
                      className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                      style={{
                        top: `calc(50% + ${ret.h / 2 + 4}px)`,
                        background: "rgba(15,15,15,0.78)",
                      }}
                    >
                      {ret.label}
                    </span>
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

/* ---------- Peça real (mesma lógica do mockup: cor + máscara + sombra hard-light) ---------- */

function PecaImagemMockup({
  pecaKey,
  vista,
  corHex,
}: {
  pecaKey: PecaMockupKey;
  vista: "frente" | "costas";
  corHex: string;
}) {
  const base = `/calculadora-nova/pecas/${pecaKey}/${vista}`;
  return (
    <div className="absolute inset-0" style={{ isolation: "isolate" }}>
      {/* camada de cor recortada pela máscara */}
      <div
        className="absolute inset-0"
        style={{
          background: corHex,
          WebkitMaskImage: `url(${base}-mascara.png)`,
          maskImage: `url(${base}-mascara.png)`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          transition: "background 500ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      {/* sombra/vincos em hard-light por cima */}
      <img
        src={`${base}-sombra.png`}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 block h-full w-full"
        style={{ objectFit: "fill", mixBlendMode: "hard-light" }}
      />
    </div>
  );
}
