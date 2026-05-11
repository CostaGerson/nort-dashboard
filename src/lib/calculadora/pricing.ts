// Lógica pura de cálculo de preços (preserva 100% do JS original)

import type { SizeId, State, CalculoResultado, Personalizacao } from './types';
import { PRODUTOS_COM_BORDADO } from './constants';

// ========= TABELAS DE PREÇO =========

// DTF (camisetas)
export const TABELA_PRECOS_DTF: Record<string, Record<string, number>> = {
  '2x10':  { '1-5': 10.00, '6-10': 9.00,  '11-19': 8.00,  '20+': 7.00 },
  '8x6':   { '1-5': 12.00, '6-10': 11.00, '11-19': 10.00, '20+': 9.00 },
  '10x15': { '1-5': 14.00, '6-10': 13.00, '11-19': 12.00, '20+': 11.00 },
  '29x21': { '1-5': 20.00, '6-10': 18.00, '11-19': 16.00, '20+': 14.00 },
};

// Bordado em camisetas
export const TABELA_PRECOS_BORDADO_CAMISETAS: Record<string, Record<string, number>> = {
  '2x10':  { '1-5': 15.00, '6-10': 12.00, '11-19': 8.00,  '20+': 6.00 },
  '8x6':   { '1-5': 16.00, '6-10': 14.00, '11-19': 12.00, '20+': 8.00 },
  '10x15': { '1-5': 18.00, '6-10': 16.00, '11-19': 14.00, '20+': 10.00 },
  '29x21': { '1-5': 50.00, '6-10': 42.00, '11-19': 36.00, '20+': 25.00 },
};

// Bordado em calça (bolso)
export const TABELA_PRECOS_BORDADO_CALCAS: Record<string, number> = {
  '1-5': 16.00, '6-10': 14.00, '11-19': 12.00, '20+': 8.00,
};

// Sublimação total — Manga Curta
export const TABELA_SUBLIMACAO_TOTAL_MC: Record<string, number> = {
  '1-5': 70.00, '6-10': 39.00, '11-20': 22.00, '20+': 18.00,
};

// Sublimação total — Manga Longa
export const TABELA_SUBLIMACAO_TOTAL_ML: Record<string, number> = {
  '1-5': 80.00, '6-10': 45.00, '11-20': 26.00, '20+': 22.00,
};

// ========= FAIXAS =========

export function getFaixaQuantidade(qtd: number): string | null {
  if (qtd >= 20) return '20+';
  if (qtd >= 11) return '11-19';
  if (qtd >= 6)  return '6-10';
  if (qtd >= 1)  return '1-5';
  return null;
}

export function getFaixaQuantidadeSublimacao(qtd: number): string | null {
  if (qtd >= 21) return '20+';
  if (qtd >= 11) return '11-20';
  if (qtd >= 6)  return '6-10';
  if (qtd >= 1)  return '1-5';
  return null;
}

// ========= PREÇOS POR PERSONALIZAÇÃO =========

export function getPrecoPorPersonalizacaoDTF(sizeId: string, qtd: number): number {
  const faixa = getFaixaQuantidade(qtd);
  if (!faixa || !TABELA_PRECOS_DTF[sizeId]) return 0;
  return TABELA_PRECOS_DTF[sizeId][faixa] || 0;
}

export function getPrecoPorPersonalizacaoBordadoCamiseta(sizeId: string, qtd: number): number {
  const faixa = getFaixaQuantidade(qtd);
  if (!faixa || !TABELA_PRECOS_BORDADO_CAMISETAS[sizeId]) return 0;
  return TABELA_PRECOS_BORDADO_CAMISETAS[sizeId][faixa] || 0;
}

export function getPrecoPersonalizacaoCalca(qtd: number): number {
  const faixa = getFaixaQuantidade(qtd);
  if (!faixa) return 0;
  return TABELA_PRECOS_BORDADO_CALCAS[faixa] || 0;
}

export function getPrecoSublimacaoTotalPorPeca(qtd: number, mangaLonga: boolean): number {
  const faixa = getFaixaQuantidadeSublimacao(qtd);
  if (!faixa) return 0;
  const tabela = mangaLonga ? TABELA_SUBLIMACAO_TOTAL_ML : TABELA_SUBLIMACAO_TOTAL_MC;
  return tabela[faixa] || 0;
}

// ========= TAXA DE PROGRAMAÇÃO DO BORDADO =========

export function getTaxaProgramacaoBordado(state: State): number {
  const temBordadoNaLista = state.personalizacoes.some(p => p.tecnica === 'bordado');
  const isCalcaComBolso =
    (state.malhaSelecionada?.tipoProduto === 'calca-brim' ||
     state.malhaSelecionada?.tipoProduto === 'calca-jeans') &&
    state.personalizacaoBolsoCalca;

  if (temBordadoNaLista || isCalcaComBolso) return 20.00;
  return 0;
}

// ========= REGRAS =========

export function produtoPermiteBordado(produtoId?: string | null): boolean {
  if (!produtoId) return false;
  return PRODUTOS_COM_BORDADO.includes(produtoId);
}

// Validação: tamanho permitido para certa posição e técnica
export function isTamanhoPermitido(
  sizeId: SizeId,
  localId: string | null,
  subLocalId: string | null,
  tecnica: 'dtf' | 'bordado'
): boolean {
  if (!localId || !subLocalId) return true;

  // Regras base (frente/mangas: tamanhos grandes restritos)
  if (localId === 'frente') {
    if (['esquerdo', 'direito', 'inferior'].includes(subLocalId)) {
      if (['10x15', '29x21'].includes(sizeId)) return false;
    }
  } else if (localId === 'manga-esquerda' || localId === 'manga-direita') {
    if (['10x15', '29x21'].includes(sizeId)) return false;
  }

  // Regra extra para BORDADO: 10x15 e 29x21 só em frente:centro ou costas:topo
  if (tecnica === 'bordado') {
    if (['10x15', '29x21'].includes(sizeId)) {
      const permitido =
        (localId === 'frente' && subLocalId === 'centro') ||
        (localId === 'costas' && subLocalId === 'topo');
      if (!permitido) return false;
    }
  }

  return true;
}

// ========= CÁLCULO PRINCIPAL =========

export function calcularPreco(state: State): CalculoResultado {
  const { malhaSelecionada, mangaLonga, corEspecial, quantidade } = state;
  const qtd = quantidade || 0;

  if (!malhaSelecionada) {
    return { precoPorPeca: 0, totalGeral: 0, valorCorEspecial: 0, taxaProgramacao: 0 };
  }

  // SUBLIMAÇÃO TOTAL: preço = base + tabela sublimação por faixa/manga
  if (malhaSelecionada.sublimacaoTotal) {
    const base = malhaSelecionada.basePrice || 0;
    const subli = getPrecoSublimacaoTotalPorPeca(qtd, mangaLonga);
    const precoPorPeca = base + subli;
    const totalGeral = precoPorPeca * qtd;
    return { precoPorPeca, totalGeral, valorCorEspecial: 0, taxaProgramacao: 0 };
  }

  const precoBase = malhaSelecionada.basePrice || 0;
  const precoMangaLonga = mangaLonga ? 4.00 : 0;
  let precoPersonalizacaoPorPeca = 0;

  if (malhaSelecionada.tipoProduto === 'camiseta') {
    state.personalizacoes.forEach((item: Personalizacao) => {
      if (item.tecnica === 'bordado') {
        precoPersonalizacaoPorPeca += getPrecoPorPersonalizacaoBordadoCamiseta(item.sizeId, qtd);
      } else {
        precoPersonalizacaoPorPeca += getPrecoPorPersonalizacaoDTF(item.sizeId, qtd);
      }
    });
  } else {
    // Calça
    if (state.personalizacaoBolsoCalca) {
      precoPersonalizacaoPorPeca += getPrecoPersonalizacaoCalca(qtd);
    }
  }

  let subtotalPorPeca = precoBase + precoMangaLonga + precoPersonalizacaoPorPeca;
  let valorCorEspecial = 0;

  if (corEspecial) {
    valorCorEspecial = subtotalPorPeca * 0.15;
    subtotalPorPeca += valorCorEspecial;
  }

  const taxaProgramacao = getTaxaProgramacaoBordado(state);
  const totalGeral = (subtotalPorPeca * qtd) + taxaProgramacao;

  return {
    precoPorPeca: subtotalPorPeca,
    totalGeral,
    valorCorEspecial,
    taxaProgramacao,
  };
}

// ========= INCENTIVO DE FAIXA =========

export function deveMostrarIncentivoQuantidade(state: State): boolean {
  if (!state.malhaSelecionada) return false;
  if (state.malhaSelecionada.sublimacaoTotal) return true;
  if (state.malhaSelecionada.tipoProduto !== 'camiseta') return true;
  return state.personalizacoes.length > 0;
}

export function mensagemFaixaPreco(state: State): string {
  const qtd = state.quantidade || 0;
  if (qtd < 1) return 'Informe a quantidade para ver as faixas de preço.';

  if (state.malhaSelecionada?.sublimacaoTotal) {
    if (qtd < 6)  return `Faltam ${6 - qtd} un para a próxima faixa de preço.`;
    if (qtd < 11) return `Faltam ${11 - qtd} un para a próxima faixa de preço.`;
    if (qtd < 21) return `Faltam ${21 - qtd} un para o melhor preço.`;
    return '✓ Você já está na melhor faixa de preço.';
  }

  if (qtd < 6)  return `Faltam ${6 - qtd} un para a próxima faixa de preço.`;
  if (qtd < 11) return `Faltam ${11 - qtd} un para a próxima faixa de preço.`;
  if (qtd < 20) return `Faltam ${20 - qtd} un para o melhor preço.`;
  return '✓ Você já está na melhor faixa de preço.';
}

// ========= FORMATAÇÃO =========

export function formatBRL(valor: number): string {
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

export function labelSubLocal(
  localId: string | null,
  subLocalId: string | null,
  localsMap: Record<string, string>,
  subLocalMap: Record<string, string>
): string {
  if (!localId) return '—';
  const chave = `${localId}:${subLocalId}`;
  return subLocalMap[chave] || localsMap[localId] || localId;
}
