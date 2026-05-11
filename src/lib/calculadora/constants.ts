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

// ========= IMAGENS DE MOCKUP (caminhos locais em /public) =========
export const MOCK_BASE_BY_COLOR: Record<string, string> = {
  'preto':        '/calculadora/base/preto.png',
  'azul-marinho': '/calculadora/base/azul-marinho.png',
  'cinza-chumbo': '/calculadora/base/cinza-chumbo.png',
  'branco':       '/calculadora/base/branco.png',
  'azul-royal':   '/calculadora/base/azul-royal.png',
  'indigo-blue':  '/calculadora/base/calca-jeans.png',
  'especial':     '/calculadora/base/cor-especial.png',
};

export const MOCK_BASE_CALCA_BRIM = '/calculadora/base/calca-brim.png';
export const MOCK_BASE_CALCA_JEANS = '/calculadora/base/calca-jeans.png';

export const MOCK_STAMP_MAP: Record<string, string> = {
  // 2x10 - frente
  'frente:esquerdo:2x10': '/calculadora/stamps/frente-esquerdo-2x10.png',
  'frente:centro:2x10':   '/calculadora/stamps/frente-centro-2x10.png',
  'frente:direito:2x10':  '/calculadora/stamps/frente-direito-2x10.png',
  'frente:inferior:2x10': '/calculadora/stamps/frente-inferior-2x10.png',
  // 2x10 - costas
  'costas:topo:2x10':   '/calculadora/stamps/costas-topo-2x10.png',
  'costas:centro:2x10': '/calculadora/stamps/costas-centro-2x10.png',
  'costas:barra:2x10':  '/calculadora/stamps/costas-barra-2x10.png',
  // 2x10 - mangas
  'manga-esquerda:padrao:2x10': '/calculadora/stamps/manga-esquerda-padrao-2x10.png',
  'manga-direita:padrao:2x10':  '/calculadora/stamps/manga-direita-padrao-2x10.png',

  // 8x6 - frente
  'frente:esquerdo:8x6': '/calculadora/stamps/frente-esquerdo-8x6.png',
  'frente:centro:8x6':   '/calculadora/stamps/frente-centro-8x6.png',
  'frente:direito:8x6':  '/calculadora/stamps/frente-direito-8x6.png',
  'frente:inferior:8x6': '/calculadora/stamps/frente-inferior-8x6.png',
  // 8x6 - costas
  'costas:topo:8x6':   '/calculadora/stamps/costas-topo-8x6.png',
  'costas:centro:8x6': '/calculadora/stamps/costas-centro-8x6.png',
  'costas:barra:8x6':  '/calculadora/stamps/costas-barra-8x6.png',
  // 8x6 - mangas
  'manga-esquerda:padrao:8x6': '/calculadora/stamps/manga-esquerda-padrao-8x6.png',
  'manga-direita:padrao:8x6':  '/calculadora/stamps/manga-direita-padrao-8x6.png',

  // 10x15 (apenas frente centro e costas)
  'frente:centro:10x15': '/calculadora/stamps/frente-centro-10x15.png',
  'costas:topo:10x15':   '/calculadora/stamps/costas-topo-10x15.png',
  'costas:centro:10x15': '/calculadora/stamps/costas-centro-10x15.png',
  'costas:barra:10x15':  '/calculadora/stamps/costas-barra-10x15.png',

  // 29x21 (apenas frente centro e costas)
  'frente:centro:29x21': '/calculadora/stamps/frente-centro-29x21.png',
  'costas:topo:29x21':   '/calculadora/stamps/costas-topo-29x21.png',
  'costas:centro:29x21': '/calculadora/stamps/costas-centro-29x21.png',
  'costas:barra:29x21':  '/calculadora/stamps/costas-barra-29x21.png',
};

// ========= PRODUTOS QUE PERMITEM BORDADO =========
export const PRODUTOS_COM_BORDADO = ['malha-pv', 'polo-piquet', 'algodao-30-1', 'egipcio-elastano'];

// ========= WHATSAPP =========
export const WHATSAPP_NUMERO = '5531984316140';
