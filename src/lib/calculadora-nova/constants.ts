// Constantes da calculadora nova
// Fonte: logica-calculadora-precos.md (seções 1, 2, 4)

import type { Cor, CorId, Produto, ProdutoId, TamanhoEstampa } from "./types";

export const PRODUTOS: Produto[] = [
  {
    id: "malha-pv",
    nome: "Camiseta Malha PV",
    precoBase: 22.9,
    tipo: "camiseta",
    permiteManga: true,
    permiteBordado: true,
    sublimacaoTotal: false,
    destaque: true,
    tag: { texto: "mais vendido", cor: "laranja" },
  },
  {
    id: "algodao-30-1",
    nome: "Camiseta Algodão 30.1",
    precoBase: 26.9,
    tipo: "camiseta",
    permiteManga: false,
    permiteBordado: true,
    sublimacaoTotal: false,
    destaque: true,
    tag: { texto: "favorito", cor: "laranja" },
  },
  {
    id: "dry-fit-elastano",
    nome: "Camiseta Dry-Fit c/ Elastano",
    precoBase: 24.9,
    tipo: "camiseta",
    permiteManga: true,
    permiteBordado: false,
    sublimacaoTotal: false,
  },
  {
    id: "dryfit-sublimacao-total",
    nome: "Camiseta Dryfit Sublimação Total",
    precoBase: 24.9,
    tipo: "camiseta",
    permiteManga: true,
    permiteBordado: false,
    sublimacaoTotal: true,
    tag: { texto: "sublimação", cor: "navy" },
  },
  {
    id: "egipcio-elastano",
    nome: "Camiseta Egípcio c/ Elastano",
    precoBase: 42.9,
    tipo: "camiseta",
    permiteManga: false,
    permiteBordado: true,
    sublimacaoTotal: false,
  },
  {
    id: "polo-piquet",
    nome: "Polo Piquet",
    precoBase: 42.9,
    tipo: "camiseta",
    permiteManga: false,
    permiteBordado: true,
    sublimacaoTotal: false,
  },
  {
    id: "calca-brim",
    nome: "Calça Brim",
    precoBase: 54.9,
    tipo: "calca",
    permiteManga: false,
    permiteBordado: false,
    sublimacaoTotal: false,
  },
  {
    id: "calca-jeans",
    nome: "Calça Jeans",
    precoBase: 59.9,
    tipo: "calca",
    permiteManga: false,
    permiteBordado: false,
    sublimacaoTotal: false,
  },
];

export const CORES: Record<CorId, Cor> = {
  preto: { id: "preto", nome: "Preto", hex: "#000000" },
  branco: { id: "branco", nome: "Branco", hex: "#FFFFFF" },
  "azul-marinho": { id: "azul-marinho", nome: "Azul marinho", hex: "#001F3F" },
  "azul-royal": { id: "azul-royal", nome: "Azul royal", hex: "#4169E1" },
  "cinza-chumbo": { id: "cinza-chumbo", nome: "Cinza chumbo", hex: "#403F3D" },
  "indigo-blue": { id: "indigo-blue", nome: "Indigo Blue", hex: "#051963" },
  especial: {
    id: "especial",
    nome: "Cor especial",
    hex: "#FF6B35",
    gradiente: true,
  },
};

// Cores permitidas por produto
export const CORES_POR_PRODUTO: Record<ProdutoId, CorId[]> = {
  "malha-pv": [
    "preto",
    "branco",
    "azul-marinho",
    "azul-royal",
    "cinza-chumbo",
    "especial",
  ],
  "algodao-30-1": [
    "preto",
    "branco",
    "azul-marinho",
    "cinza-chumbo",
    "especial",
  ],
  "dry-fit-elastano": ["preto", "branco", "azul-marinho", "especial"],
  "egipcio-elastano": ["preto", "branco", "azul-marinho", "especial"],
  "polo-piquet": ["preto", "branco", "azul-marinho", "cinza-chumbo", "especial"],
  "calca-brim": ["preto", "azul-royal", "cinza-chumbo", "especial"],
  "calca-jeans": ["indigo-blue"],
  "dryfit-sublimacao-total": [], // sem etapa de cor
};

// Cor de destaque
export const CORES_TEMA = {
  laranja: "#FF6B35",
  navy: "#001F3F",
  offwhite: "#F5F3EF",
  cinzaClaro: "#E8E6E1",
  cinzaMedio: "#9B9A95",
  pretoSuave: "#1A1A1A",
} as const;

// Helpers
export function getProduto(id: ProdutoId): Produto {
  const p = PRODUTOS.find((x) => x.id === id);
  if (!p) throw new Error(`Produto não encontrado: ${id}`);
  return p;
}

export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export const TAMANHOS_LABEL: Record<TamanhoEstampa, string> = {
  "2x10": "2×10",
  "8x6": "8×6",
  "10x15": "10×15",
  "29x21": "29×21",
};
