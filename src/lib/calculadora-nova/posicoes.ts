// Regras de posição/tamanho por técnica
// Fonte: logica-calculadora-precos.md seção 6

import type {
  LocalEstampa,
  SubLocalEstampa,
  TamanhoEstampa,
  Tecnica,
} from "./types";

export interface Posicao {
  local: LocalEstampa;
  subLocal: SubLocalEstampa;
  label: string;
  tamanhosDtf: TamanhoEstampa[];
  tamanhosBordado: TamanhoEstampa[];
}

export const POSICOES: Posicao[] = [
  {
    local: "frente",
    subLocal: "esquerdo",
    label: "Frente esquerdo",
    tamanhosDtf: ["2x10", "8x6"],
    tamanhosBordado: ["2x10", "8x6"],
  },
  {
    local: "frente",
    subLocal: "centro",
    label: "Frente centro",
    tamanhosDtf: ["2x10", "8x6", "10x15", "29x21"],
    tamanhosBordado: [],
  },
  {
    local: "frente",
    subLocal: "direito",
    label: "Frente direito",
    tamanhosDtf: ["2x10", "8x6"],
    tamanhosBordado: ["2x10", "8x6"],
  },
  {
    local: "frente",
    subLocal: "inferior",
    label: "Frente inferior",
    tamanhosDtf: ["2x10", "8x6"],
    tamanhosBordado: [],
  },
  {
    local: "costas",
    subLocal: "topo",
    label: "Costas topo",
    tamanhosDtf: ["2x10", "8x6", "10x15", "29x21"],
    tamanhosBordado: ["2x10", "8x6", "10x15"],
  },
  {
    local: "costas",
    subLocal: "centro",
    label: "Costas centro",
    tamanhosDtf: ["2x10", "8x6", "10x15", "29x21"],
    tamanhosBordado: [],
  },
  {
    local: "costas",
    subLocal: "barra",
    label: "Costas barra",
    tamanhosDtf: ["2x10", "8x6", "10x15", "29x21"],
    tamanhosBordado: [],
  },
  {
    local: "manga-esquerda",
    subLocal: "padrao",
    label: "Manga esquerda",
    tamanhosDtf: ["2x10", "8x6"],
    tamanhosBordado: [],
  },
  {
    local: "manga-direita",
    subLocal: "padrao",
    label: "Manga direita",
    tamanhosDtf: ["2x10", "8x6"],
    tamanhosBordado: [],
  },
];

export function getPosicao(
  local: LocalEstampa,
  subLocal: SubLocalEstampa,
): Posicao | undefined {
  return POSICOES.find((p) => p.local === local && p.subLocal === subLocal);
}

export function tamanhosPermitidos(
  pos: Posicao,
  tecnica: Tecnica,
): TamanhoEstampa[] {
  return tecnica === "dtf" ? pos.tamanhosDtf : pos.tamanhosBordado;
}

export function posicaoDisponivelNaTecnica(
  pos: Posicao,
  tecnica: Tecnica,
): boolean {
  return tamanhosPermitidos(pos, tecnica).length > 0;
}

export function labelPosicao(
  local: LocalEstampa,
  subLocal: SubLocalEstampa,
): string {
  const p = getPosicao(local, subLocal);
  return p?.label ?? `${local} ${subLocal}`;
}
