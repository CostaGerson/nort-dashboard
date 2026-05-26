// Tipos da calculadora nova Nort Sports
// Fonte da regra: logica-calculadora-precos.md

export type ProdutoId =
  | "malha-pv"
  | "dry-fit-elastano"
  | "dryfit-sublimacao-total"
  | "algodao-30-1"
  | "egipcio-elastano"
  | "polo-piquet"
  | "calca-brim"
  | "calca-jeans";

export type TipoProduto = "camiseta" | "calca";

export type CorId =
  | "preto"
  | "branco"
  | "azul-marinho"
  | "azul-royal"
  | "cinza-chumbo"
  | "indigo-blue"
  | "especial";

export type MangaTipo = "curta" | "longa";

export type Tecnica = "dtf" | "bordado";

export type TamanhoEstampa = "2x10" | "8x6" | "10x15" | "29x21";

export type LocalEstampa = "frente" | "costas" | "manga-esquerda" | "manga-direita";

export type SubLocalEstampa =
  | "esquerdo"
  | "centro"
  | "direito"
  | "inferior"
  | "topo"
  | "barra"
  | "padrao";

export interface Produto {
  id: ProdutoId;
  nome: string;
  precoBase: number;
  tipo: TipoProduto;
  permiteManga: boolean; // manga longa avulsa
  permiteBordado: boolean;
  sublimacaoTotal: boolean;
  destaque?: boolean;
  tag?: { texto: string; cor: "laranja" | "navy" };
}

export interface Cor {
  id: CorId;
  nome: string;
  hex: string;
  // gradiente especial usa hex como fallback
  gradiente?: boolean;
}

export interface Estampa {
  id: string; // uuid local
  local: LocalEstampa;
  subLocal: SubLocalEstampa;
  tamanho: TamanhoEstampa;
}

export interface OrcamentoState {
  produtoId: ProdutoId | null;
  corId: CorId | null;
  manga: MangaTipo;
  tecnica: Tecnica;
  estampas: Estampa[];
  bolsoCalca: boolean; // só calça
  quantidade: number;
}

export interface ResultadoCalculo {
  precoPeca: number;
  total: number;
  valorCorEspecial: number;
  taxaProgramacao: number;
  precoBase: number;
  precoMangaLonga: number;
  precoPersonalizacao: number;
  precoSublimacao: number;
}
