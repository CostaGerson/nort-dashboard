'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  PRODUTOS,
  CORES,
  CORES_POR_PRODUTO,
  LOCALS_MAP,
  SUB_LOCAL_MAP,
  SIZES_MAP,
  MOCK_BASE_BY_COLOR,
  MOCK_BASE_CALCA_BRIM,
  MOCK_BASE_CALCA_JEANS,
  MOCK_STAMP_MAP,
  WHATSAPP_NUMERO,
} from '@/lib/calculadora/constants';
import {
  calcularPreco,
  produtoPermiteBordado,
  isTamanhoPermitido,
  deveMostrarIncentivoQuantidade,
  mensagemFaixaPreco,
  formatBRL,
  labelSubLocal,
} from '@/lib/calculadora/pricing';
import type {
  State,
  Produto,
  Cor,
  LocalId,
  SubLocalId,
  SizeId,
  Tecnica,
  Personalizacao,
} from '@/lib/calculadora/types';

const TAMANHOS: SizeId[] = ['2x10', '8x6', '10x15', '29x21'];

const INITIAL_STATE: State = {
  malhaSelecionada: null,
  mangaLonga: false,
  corSelecionada: null,
  corEspecial: false,
  tecnicaAtual: 'dtf',
  localAtual: null,
  subLocalAtual: null,
  tamanhoAtual: null,
  personalizacaoBolsoCalca: false,
  personalizacoes: [],
  nextPersonalizacaoId: 1,
  quantidade: 1,
};

export default function CalculadoraClient() {
  const [state, setState] = useState<State>(INITIAL_STATE);
  const [toast, setToast] = useState<{ msg: string; type?: 'info' | 'warn' | 'ok' } | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Cálculo derivado
  const calculo = useMemo(() => calcularPreco(state), [state]);
  const mostrarIncentivo = useMemo(() => deveMostrarIncentivoQuantidade(state), [state]);
  const msgFaixa = useMemo(() => mensagemFaixaPreco(state), [state]);

  const update = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));

  function showToast(msg: string, type?: 'info' | 'warn' | 'ok') {
    setToast({ msg, type });
  }

  // ========= HANDLERS =========

  function selecionarProduto(produto: Produto) {
    setState({
      ...INITIAL_STATE,
      malhaSelecionada: produto,
      quantidade: state.quantidade, // mantém qty
      nextPersonalizacaoId: state.nextPersonalizacaoId,
    });

    // Calça jeans: cor fixa indigo-blue
    if (produto.id === 'calca-jeans') {
      setTimeout(() => {
        setState((s) => ({
          ...s,
          corSelecionada: CORES['indigo-blue'],
          corEspecial: false,
        }));
      }, 0);
    }
  }

  function selecionarCor(corId: string) {
    if (state.malhaSelecionada?.sublimacaoTotal) return;

    if (corId === 'especial') {
      update({ corEspecial: true, corSelecionada: null });
      showToast('ℹ Informe a cor desejada ao enviar o orçamento', 'info');
    } else {
      const cor = CORES[corId];
      if (cor) update({ corEspecial: false, corSelecionada: cor });
    }
  }

  function selecionarLocal(localId: LocalId) {
    if (state.malhaSelecionada?.sublimacaoTotal) return;
    // Manga: sub-local fixo "padrao"
    const isManga = localId === 'manga-esquerda' || localId === 'manga-direita';
    update({
      localAtual: localId,
      subLocalAtual: isManga ? 'padrao' : null,
      tamanhoAtual: null,
    });
  }

  function selecionarSubLocal(subLocalId: SubLocalId) {
    if (state.malhaSelecionada?.sublimacaoTotal) return;
    update({ subLocalAtual: subLocalId, tamanhoAtual: null });
  }

  function selecionarTamanho(sizeId: SizeId) {
    if (state.malhaSelecionada?.sublimacaoTotal) return;
    if (!isTamanhoPermitido(sizeId, state.localAtual, state.subLocalAtual, state.tecnicaAtual)) {
      showToast('⚠ Esse tamanho não é permitido para esta posição/técnica.', 'warn');
      return;
    }
    update({ tamanhoAtual: sizeId });
  }

  function selecionarTecnica(t: Tecnica) {
    update({ tecnicaAtual: t });
    // Se tamanho atual ficou inválido com a nova técnica, limpa
    if (state.tamanhoAtual && !isTamanhoPermitido(state.tamanhoAtual, state.localAtual, state.subLocalAtual, t)) {
      update({ tamanhoAtual: null });
    }
  }

  function adicionarPersonalizacao() {
    if (state.malhaSelecionada?.sublimacaoTotal) return;
    if (!state.localAtual) {
      showToast('⚠ Selecione um local (Frente, Costas ou Mangas).', 'warn');
      return;
    }
    if (!state.subLocalAtual) {
      showToast('⚠ Selecione a posição dentro do local.', 'warn');
      return;
    }
    if (!state.tamanhoAtual) {
      showToast('⚠ Selecione um tamanho para a personalização.', 'warn');
      return;
    }
    const existe = state.personalizacoes.some(
      (p) => p.localId === state.localAtual && p.subLocalId === state.subLocalAtual
    );
    if (existe) {
      showToast('⚠ Já existe uma personalização neste local. Remova antes de adicionar outra.', 'warn');
      return;
    }
    const nova: Personalizacao = {
      id: state.nextPersonalizacaoId,
      localId: state.localAtual,
      subLocalId: state.subLocalAtual,
      sizeId: state.tamanhoAtual,
      tecnica: state.tecnicaAtual,
    };
    update({
      personalizacoes: [...state.personalizacoes, nova],
      nextPersonalizacaoId: state.nextPersonalizacaoId + 1,
      localAtual: null,
      subLocalAtual: null,
      tamanhoAtual: null,
    });
    showToast('✓ Personalização adicionada!', 'ok');
  }

  function removerPersonalizacao(id: number) {
    update({ personalizacoes: state.personalizacoes.filter((p) => p.id !== id) });
    showToast('✓ Personalização removida.', 'ok');
  }

  function alterarBolsoCalca(ativar: boolean) {
    if (ativar) {
      const novas: Personalizacao[] = state.personalizacoes.some((p) => p.localId === 'bolso')
        ? state.personalizacoes
        : [
            ...state.personalizacoes,
            {
              id: state.nextPersonalizacaoId,
              localId: 'bolso' as const,
              subLocalId: 'padrao' as const,
              sizeId: 'unico' as const,
              tecnica: 'bordado' as const,
            },
          ];
      update({
        personalizacaoBolsoCalca: true,
        personalizacoes: novas,
        nextPersonalizacaoId: state.nextPersonalizacaoId + 1,
      });
      showToast('✓ Personalização de bolso adicionada!', 'ok');
    } else {
      update({
        personalizacaoBolsoCalca: false,
        personalizacoes: state.personalizacoes.filter((p) => p.localId !== 'bolso'),
      });
      showToast('✓ Personalização de bolso removida.', 'ok');
    }
  }

  function alterarQuantidade(novaQtd: number) {
    update({ quantidade: Math.max(1, novaQtd || 1) });
  }

  function enviarWhatsApp() {
    const msg = montarMensagemWhatsApp(state, calculo);
    window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ========= DERIVADOS =========

  const produto = state.malhaSelecionada;
  const tipoProduto = produto?.tipoProduto;
  const isSublimacaoTotal = !!produto?.sublimacaoTotal;
  const isCalca = tipoProduto === 'calca-brim' || tipoProduto === 'calca-jeans';
  const isCamiseta = tipoProduto === 'camiseta';
  const coresPermitidas = produto ? CORES_POR_PRODUTO[produto.id] || [] : [];
  const podeUsarBordado = isCamiseta && !isSublimacaoTotal && produtoPermiteBordado(produto?.id);

  const mockBaseUrl = useMemo(() => {
    if (tipoProduto === 'calca-brim') return MOCK_BASE_CALCA_BRIM;
    if (tipoProduto === 'calca-jeans') return MOCK_BASE_CALCA_JEANS;
    if (isSublimacaoTotal) return MOCK_BASE_BY_COLOR['especial'];
    if (state.corEspecial) return MOCK_BASE_BY_COLOR['especial'];
    if (state.corSelecionada) return MOCK_BASE_BY_COLOR[state.corSelecionada.id] || MOCK_BASE_BY_COLOR['preto'];
    return MOCK_BASE_BY_COLOR['preto'];
  }, [tipoProduto, isSublimacaoTotal, state.corEspecial, state.corSelecionada]);

  // Cor de fundo do mockup.
  // As PNGs das pecas tem fundo chapado (nao sao transparentes), entao o
  // container precisa combinar com a cor da peca pra a imagem nao "vazar"
  // como um retangulo. Pecas claras (branco / cor especial) usam um cinza
  // bem claro pra a camisa nao sumir no fundo branco.
  const fundoMockup = useMemo(() => {
    const CINZA_CLARO = '#EFEFEF';
    if (isCalca) return CINZA_CLARO;
    if (isSublimacaoTotal || state.corEspecial) return CINZA_CLARO;
    if (state.corSelecionada) {
      if (state.corSelecionada.id === 'branco') return CINZA_CLARO;
      return state.corSelecionada.hex;
    }
    return '#000000';
  }, [isCalca, isSublimacaoTotal, state.corEspecial, state.corSelecionada]);

  const previewStampUrl = useMemo(() => {
    if (isSublimacaoTotal || isCalca) return null;
    if (!state.localAtual || !state.subLocalAtual || !state.tamanhoAtual) return null;
    const key = `${state.localAtual}:${state.subLocalAtual}:${state.tamanhoAtual}`;
    return MOCK_STAMP_MAP[key] || null;
  }, [isSublimacaoTotal, isCalca, state.localAtual, state.subLocalAtual, state.tamanhoAtual]);

  const fixedStamps = useMemo(() => {
    if (isSublimacaoTotal || isCalca) return [] as string[];
    return state.personalizacoes
      .map((p) => MOCK_STAMP_MAP[`${p.localId}:${p.subLocalId}:${p.sizeId}`])
      .filter((u): u is string => !!u);
  }, [isSublimacaoTotal, isCalca, state.personalizacoes]);

  // ========= RENDER =========

  return (
    <div className="space-y-6 pb-32 relative">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
          Simulador de Uniformes
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Monte o uniforme, veja o preço em tempo real e envie pelo WhatsApp.
        </p>
      </div>

      {/* BLOCO DE PREÇO */}
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium mb-1">
              Valor por peça
            </div>
            <div className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {produto ? formatBRL(calculo.precoPorPeca) : '—'}
            </div>
            {!produto && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Selecione um produto para começar
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium mb-1">
              Total
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#FF6B35] tabular-nums">
              {produto ? formatBRL(calculo.totalGeral) : '—'}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* PASSO 1 — PRODUTO */}
      <Section
        numero={1}
        titulo="Qual peça você quer personalizar?"
        descricao="Escolha o produto que melhor combina com o uso da equipe."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRODUTOS.map((p) => (
            <ProductCard
              key={p.id}
              produto={p}
              ativo={produto?.id === p.id}
              onClick={() => selecionarProduto(p)}
            />
          ))}
        </div>

        {/* Manga longa */}
        {produto?.permiteMangaLonga && isCamiseta && (
          <div className="mt-5">
            <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Deseja manga longa?{' '}
              {!isSublimacaoTotal && <span className="text-neutral-500">(+R$ 4,00)</span>}
            </div>
            <PillToggle
              options={[
                { value: 'nao', label: 'Não' },
                { value: 'sim', label: 'Sim' },
              ]}
              value={state.mangaLonga ? 'sim' : 'nao'}
              onChange={(v) => update({ mangaLonga: v === 'sim' })}
            />
          </div>
        )}
      </Section>

      {/* PASSO 2 — COR */}
      {produto && !isSublimacaoTotal && (
        <Section
          numero={2}
          titulo="Qual a cor da peça?"
          descricao="As cores disponíveis variam conforme o tipo de produto."
        >
          <div className="flex flex-wrap items-center gap-3">
            {coresPermitidas
              .filter((id) => id !== 'especial')
              .map((corId) => {
                const cor = CORES[corId];
                if (!cor) return null;
                const ativo = state.corSelecionada?.id === corId;
                return (
                  <button
                    key={corId}
                    type="button"
                    onClick={() => selecionarCor(corId)}
                    aria-label={cor.nome}
                    title={cor.nome}
                    className={`w-12 h-12 rounded-full transition-all border-2 ${
                      ativo
                        ? 'border-[#FF6B35] scale-110 shadow-lg'
                        : 'border-neutral-300 dark:border-neutral-700 hover:scale-105'
                    }`}
                    style={{ backgroundColor: cor.hex }}
                  />
                );
              })}

            {coresPermitidas.includes('especial') && (
              <div className="flex items-center gap-2 ml-2">
                <button
                  type="button"
                  onClick={() => selecionarCor('especial')}
                  aria-label="Cor especial"
                  title="Cor especial (+15%)"
                  className={`w-12 h-12 rounded-full transition-all border-2 ${
                    state.corEspecial
                      ? 'border-[#FF6B35] scale-110 shadow-lg'
                      : 'border-neutral-300 dark:border-neutral-700 hover:scale-105'
                  }`}
                  style={{
                    background:
                      'conic-gradient(from 0deg, #ff0000, #ff9900, #ffff00, #33cc33, #0099ff, #6633cc, #ff00ff, #ff0000)',
                  }}
                />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Cor especial<br />
                  <span className="text-[10px]">(+15%)</span>
                </span>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* PASSO 3 — PERSONALIZAÇÃO + MOCKUP */}
      {produto && (
        <Section
          numero={3}
          titulo={isSublimacaoTotal ? 'Visualização da peça' : isCalca ? 'Personalização' : 'Onde vai sua estampa?'}
          descricao={
            isSublimacaoTotal
              ? 'Sublimação total: a peça inteira é personalizada. Selecione manga e quantidade.'
              : isCalca
              ? 'Deseja adicionar personalização no bolso da calça?'
              : 'Escolha o local e o tamanho de cada estampa. Você pode adicionar várias.'
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mockup */}
            <div className="space-y-3">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-4">
                {/*
                  Mockup por CAMADAS sobre fundo branco solido.
                  As PNGs sao transparentes; o fundo precisa ser claro pra elas aparecerem.
                  Sem overlay, sem opacidade nas camadas — cada estampa e uma layer limpa.
                */}
                <div
                  className="relative w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-black/5 transition-colors"
                  style={{ backgroundColor: fundoMockup }}
                >
                  {/* Camada 0: peca base */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mockBaseUrl}
                    alt="Produto base"
                    className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                    draggable={false}
                  />

                  {/* Camadas 1..N: estampas ja adicionadas (sempre todas visiveis) */}
                  {fixedStamps.map((url, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`fixed-${idx}`}
                      src={url}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  ))}

                  {/* Camada de preview: estampa em edicao, ainda nao adicionada.
                      Destacada por um anel tracejado laranja, NAO por opacidade. */}
                  {previewStampUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewStampUrl}
                        alt="Prévia"
                        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                        draggable={false}
                      />
                      <div className="absolute inset-2 rounded-xl border-2 border-dashed border-[#FF6B35]/70 pointer-events-none" />
                      <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6B35] text-white">
                        Prévia
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
                  {isSublimacaoTotal
                    ? 'Sublimação total: a arte cobre toda a peça.'
                    : isCalca
                    ? 'A personalização será aplicada no bolso.'
                    : previewStampUrl
                    ? 'A área tracejada é a prévia. Clique em "Adicionar" para confirmá-la.'
                    : 'A imagem mostra a frente e as costas. As marcações são as áreas personalizadas.'}
                </p>
              </div>
            </div>

            {/* Editor */}
            <div className="space-y-4">
              {/* CALÇA: toggle bolso */}
              {isCalca && (
                <GlassCard className="p-5">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                    Personalização no bolso?
                  </div>
                  <PillToggle
                    options={[
                      { value: 'nao', label: 'Não' },
                      { value: 'sim', label: 'Sim' },
                    ]}
                    value={state.personalizacaoBolsoCalca ? 'sim' : 'nao'}
                    onChange={(v) => alterarBolsoCalca(v === 'sim')}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                    Bordado no bolso. O valor varia conforme a quantidade.
                  </p>
                </GlassCard>
              )}

              {/* CAMISETA (não sublimação): editor completo */}
              {isCamiseta && !isSublimacaoTotal && (
                <>
                  {/* Técnica */}
                  {podeUsarBordado && (
                    <GlassCard className="p-5">
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                        Tipo de personalização
                      </div>
                      <div className="flex gap-2">
                        <PillButton
                          ativo={state.tecnicaAtual === 'dtf'}
                          onClick={() => selecionarTecnica('dtf')}
                        >
                          DTF <span className="text-[10px] ml-1 opacity-70">Recomendado</span>
                        </PillButton>
                        <PillButton
                          ativo={state.tecnicaAtual === 'bordado'}
                          onClick={() => selecionarTecnica('bordado')}
                        >
                          Bordado
                        </PillButton>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
                        <strong>DTF:</strong> melhor qualidade e preço.{' '}
                        <strong>Bordado:</strong> acabamento premium em tecido.
                      </p>
                    </GlassCard>
                  )}

                  {/* Local */}
                  <GlassCard className="p-5">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      Local da personalização
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(['frente', 'costas', 'manga-esquerda', 'manga-direita'] as LocalId[]).map(
                        (l) => (
                          <PillButton
                            key={l}
                            ativo={state.localAtual === l}
                            onClick={() => selecionarLocal(l)}
                          >
                            {LOCALS_MAP[l]}
                          </PillButton>
                        )
                      )}
                    </div>

                    {/* Sub-local */}
                    {state.localAtual === 'frente' && (
                      <div className="mt-4">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                          Posição na frente
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(['esquerdo', 'centro', 'direito', 'inferior'] as SubLocalId[]).map(
                            (s) => (
                              <PillButton
                                key={s}
                                ativo={state.subLocalAtual === s}
                                onClick={() => selecionarSubLocal(s)}
                              >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </PillButton>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {state.localAtual === 'costas' && (
                      <div className="mt-4">
                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                          Posição nas costas
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {(['topo', 'centro', 'barra'] as SubLocalId[]).map((s) => (
                            <PillButton
                              key={s}
                              ativo={state.subLocalAtual === s}
                              onClick={() => selecionarSubLocal(s)}
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </PillButton>
                          ))}
                        </div>
                      </div>
                    )}

                    {(state.localAtual === 'manga-esquerda' || state.localAtual === 'manga-direita') && (
                      <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                        ✓ Posição padrão da manga selecionada automaticamente.
                      </div>
                    )}
                  </GlassCard>

                  {/* Tamanho */}
                  <GlassCard className="p-5">
                    <div className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                      Tamanho da estampa
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {TAMANHOS.map((sz) => {
                        const permitido = isTamanhoPermitido(
                          sz,
                          state.localAtual,
                          state.subLocalAtual,
                          state.tecnicaAtual
                        );
                        return (
                          <PillButton
                            key={sz}
                            ativo={state.tamanhoAtual === sz}
                            disabled={!permitido}
                            onClick={() => selecionarTamanho(sz)}
                          >
                            {SIZES_MAP[sz]}
                          </PillButton>
                        );
                      })}
                    </div>
                  </GlassCard>

                  {/* Botão adicionar */}
                  <button
                    type="button"
                    onClick={adicionarPersonalizacao}
                    className="w-full rounded-full bg-[#FF6B35] hover:bg-[#e85a25] text-white font-semibold py-3 px-6 transition-all shadow-lg shadow-[#FF6B35]/20 hover:shadow-xl"
                  >
                    + Adicionar esta personalização
                  </button>
                </>
              )}

              {/* SUBLIMAÇÃO TOTAL: só mostra mensagem */}
              {isSublimacaoTotal && (
                <GlassCard className="p-5">
                  <div className="text-sm text-neutral-600 dark:text-neutral-300">
                    Sublimação total: a peça inteira é personalizada com a arte. Não é necessário
                    escolher local nem tamanho de estampa.
                  </div>
                </GlassCard>
              )}
            </div>
          </div>

          {/* Lista de personalizações */}
          {!isSublimacaoTotal && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                Personalizações adicionadas
              </h3>
              {state.personalizacoes.length === 0 ? (
                <GlassCard className="p-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
                    {isCalca
                      ? 'Nenhuma personalização. Toque em "Sim" acima para adicionar.'
                      : 'Nenhuma personalização ainda. Use o editor acima.'}
                  </p>
                </GlassCard>
              ) : (
                <div className="space-y-2">
                  {state.personalizacoes.map((item) => {
                    const isBolso = item.localId === 'bolso';
                    const localLabel = isBolso
                      ? 'Bolso da calça'
                      : labelSubLocal(item.localId, item.subLocalId, LOCALS_MAP, SUB_LOCAL_MAP);
                    const sizeLabel = isBolso ? 'Bordado' : SIZES_MAP[item.sizeId] || item.sizeId;
                    const tecLabel = item.tecnica === 'bordado' ? 'Bordado' : 'DTF';
                    return (
                      <GlassCard
                        key={item.id}
                        className="p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {localLabel}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {isBolso ? sizeLabel : `${sizeLabel} — ${tecLabel}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            isBolso ? alterarBolsoCalca(false) : removerPersonalizacao(item.id)
                          }
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          Remover
                        </button>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* PASSO 4 — RESUMO E QUANTIDADE */}
      {produto && (
        <Section numero={4} titulo="Resumo do orçamento">
          <GlassCard className="p-6 space-y-3">
            <ResumoLinha label="Tipo de produto" valor={produto.nome} />
            {isCamiseta && produto.permiteMangaLonga && (
              <ResumoLinha
                label="Manga"
                valor={
                  state.mangaLonga
                    ? isSublimacaoTotal
                      ? 'Longa'
                      : 'Longa (+R$ 4,00)'
                    : 'Curta'
                }
              />
            )}
            <ResumoLinha
              label="Cor"
              valor={
                isSublimacaoTotal
                  ? 'Arte total (sublimação total)'
                  : state.corEspecial
                  ? 'Cor especial (informar ao enviar)'
                  : state.corSelecionada?.nome || '—'
              }
            />
            <ResumoLinha
              label="Personalizações"
              valor={
                isSublimacaoTotal
                  ? 'Peça inteira (sublimação total)'
                  : state.personalizacoes.length === 0
                  ? '—'
                  : state.personalizacoes
                      .map((p) =>
                        p.localId === 'bolso'
                          ? 'Bolso'
                          : labelSubLocal(p.localId, p.subLocalId, LOCALS_MAP, SUB_LOCAL_MAP)
                      )
                      .join(', ')
              }
            />
            <ResumoLinha label="Valor por peça" valor={formatBRL(calculo.precoPorPeca)} />
            {state.corEspecial && calculo.valorCorEspecial > 0 && (
              <ResumoLinha
                label="Acréscimo cor especial"
                valor={formatBRL(calculo.valorCorEspecial)}
              />
            )}
            {calculo.taxaProgramacao > 0 && (
              <ResumoLinha
                label="Programação do bordado"
                valor={formatBRL(calculo.taxaProgramacao)}
              />
            )}
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 mt-3" />
            <ResumoLinha
              label="Total estimado"
              valor={formatBRL(calculo.totalGeral)}
              destaque
            />
            {mostrarIncentivo && (
              <div className="text-xs text-neutral-500 dark:text-neutral-400 italic mt-2">
                💡 {msgFaixa}
              </div>
            )}
          </GlassCard>

          {/* Quantidade */}
          <div className="mt-5">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
              Quantidade de peças
            </div>
            <div className="inline-flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 p-1">
              <button
                type="button"
                onClick={() => alterarQuantidade(state.quantidade - 1)}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-bold transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={state.quantidade}
                onChange={(e) => alterarQuantidade(parseInt(e.target.value, 10))}
                className="w-16 text-center bg-transparent text-neutral-900 dark:text-white font-semibold text-lg outline-none"
              />
              <button
                type="button"
                onClick={() => alterarQuantidade(state.quantidade + 1)}
                className="w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6">
            <button
              type="button"
              onClick={enviarWhatsApp}
              className="w-full md:w-auto rounded-full bg-[#FF6B35] hover:bg-[#e85a25] text-white font-semibold py-4 px-8 transition-all shadow-lg shadow-[#FF6B35]/30 hover:shadow-xl"
            >
              📱 Enviar este orçamento pelo WhatsApp
            </button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Você só confirma o pedido no WhatsApp. Revisamos arte, tamanhos e detalhes antes de
              produzir.
            </p>
          </div>
        </Section>
      )}

      {/* PREÇO FLUTUANTE */}
      {produto && (
        <div className="fixed bottom-4 right-4 z-30 max-w-xs">
          <GlassCard className="p-3 shadow-md">
            <div className="text-base font-bold text-neutral-900 dark:text-white tabular-nums">
              {formatBRL(calculo.precoPorPeca)} cada
            </div>
            {mostrarIncentivo && (
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {msgFaixa}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg backdrop-blur-md border ${
              toast.type === 'warn'
                ? 'bg-amber-500/90 text-white border-amber-300/40'
                : toast.type === 'ok'
                ? 'bg-green-500/90 text-white border-green-300/40'
                : 'bg-neutral-900/95 text-white border-neutral-700'
            }`}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

// ========= COMPONENTES AUXILIARES =========

// Card claro e leve. Mantem o nome "GlassCard" so pra nao quebrar
// os ~15 usos espalhados — visualmente agora e um card branco simples.
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Section({
  numero,
  titulo,
  descricao,
  children,
}: {
  numero: number;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white text-sm font-bold">
          {numero}
        </span>
        <h2 className="text-xl md:text-2xl font-semibold text-neutral-900 dark:text-white">
          {titulo}
        </h2>
      </div>
      {descricao && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 ml-11">{descricao}</p>
      )}
      <div>{children}</div>
    </section>
  );
}

function ProductCard({
  produto,
  ativo,
  onClick,
}: {
  produto: Produto;
  ativo: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-2xl transition-all border ${
        ativo
          ? 'bg-orange-50 dark:bg-neutral-800 border-[#FF6B35] ring-1 ring-[#FF6B35]/40'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-semibold text-neutral-900 dark:text-white text-sm">{produto.nome}</span>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] font-semibold whitespace-nowrap">
          {produto.badge}
        </span>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{produto.descricao}</p>
      <div className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
        A partir de {formatBRL(produto.basePrice)}
      </div>
    </button>
  );
}

function PillButton({
  children,
  ativo,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  ativo?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        disabled
          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
          : ativo
          ? 'bg-[#FF6B35] text-white shadow-sm'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
      }`}
    >
      {children}
    </button>
  );
}

function PillToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
            value === opt.value
              ? 'bg-[#FF6B35] text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ResumoLinha({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`text-sm ${
          destaque
            ? 'font-semibold text-neutral-900 dark:text-white'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-right tabular-nums ${
          destaque
            ? 'text-xl font-bold text-[#FF6B35]'
            : 'text-sm font-medium text-neutral-900 dark:text-white'
        }`}
      >
        {valor}
      </span>
    </div>
  );
}

// ========= MONTAR MENSAGEM WHATSAPP =========

function montarMensagemWhatsApp(state: State, calculo: ReturnType<typeof calcularPreco>): string {
  const produto = state.malhaSelecionada;
  if (!produto) return '';

  const malha = produto.nome;
  const isCamiseta = produto.tipoProduto === 'camiseta';
  const isSublimacao = produto.sublimacaoTotal;
  const isCalca = produto.tipoProduto === 'calca-brim' || produto.tipoProduto === 'calca-jeans';

  const manga =
    produto.permiteMangaLonga && isCamiseta
      ? state.mangaLonga
        ? isSublimacao
          ? 'Longa'
          : 'Longa (+R$ 4,00)'
        : 'Curta'
      : '';

  let cor = '—';
  if (isSublimacao) cor = 'Arte total (sublimação total)';
  else if (state.corEspecial) cor = 'Cor especial (informar ao confirmar)';
  else if (state.corSelecionada) cor = state.corSelecionada.nome;

  let listaPerso = 'Nenhuma personalização adicionada.';
  if (isSublimacao) {
    listaPerso = '• Peça inteira (sublimação total)';
  } else if (isCamiseta && state.personalizacoes.length > 0) {
    listaPerso = state.personalizacoes
      .map((p) => {
        const localLabel = labelSubLocal(p.localId, p.subLocalId, LOCALS_MAP, SUB_LOCAL_MAP);
        const sizeLabel = SIZES_MAP[p.sizeId] || p.sizeId;
        const tecLabel = p.tecnica === 'bordado' ? 'Bordado' : 'DTF';
        return `• ${localLabel} (${sizeLabel}) — ${tecLabel}`;
      })
      .join('\n');
  } else if (isCalca && state.personalizacaoBolsoCalca) {
    listaPerso = '• Bolso (Personalizado) — Bordado';
  }

  let msg = 'Olá, gostaria de um orçamento:\n\n';
  msg += `🎽 Produto: ${malha}\n`;
  if (manga) msg += `📏 Manga: ${manga}\n`;
  msg += `🎨 Cor: ${cor}\n`;
  msg += `📦 Quantidade: ${state.quantidade} peças\n\n`;
  msg += `✨ Personalizações:\n${listaPerso}\n\n`;
  msg += `💰 Valor por peça: ${formatBRL(calculo.precoPorPeca)}\n`;
  if (!isSublimacao && state.corEspecial && calculo.valorCorEspecial > 0) {
    msg += `🎨 Acréscimo Cor especial: ${formatBRL(calculo.valorCorEspecial)}\n`;
  }
  if (calculo.taxaProgramacao > 0) {
    msg += `🧵 Programação do bordado: ${formatBRL(calculo.taxaProgramacao)}\n`;
  }
  msg += `💵 Total: ${formatBRL(calculo.totalGeral)}\n\n`;
  msg += 'Observação: Valores sujeitos a confirmação de arte e detalhes finais.';
  return msg;
}
