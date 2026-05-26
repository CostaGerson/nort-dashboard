// Tabelas de preço — fonte: logica-calculadora-precos.md seção 4
// Todas em R$.

import type { MangaTipo, TamanhoEstampa } from "./types";

export type FaixaPadrao = "1-5" | "6-10" | "11-19" | "20+";
export type FaixaSublimacao = "1-5" | "6-10" | "11-20" | "21+";

// 4.1 DTF em camisetas (por peça)
export const PRECO_DTF: Record<TamanhoEstampa, Record<FaixaPadrao, number>> = {
  "2x10": { "1-5": 10, "6-10": 9, "11-19": 8, "20+": 7 },
  "8x6": { "1-5": 12, "6-10": 11, "11-19": 10, "20+": 9 },
  "10x15": { "1-5": 14, "6-10": 13, "11-19": 12, "20+": 11 },
  "29x21": { "1-5": 20, "6-10": 18, "11-19": 16, "20+": 14 },
};

// 4.2 Bordado em camisetas (por peça)
export const PRECO_BORDADO: Record<
  TamanhoEstampa,
  Record<FaixaPadrao, number>
> = {
  "2x10": { "1-5": 15, "6-10": 12, "11-19": 8, "20+": 6 },
  "8x6": { "1-5": 16, "6-10": 14, "11-19": 12, "20+": 8 },
  "10x15": { "1-5": 18, "6-10": 16, "11-19": 14, "20+": 10 },
  "29x21": { "1-5": 50, "6-10": 42, "11-19": 36, "20+": 25 }, // existe na tabela mas não é permitido em bordado (validar antes)
};

// 4.3 Bordado em calça (bolso) — por peça
export const PRECO_BORDADO_CALCA: Record<FaixaPadrao, number> = {
  "1-5": 16,
  "6-10": 14,
  "11-19": 12,
  "20+": 8,
};

// 4.4 Sublimação total — somado ao base, por peça
export const PRECO_SUBLIMACAO: Record<
  MangaTipo,
  Record<FaixaSublimacao, number>
> = {
  curta: { "1-5": 70, "6-10": 39, "11-20": 22, "21+": 18 },
  longa: { "1-5": 80, "6-10": 45, "11-20": 26, "21+": 22 },
};

// 5. Modificadores
export const MODIFICADORES = {
  mangaLongaAvulsa: 4.0,
  corEspecialPct: 0.15,
  taxaProgramacaoBordado: 20.0,
} as const;

// Faixas
export function faixaPadrao(qtd: number): FaixaPadrao {
  if (qtd <= 5) return "1-5";
  if (qtd <= 10) return "6-10";
  if (qtd <= 19) return "11-19";
  return "20+";
}

export function faixaSublimacao(qtd: number): FaixaSublimacao {
  if (qtd <= 5) return "1-5";
  if (qtd <= 10) return "6-10";
  if (qtd <= 20) return "11-20";
  return "21+";
}
