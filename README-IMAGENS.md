# Fix das imagens — Calculadora

## O que tem nesse ZIP

```
public/
  calculadora/
    base/        (8 mockups base — camisetas, calças, cor especial)
    stamps/      (26 marcações de estampa por posição/tamanho)
src/
  lib/
    calculadora/
      constants.ts   (atualizado com os caminhos locais)
```

Total: **34 imagens** + 1 arquivo atualizado.

---

## Passo 1 — No PC (PowerShell)

```powershell
cd C:\projetos\nort-dashboard
```

Extrai o ZIP nessa pasta. Vai criar/atualizar:
- `public\calculadora\base\` (8 imagens novas)
- `public\calculadora\stamps\` (26 imagens novas)
- `src\lib\calculadora\constants.ts` (sobrescreve o atual)

Confirma que tudo chegou:

```powershell
dir public\calculadora\base
dir public\calculadora\stamps
```

Tem que aparecer 8 arquivos em `base\` e 26 em `stamps\`.

---

## Passo 2 — Subir pro GitHub

```powershell
git add .
git status
```

Confere que o `git status` mostra:
- `modified: src/lib/calculadora/constants.ts`
- 34 imagens novas em `public/calculadora/`

Depois:

```powershell
git commit -m "fix(fase1): imagens locais da calculadora"
git push
```

---

## Passo 3 — Deploy na VPS

```bash
cd /opt/nort/nort-dashboard
git pull
docker compose up -d --build
```

---

## Como testar

Abre `dashboard.nortsports.com.br/calculadora`:

1. Seleciona **Camiseta Malha PV** → tem que aparecer a camisa preta (frente e costas)
2. Troca a cor pra **Branco** → camisa muda pra branca
3. Adiciona personalização **Frente / Centro / 2×10** → aparece o quadradinho laranja no peito
4. Adiciona **Costas / Topo / 10×15** → aparece o retângulo laranja no topo das costas
5. Seleciona **Calça Brim** → muda pro mockup da calça
6. Seleciona **Calça Jeans** → muda pro mockup do jeans
7. Seleciona **Sublimação total** ou **Cor especial** → aparece o mockup colorido

Se tudo carregou, está pronto.
