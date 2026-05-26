# Fix da Entrega 2a — bugs de encoding, slider arrastável, radial

## O que está sendo trocado

Arquivos REESCRITOS (mesmo caminho, sobrescreve):
- `src/app/calculadora-nova/components/tela2/ColunaFina.tsx`
- `src/app/calculadora-nova/components/tela2/ColunaPeca.tsx`
- `src/app/calculadora-nova/components/tela2/ColunaResumo.tsx`

Arquivo NOVO:
- `src/app/calculadora-nova/components/tela2/RadialTamanhos.tsx`

Arquivo para DELETAR:
- `src/app/calculadora-nova/components/tela2/PopoverTamanhos.tsx`

## O que muda

1. **Encoding corrigido** — todos os acentos voltam ao normal (ç, ã, é, "—" etc).
2. **Radial animado** — clicar num "+" agora abre 4 chips em arco em volta do "+" clicado (não é mais modal). Tamanhos bloqueados pela técnica aparecem acinzentados com risco.
3. **Slider arrastável** — agora dá pra arrastar o pino com o mouse, e clicar nas marcas (1, 6, 11-19, 20+) pula direto pra essa quantidade.
4. **Label visível** — o radial mostra o nome da posição flutuando acima do botão central, então sempre fica claro qual posição está sendo configurada.

## Comando PowerShell pra aplicar

```powershell
cd C:\projetos\nort-dashboard
Expand-Archive -Path "$env:USERPROFILE\Downloads\tela2-2a-fix.zip" -DestinationPath "$env:TEMP\tela2-2a-fix" -Force
robocopy "$env:TEMP\tela2-2a-fix\tela2-2a-fix" "C:\projetos\nort-dashboard" /E

# Deletar o popover antigo (não é mais usado)
Remove-Item "src\app\calculadora-nova\components\tela2\PopoverTamanhos.tsx" -Force

git status
```

Me manda o `git status`.
