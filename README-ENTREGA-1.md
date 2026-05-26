# Entrega 1 — Calculadora Nova (estrutura base + Tela 1)

## O que tem nessa entrega

- Toda a lógica de negócio da calculadora (produtos, cores, regras, preços, fórmula).
- State global do wizard (Context com persistência em `sessionStorage`).
- **Tela 1** completa (boas-vindas + grid de 8 produtos com destaque assimétrico).
- Placeholder pra Tela 2 (vem na próxima entrega).
- Rota temporária: **`/calculadora-nova`** (não toca na antiga ainda).

A rota antiga (`/calculadora`) continua funcionando como está. Quando as 3 telas estiverem prontas e testadas, a gente faz a substituição.

## Estrutura

```
src/
  app/calculadora-nova/
    page.tsx                          ← rota
    CalculadoraNovaClient.tsx         ← orchestrator (provider + switch de telas)
    components/
      Tela1Produto.tsx                ← Tela 1 (esta entrega)
      Tela2Placeholder.tsx            ← stub
      ProductCard.tsx                 ← card com variantes destaque/padrao
      ProdutoIcon.tsx                 ← 8 SVGs inline das peças
  lib/calculadora-nova/
    types.ts                          ← tipos
    constants.ts                      ← produtos, cores, helpers
    pricing-tables.ts                 ← tabelas de preço
    pricing.ts                        ← função calcular() + mensagemFaixa()
    posicoes.ts                       ← regras de posição/tamanho por técnica
    wizard-context.tsx                ← state global
```

Nada fora dessas pastas foi mexido. Sem deps novas no `package.json`.

## Como testar na VPS depois do deploy

1. Logado no dashboard, acessa `https://dashboard.nortsports.com.br/calculadora-nova`.
2. Tela 1 abre com os 8 produtos. Hover deve elevar o card; clique deve dar um pulso laranja e ir pro placeholder da Tela 2.
3. Clicar no produto preserva a escolha (vê no placeholder o nome do produto).
4. Botão "←" do placeholder volta pra Tela 1 e zera o state.

## Próximas entregas

- **Entrega 2**: Tela 2 completa (3 colunas, peça com "+", radial de tamanhos, resumo navy).
- **Entrega 3**: Tela 3 (resumo + envio via API WhatsApp + modal de confirmação).
- **Entrega 4**: substituição da antiga — apaga `src/app/calculadora/`, `src/lib/calculadora/`, `public/calculadora/`, renomeia `/calculadora-nova` pra `/calculadora` e aponta o card da home.
