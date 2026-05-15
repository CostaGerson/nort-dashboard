// Configuração estática do Mockup Studio.
// As cores aqui são as 5 atuais. Pra adicionar novas, basta entrar nesta lista
// e colocar o JPG correspondente em /public/mockup/base/<peca>/<key>.jpg.

export type PecaKey = 'camiseta' | 'polo' | 'manga-longa';

export interface PecaInfo {
  key: PecaKey;
  nome: string;
  provisorio: boolean; // se true, mostra aviso "imagem provisória"
}

export const PECAS: PecaInfo[] = [
  { key: 'camiseta', nome: 'Camiseta', provisorio: false },
  { key: 'polo', nome: 'Polo', provisorio: true },
  { key: 'manga-longa', nome: 'Manga Longa', provisorio: true },
];

export interface CorInfo {
  key: string;
  hex: string;
  nome: string;
}

export const CORES: CorInfo[] = [
  { key: 'branco', hex: '#fefefe', nome: 'Branco' },
  { key: 'preto', hex: '#1c1c1e', nome: 'Preto' },
  { key: 'cinza', hex: '#3a3a3a', nome: 'Cinza' },
  { key: 'azul-royal', hex: '#2547d6', nome: 'Azul Royal' },
  { key: 'azul-marinho', hex: '#0c2342', nome: 'Azul Marinho' },
];

export type CotaKey = 'cota-peito' | 'cota-costas' | 'cota-manga';

export const COTAS: Record<CotaKey, string> = {
  'cota-peito': '/mockup/cotas/cota-peito.svg',
  'cota-costas': '/mockup/cotas/cota-costas.svg',
  'cota-manga': '/mockup/cotas/cota-manga.svg',
};

export function getShirtSrc(peca: PecaKey, cor: string): string {
  return `/mockup/base/${peca}/${cor}.jpg`;
}
