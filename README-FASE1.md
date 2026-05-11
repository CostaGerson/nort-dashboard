# Fase 1 — Calculadora de Orçamentos

## O que tem nesse ZIP

Quatro arquivos novos para a calculadora:

```
src/
  app/
    calculadora/
      page.tsx              ← rota /calculadora
      CalculadoraClient.tsx ← interface completa (cliente)
  lib/
    calculadora/
      constants.ts          ← produtos, cores, URLs de mockup
      pricing.ts            ← todas as tabelas e lógica de preço
      types.ts              ← types do TypeScript
```

Nenhum arquivo existente é sobrescrito. É só extrair e os arquivos vão aparecer dentro de `src/app/calculadora/` e `src/lib/calculadora/`.

---

## Passo 1 — No PC (PowerShell)

Vá pra pasta do projeto (a mesma onde fica o `package.json` do dashboard).

```powershell
cd C:\caminho\para\nort-dashboard
```

Extrai o ZIP pra dentro dessa pasta (o Windows vai mesclar com o `src/` existente, sem apagar nada).

Em seguida:

```powershell
git add .
git status
```

Confirma que aparecem só os 5 arquivos novos. Se tiver outra coisa, me avisa antes de commitar.

```powershell
git commit -m "feat(fase1): calculadora de orcamentos"
git push
```

---

## Passo 2 — Tornar o card "Calculadora" da home clicável

Esse passo precisa de uma pequena edição manual no arquivo da home (`src/app/page.tsx` ou similar — o arquivo onde estão os 4 cards placeholder).

**Encontre o card da Calculadora** e envolva (ou troque) por um Link do Next:

```tsx
import Link from 'next/link';

// ...

<Link href="/calculadora">
  {/* o card que já existe */}
</Link>
```

Se você não souber qual é o arquivo, me manda o `src/app/page.tsx` que eu te devolvo já editado.

---

## Passo 3 — Na VPS (SSH)

```bash
cd /opt/nort/nort-dashboard
git pull
docker compose up -d --build
```

Espera 1-2 min terminar. Depois abre **https://dashboard.nortsports.com.br/calculadora** no navegador.

---

## Como testar

Depois de logar, abre `/calculadora` e confere:

1. **Seleciona um produto** → o preço aparece no topo
2. **Manga longa** (em Malha PV ou Dry-Fit) → +R$ 4,00
3. **Cor** → muda a imagem do mockup
4. **Cor especial** → +15% no total
5. **Personalização** → escolhe local, sub-local, tamanho → "Adicionar"
6. **Bordado** (em Malha PV / Polo / Algodão 30.1 / Egípcio) → aparece toggle DTF/Bordado, taxa de R$ 20 no resumo
7. **Calça** → toggle "personalização no bolso?"
8. **Sublimação total** → preço já vem da tabela própria, sem editor de estampas
9. **Quantidade** → preço por peça muda nas faixas (1-5, 6-10, 11-19, 20+)
10. **Botão WhatsApp** → abre conversa com **5531984316140** com a mensagem montada

---

## Observações técnicas

- As imagens do mockup vêm das URLs externas (nortsports.com.br e meridianpro.com.br). Pode ser que o Next.js peça pra configurar `images.remotePatterns` no `next.config.js`, mas como estou usando a tag `<img>` simples (não `next/image`), não precisa. Se reclamar de algo no build, me avisa.
- Nada é salvo no banco nesta fase. O orçamento só é montado e enviado pelo WhatsApp.
- O número de WhatsApp tá fixo em `5531984316140`. Pra trocar, é só editar `WHATSAPP_NUMERO` em `src/lib/calculadora/constants.ts`.

---

## Se der erro no build

Roda esses 2 comandos na VPS, copia a saída e me manda:

```bash
docker compose logs app --tail=80
docker compose ps
```
