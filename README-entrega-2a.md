# Entrega 2a — Tela 2 (esqueleto funcional)

## O que tem aqui

Arquivos NOVOS pra adicionar ao projeto:

```
src/app/calculadora-nova/components/Tela2Config.tsx           ← orchestrator da tela 2
src/app/calculadora-nova/components/tela2/Toast.tsx           ← toast discreto
src/app/calculadora-nova/components/tela2/ColunaFina.tsx      ← manga + cor + técnica
src/app/calculadora-nova/components/tela2/ColunaPeca.tsx      ← peça + estampas + quantidade
src/app/calculadora-nova/components/tela2/ColunaResumo.tsx    ← resumo navy sticky
src/app/calculadora-nova/components/tela2/SilhuetaPeca.tsx    ← SVG quadrado 400x400 (placeholder)
src/app/calculadora-nova/components/tela2/PopoverTamanhos.tsx ← menu provisório de tamanhos
```

## Duas edições pequenas em arquivos existentes

### 1) `src/app/calculadora-nova/CalculadoraNovaClient.tsx`

Trocar o import e uso de `Tela2Placeholder` por `Tela2Config`.

ANTES:
```tsx
import Tela2Placeholder from "./components/Tela2Placeholder";
// ...
{step === 2 && <Tela2Placeholder />}
```

DEPOIS:
```tsx
import Tela2Config from "./components/Tela2Config";
// ...
{step === 2 && <Tela2Config />}
```

O arquivo `Tela2Placeholder.tsx` pode ficar lá (não atrapalha) ou deletar — tanto faz.

### 2) `src/lib/calculadora-nova/wizard-context.tsx`

No método `setTecnica`, quando remover estampas inválidas, disparar o toast.

Procurar o trecho que filtra `estampas` ao trocar técnica e, logo após o `setState` (ou equivalente), adicionar:

```ts
if (typeof window !== "undefined" && removidas > 0) {
  window.dispatchEvent(
    new CustomEvent("nort-toast", {
      detail: `${removidas} estampa${removidas > 1 ? "s" : ""} removida${removidas > 1 ? "s" : ""} (não cabe${removidas > 1 ? "m" : ""} em ${novaTecnica === "bordado" ? "bordado" : "DTF"}).`,
    })
  );
}
```

Onde `removidas` é a contagem de estampas que sumiram e `novaTecnica` é a técnica nova.

Se o código atual já remove silenciosamente sem contar, é só medir antes/depois:
```ts
const antes = state.estampas.length;
// ... filtro de remoção ...
const removidas = antes - novasEstampas.length;
```

## O que essa entrega faz

- Layout 3 colunas no desktop (140px fina + 1fr peça + 320px resumo), empilhado no mobile.
- Coluna fina mostra/esconde blocos conforme o tipo do produto (sublimação não tem cor/técnica, calça não tem manga/técnica, jeans não tem cor).
- Peça frente+costas em SVG quadrado 400x400 placeholder (silhueta básica). Posições dos "+" em % do viewBox — quando trocar pelo SVG real, manter mesmo viewBox que mantém a posição.
- Estados dos "+": fosco (livre) e aceso (com tamanho dentro). Bloqueados pela técnica somem.
- Clicar num "+" livre abre popover com 4 tamanhos (válidos em laranja, inválidos cinza com risco).
- Clicar num "+" aceso remove a estampa direto (até a 2b, que terá menu de ações).
- Lista de estampas adicionadas com pílulas removíveis.
- Quantidade com botões +/− e régua de faixa visual (com pino laranja deslizando).
- Mensagem de incentivo de faixa (já usa `mensagemFaixa(state)` do `pricing.ts`).
- Variação por produto: camiseta normal, sublimação (sem estampas, sem cor), calça (toggle bolso).
- Resumo navy sticky atualizando ao vivo. Botão "continuar →" vai pra step 3 (placeholder).
- Toast discreto na troca de técnica quando estampas são removidas.

## O que NÃO tem (vai na 2b)

- Radial animado em arco (popover é provisório).
- Animação de transição do "+" mudando de estado.
- Confirmação ao trocar técnica (só o toast por enquanto).
- Polimento mobile do resumo (vira rodapé fixo expansível).

## Fluxo de deploy

PC (PowerShell):
```powershell
cd C:\projetos\nort-dashboard
Expand-Archive -Path "$env:USERPROFILE\Downloads\tela2-2a.zip" -DestinationPath "$env:TEMP\tela2-2a" -Force
robocopy "$env:TEMP\tela2-2a\tela2-2a" "C:\projetos\nort-dashboard" /E
```

Depois aplicar as 2 edições pequenas listadas acima nos dois arquivos existentes.

Continuar:
```powershell
git status
```

(me manda esse status antes do commit)

```powershell
git add .
git commit -m "feat(calculadora-nova): tela 2 entrega 2a — esqueleto funcional"
git push
```

VPS (primeiro `ssh root@<host>`, depois roda isso):
```bash
cd /opt/nort/nort-dashboard
git pull
docker compose up -d --build
```

Testar em https://dashboard.nortsports.com.br/calculadora-nova
