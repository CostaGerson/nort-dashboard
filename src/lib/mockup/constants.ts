// Configuração do Mockup Studio v2.1.
// Cada peça usa SOMBRA + MÁSCARA (a cor entra por hard-light no canvas).

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
  { key: 'azul-marinho', hex: '#001D61', nome: 'Azul marinho' },
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
export const MARCA_OPACIDADE_PADRAO = 0.1; // valor inicial; ajustavel por slider

// Fontes do Google (esportivas / limpas) pro texto na peca.
export interface FonteInfo {
  key: string;
  nome: string;
  family: string;
  googleName: string;
  weight: number;
}

export const FONTES: FonteInfo[] = [
  { key: 'inter', nome: 'Inter', family: 'Inter', googleName: 'Inter:wght@600', weight: 600 },
  { key: 'oswald', nome: 'Oswald', family: 'Oswald', googleName: 'Oswald:wght@600', weight: 600 },
  { key: 'bebas', nome: 'Bebas Neue', family: 'Bebas Neue', googleName: 'Bebas+Neue', weight: 400 },
  { key: 'teko', nome: 'Teko', family: 'Teko', googleName: 'Teko:wght@600', weight: 600 },
  { key: 'anton', nome: 'Anton', family: 'Anton', googleName: 'Anton', weight: 400 },
  { key: 'montserrat', nome: 'Montserrat', family: 'Montserrat', googleName: 'Montserrat:wght@700', weight: 700 },
  { key: 'archivo', nome: 'Archivo', family: 'Archivo', googleName: 'Archivo:wght@700', weight: 700 },
  { key: 'rajdhani', nome: 'Rajdhani', family: 'Rajdhani', googleName: 'Rajdhani:wght@600', weight: 600 },
];

export const FONTE_PADRAO = 'inter';

export function getPeca(key: PecaKey): PecaInfo {
  return PECAS.find((p) => p.key === key) ?? PECAS[0];
}

export function getFonte(key: string): FonteInfo {
  return FONTES.find((f) => f.key === key) ?? FONTES[0];
}
