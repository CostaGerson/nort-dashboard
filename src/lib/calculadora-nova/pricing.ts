// Cálculo principal — fonte: logica-calculadora-precos.md seção 7
// Três casos: A) Sublimação, B) Camiseta normal, C) Calça

import { getProduto } from "./constants";
import {
  MODIFICADORES,
  PRECO_BORDADO,
  PRECO_BORDADO_CALCA,
  PRECO_DTF,
  PRECO_SUBLIMACAO,
  faixaPadrao,
  faixaSublimacao,
} from "./pricing-tables";
import type { OrcamentoState, ResultadoCalculo } from "./types";

export function calcular(state: OrcamentoState): ResultadoCalculo {
  if (!state.produtoId) {
    return zerado();
  }

  const produto = getProduto(state.produtoId);
  const qtd = Math.max(1, state.quantidade);

  // === Caso A — Sublimação total ===
  if (produto.sublimacaoTotal) {
    const faixa = faixaSublimacao(qtd);
    const subli = PRECO_SUBLIMACAO[state.manga][faixa];
    const precoPeca = produto.precoBase + subli;
    return {
      precoBase: produto.precoBase,
      precoMangaLonga: 0,
      precoPersonalizacao: 0,
      precoSublimacao: subli,
      valorCorEspecial: 0,
      taxaProgramacao: 0,
      precoPeca,
      total: precoPeca * qtd,
    };
  }

  // === Caso C — Calça ===
  if (produto.tipo === "calca") {
    const faixa = faixaPadrao(qtd);
    const precoPerson = state.bolsoCalca ? PRECO_BORDADO_CALCA[faixa] : 0;
    let subtotalPeca = produto.precoBase + precoPerson;

    let valorCorEspecial = 0;
    // Calça jeans não tem cor especial (cor fixa indigo)
    const corPermiteEspecial = produto.id !== "calca-jeans";
    if (corPermiteEspecial && state.corId === "especial") {
      valorCorEspecial = subtotalPeca * MODIFICADORES.corEspecialPct;
      subtotalPeca += valorCorEspecial;
    }

    const taxaProgramacao = state.bolsoCalca
      ? MODIFICADORES.taxaProgramacaoBordado
      : 0;

    return {
      precoBase: produto.precoBase,
      precoMangaLonga: 0,
      precoPersonalizacao: precoPerson,
      precoSublimacao: 0,
      valorCorEspecial,
      taxaProgramacao,
      precoPeca: subtotalPeca,
      total: subtotalPeca * qtd + taxaProgramacao,
    };
  }

  // === Caso B — Camiseta normal ===
  const faixa = faixaPadrao(qtd);
  const precoMangaLonga =
    produto.permiteManga && state.manga === "longa"
      ? MODIFICADORES.mangaLongaAvulsa
      : 0;

  let precoPerson = 0;
  for (const e of state.estampas) {
    const tabela = state.tecnica === "dtf" ? PRECO_DTF : PRECO_BORDADO;
    precoPerson += tabela[e.tamanho][faixa];
  }

  let subtotalPeca = produto.precoBase + precoMangaLonga + precoPerson;

  let valorCorEspecial = 0;
  if (state.corId === "especial") {
    valorCorEspecial = subtotalPeca * MODIFICADORES.corEspecialPct;
    subtotalPeca += valorCorEspecial;
  }

  const temBordado =
    state.tecnica === "bordado" && state.estampas.length > 0;
  const taxaProgramacao = temBordado
    ? MODIFICADORES.taxaProgramacaoBordado
    : 0;

  return {
    precoBase: produto.precoBase,
    precoMangaLonga,
    precoPersonalizacao: precoPerson,
    precoSublimacao: 0,
    valorCorEspecial,
    taxaProgramacao,
    precoPeca: subtotalPeca,
    total: subtotalPeca * qtd + taxaProgramacao,
  };
}

function zerado(): ResultadoCalculo {
  return {
    precoBase: 0,
    precoMangaLonga: 0,
    precoPersonalizacao: 0,
    precoSublimacao: 0,
    valorCorEspecial: 0,
    taxaProgramacao: 0,
    precoPeca: 0,
    total: 0,
  };
}

// Mensagem de incentivo de faixa — seção 8 da lógica
export function mensagemFaixa(state: OrcamentoState): string | null {
  if (!state.produtoId) return null;
  const produto = getProduto(state.produtoId);
  const qtd = state.quantidade;

  // Quando mostrar?
  // - Sublimação: sempre
  // - Calça: sempre
  // - Camiseta normal: só com personalização
  if (produto.tipo === "camiseta" && !produto.sublimacaoTotal) {
    if (state.estampas.length === 0) return null;
  }

  if (produto.sublimacaoTotal) {
    if (qtd < 6) return `Faltam ${6 - qtd} un para a próxima faixa de preço.`;
    if (qtd < 11) return `Faltam ${11 - qtd} un para a próxima faixa de preço.`;
    if (qtd < 21) return `Faltam ${21 - qtd} un para o melhor preço.`;
    return "✓ Você já está na melhor faixa de preço.";
  }

  if (qtd < 1) return "Informe a quantidade para ver as faixas de preço.";
  if (qtd < 6) return `Faltam ${6 - qtd} un para a próxima faixa de preço.`;
  if (qtd < 11) return `Faltam ${11 - qtd} un para a próxima faixa de preço.`;
  if (qtd < 20) return `Faltam ${20 - qtd} un para o melhor preço.`;
  return "✓ Você já está na melhor faixa de preço.";
}
