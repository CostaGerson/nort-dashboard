// Configuração do Mockup Studio v2.
// Cada peça agora usa SOMBRA + MÁSCARA (a cor entra por hard-light no canvas).
// Uma peça serve pra infinitas cores — não há mais um JPG por cor.

export type PecaKey = 'camiseta' | 'polo' | 'manga-longa';

export interface PecaInfo {
  key: PecaKey;
  nome: string;
  sombra: string;
  mascara: string;
}

export const PECAS: PecaInfo[] = [
  {
    key: 'camiseta',
    nome: 'Camiseta',
    sombra: '/mockup/pecas/camiseta/sombra.png',
    mascara: '/mockup/pecas/camiseta/mascara.png',
  },
  {
    key: 'polo',
    nome: 'Polo',
    sombra: '/mockup/pecas/polo/sombra.png',
    mascara: '/mockup/pecas/polo/mascara.png',
  },
  {
    key: 'manga-longa',
    nome: 'Manga Longa',
    sombra: '/mockup/pecas/manga-longa/sombra.png',
    mascara: '/mockup/pecas/manga-longa/mascara.png',
  },
];

export interface CorInfo {
  key: string;
  hex: string;
  nome: string;
}

// 5 cores fixas como atalho (além do picker livre)
export const CORES: CorInfo[] = [
  { key: 'branco', hex: '#FEFEFE', nome: 'Branco' },
  { key: 'preto', hex: '#1C1C1E', nome: 'Preto' },
  { key: 'cinza-chumbo', hex: '#403F3D', nome: 'Cinza chumbo' },
  { key: 'azul-royal', hex: '#2547D6', nome: 'Azul royal' },
  { key: 'azul-marinho', hex: '#001F3F', nome: 'Azul marinho' },
];

export const COR_PADRAO = '#2547D6';

export type CotaKey = 'cota-peito' | 'cota-costas' | 'cota-manga';

export const COTAS: Record<CotaKey, string> = {
  'cota-peito': '/mockup/cotas/cota-peito.svg',
  'cota-costas': '/mockup/cotas/cota-costas.svg',
  'cota-manga': '/mockup/cotas/cota-manga.svg',
};

// Overlays fixos do mockup
export const BACKGROUND_SRC = '/mockup/overlay/background.png';
export const MARCA_SRC = '/mockup/overlay/marca.png';
export const MARCA_OPACIDADE = 0.1; // 10% — ponto definido no teste

export function getPeca(key: PecaKey): PecaInfo {
  return PECAS.find((p) => p.key === key) ?? PECAS[0];
}
