// Tipos da calculadora de orçamentos

export type TipoProduto = 'camiseta' | 'calca-brim' | 'calca-jeans';

export type Tecnica = 'dtf' | 'bordado';

export type SizeId = '2x10' | '8x6' | '10x15' | '29x21';

export type LocalId = 'frente' | 'costas' | 'manga-esquerda' | 'manga-direita';

export type SubLocalId =
  | 'esquerdo' | 'centro' | 'direito' | 'inferior' // frente
  | 'topo' | 'barra' // costas (e centro já listado)
  | 'padrao'; // mangas

export interface Produto {
  id: string;
  nome: string;
  basePrice: number;
  permiteMangaLonga: boolean;
  tipoProduto: TipoProduto;
  sublimacaoTotal: boolean;
  descricao: string;
  badge: string;
}

export interface Cor {
  id: string;
  nome: string;
  hex: string;
}

export interface Personalizacao {
  id: number;
  localId: LocalId | 'bolso';
  subLocalId: SubLocalId;
  sizeId: SizeId | 'unico';
  tecnica: Tecnica;
}

export interface CalculoResultado {
  precoPorPeca: number;
  totalGeral: number;
  valorCorEspecial: number;
  taxaProgramacao: number;
}

export interface State {
  malhaSelecionada: Produto | null;
  mangaLonga: boolean;
  corSelecionada: Cor | null;
  corEspecial: boolean;
  tecnicaAtual: Tecnica;
  localAtual: LocalId | null;
  subLocalAtual: SubLocalId | null;
  tamanhoAtual: SizeId | null;
  personalizacaoBolsoCalca: boolean;
  personalizacoes: Personalizacao[];
  nextPersonalizacaoId: number;
  quantidade: number;
}
