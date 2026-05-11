// Constantes, produtos, mapas de imagens e labels

import type { Produto, Cor } from './types';

// ========= PRODUTOS =========
export const PRODUTOS: Produto[] = [
  {
    id: 'malha-pv',
    nome: 'Camiseta Malha PV',
    basePrice: 22.90,
    permiteMangaLonga: true,
    tipoProduto: 'camiseta',
    sublimacaoTotal: false,
    descricao: 'Malha leve, resistente e de boa durabilidade.',
    badge: 'Econômica',
  },
  {
    id: 'dry-fit-elastano',
    nome: 'Camiseta Dry-Fit c/ Elastano',
    basePrice: 24.90,
    permiteMangaLonga: true,
    tipoProduto: 'camiseta',
    sublimacaoTotal: false,
    descricao: 'Leve, elástico e com ótimo caimento.',
    badge: 'Esportiva',
  },
  {
    id: 'dryfit-sublimacao-total',
    nome: 'Camiseta Dryfit Sublimação total',
    basePrice: 24.90,
    permiteMangaLonga: true,
    tipoProduto: 'camiseta',
    sublimacaoTotal: true,
    descricao: 'Peça toda personalizada igual camisa de futebol e abadá.',
    badge: 'Sublimação total',
  },
  {
    id: 'algodao-30-1',
    nome: 'Camiseta Algodão 30.1',
    basePrice: 26.90,
    permiteMangaLonga: false,
    tipoProduto: 'camiseta',
    sublimacaoTotal: false,
    descricao: 'Algodão macio, ótimo para uso diário.',
    badge: 'Mais pedido',
  },
  {
    id: 'egipcio-elastano',
    nome: 'Camiseta Egípcio c/ Elastano',
    basePrice: 42.90,
    permiteMangaLonga: false,
    tipoProduto: 'camiseta',
    sublimacaoTotal: false,
    descricao: 'Fibra nobre, alta durabilidade e conforto premium.',
    badge: 'Premium',
  },
  {
    id: 'polo-piquet',
    nome: 'Polo Piquet',
    basePrice: 42.90,
    permiteMangaLonga: false,
    tipoProduto: 'camiseta',
    sublimacaoTotal: false,
    descricao: 'Elegância e conforto para ambientes corporativos.',
    badge: 'Corporativo',
  },
  {
    id: 'calca-brim',
    nome: 'Calça Brim',
    basePrice: 54.90,
    permiteMangaLonga: false,
    tipoProduto: 'calca-brim',
    sublimacaoTotal: false,
    descricao: 'Resistente e durável, ideal para trabalhos manuais.',
    badge: 'Resistente',
  },
  {
    id: 'calca-jeans',
    nome: 'Calça Jeans',
    basePrice: 59.90,
    permiteMangaLonga: false,
    tipoProduto: 'calca-jeans',
    sublimacaoTotal: false,
    descricao: 'Clássica com elastano para maior conforto e mobilidade.',
    badge: 'Clássica',
  },
];

// ========= CORES DISPONÍVEIS =========
export const CORES: Record<string, Cor> = {
  'preto':        { id: 'preto',        nome: 'Preto',         hex: '#000000' },
  'branco':       { id: 'branco',       nome: 'Branco',        hex: '#FFFFFF' },
  'azul-marinho': { id: 'azul-marinho', nome: 'Azul marinho',  hex: '#001F3F' },
  'azul-royal':   { id: 'azul-royal',   nome: 'Azul royal',    hex: '#4169E1' },
  'cinza-chumbo': { id: 'cinza-chumbo', nome: 'Cinza chumbo',  hex: '#403f3d' },
  'indigo-blue':  { id: 'indigo-blue',  nome: 'Indigo Blue',   hex: '#051963' },
};

// ========= CORES PERMITIDAS POR PRODUTO =========
export const CORES_POR_PRODUTO: Record<string, string[]> = {
  'malha-pv':                  ['preto', 'branco', 'azul-marinho', 'azul-royal', 'cinza-chumbo', 'especial'],
  'algodao-30-1':              ['preto', 'branco', 'azul-marinho', 'cinza-chumbo', 'especial'],
  'dry-fit-elastano':          ['preto', 'branco', 'azul-marinho', 'especial'],
  'egipcio-elastano':          ['preto', 'branco', 'azul-marinho', 'especial'],
  'polo-piquet':               ['preto', 'branco', 'azul-marinho', 'cinza-chumbo', 'especial'],
  'calca-brim':                ['preto', 'azul-royal', 'cinza-chumbo', 'especial'],
  'calca-jeans':               ['indigo-blue'],
  'dryfit-sublimacao-total':   [],
};

// ========= LABELS =========
export const LOCALS_MAP: Record<string, string> = {
  'frente': 'Frente',
  'costas': 'Costas',
  'manga-esquerda': 'Manga esquerda',
  'manga-direita': 'Manga direita',
};

export const SUB_LOCAL_MAP: Record<string, string> = {
  'frente:esquerdo': 'Frente - lado esquerdo',
  'frente:centro':   'Frente - centro',
  'frente:direito':  'Frente - lado direito',
  'frente:inferior': 'Frente - parte inferior',
  'costas:topo':   'Costas - topo',
  'costas:centro': 'Costas - centro',
  'costas:barra':  'Costas - barra',
  'manga-esquerda:padrao': 'Manga esquerda (posição padrão)',
  'manga-direita:padrao':  'Manga direita (posição padrão)',
};

export const SIZES_MAP: Record<string, string> = {
  '2x10':  '2 × 10 cm',
  '8x6':   '8 × 6 cm',
  '10x15': '10 × 15 cm',
  '29x21': '29 × 21 cm',
};

// ========= IMAGENS DE MOCKUP =========
export const MOCK_BASE_BY_COLOR: Record<string, string> = {
  'preto':        'https://www.nortsports.com.br/wp-content/uploads/2025/11/teste-preto.png',
  'azul-marinho': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/azul-marinho.png',
  'cinza-chumbo': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/cinza.png',
  'branco':       'https://www.nortsports.com.br/wp-content/uploads/2025/11/branco.png',
  'azul-royal':   'https://www.nortsports.com.br/wp-content/uploads/2025/11/azul-royal.png',
  'indigo-blue':  'https://www.meridianpro.com.br/wp-content/uploads/2026/01/brim2.png',
  'especial':     'https://www.meridianpro.com.br/wp-content/uploads/2026/01/cor-especial2.png',
};

export const MOCK_BASE_CALCA_BRIM = 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/brim2.png';
export const MOCK_BASE_CALCA_JEANS = 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/jeans.png';

const BASE_2X10: Record<string, string> = {
  'frente:esquerdo:2x10': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/peito-esq2x6.png',
  'frente:centro:2x10':   'https://www.nortsports.com.br/wp-content/uploads/2025/11/peito-cen2x6.png',
  'frente:direito:2x10':  'https://www.nortsports.com.br/wp-content/uploads/2025/11/peito-dir2x6.png',
  'frente:inferior:2x10': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/peito-inf2x6.png',
  'costas:topo:2x10':   'https://www.nortsports.com.br/wp-content/uploads/2025/11/costas-sup2x6.png',
  'costas:centro:2x10': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/costas-cen2x6.png',
  'costas:barra:2x10':  'https://www.nortsports.com.br/wp-content/uploads/2025/11/costas-inf2x6.png',
  'manga-esquerda:padrao:2x10': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/manga-esq2x6.png',
  'manga-direita:padrao:2x10':  'https://www.nortsports.com.br/wp-content/uploads/2025/11/manga-dir2x6.png',
};

export const MOCK_STAMP_MAP: Record<string, string> = {
  ...BASE_2X10,
  'frente:esquerdo:8x6': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/ESQUERDA8X6.png',
  'frente:centro:8x6':   'https://www.meridianpro.com.br/wp-content/uploads/2026/01/centro8x6.png',
  'frente:direito:8x6':  'https://www.meridianpro.com.br/wp-content/uploads/2026/01/DIREITA8X6.png',
  'frente:inferior:8x6': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/inferior8x6.png',
  'frente:centro:10x15': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/frente10x15.png',
  'frente:centro:29x21': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/frente29x21.png',
  'costas:topo:8x6':   'https://www.meridianpro.com.br/wp-content/uploads/2026/01/TOPO8X6.png',
  'costas:centro:8x6': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/CENTRO8X6-1.png',
  'costas:barra:8x6':  'https://www.meridianpro.com.br/wp-content/uploads/2026/01/BARRA8X6.png',
  'costas:topo:10x15':   'https://www.meridianpro.com.br/wp-content/uploads/2026/01/topo10x15.png',
  'costas:centro:10x15': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/centro10x15.png',
  'costas:barra:10x15':  'https://www.meridianpro.com.br/wp-content/uploads/2026/01/barra10x15.png',
  'costas:topo:29x21':   'https://www.meridianpro.com.br/wp-content/uploads/2026/01/topo29x21.png',
  'costas:centro:29x21': 'https://www.meridianpro.com.br/wp-content/uploads/2026/01/centro29x21.png',
  'costas:barra:29x21':  'https://www.meridianpro.com.br/wp-content/uploads/2026/01/barra29x21.png',
  'manga-esquerda:padrao:8x6': 'https://www.nortsports.com.br/wp-content/uploads/2025/11/manga-esq8x6.png',
  'manga-direita:padrao:8x6':  'https://www.nortsports.com.br/wp-content/uploads/2025/11/manga-dir8x6.png',
};

// ========= PRODUTOS QUE PERMITEM BORDADO =========
export const PRODUTOS_COM_BORDADO = ['malha-pv', 'polo-piquet', 'algodao-30-1', 'egipcio-elastano'];

// ========= WHATSAPP =========
export const WHATSAPP_NUMERO = '5531984316140';
