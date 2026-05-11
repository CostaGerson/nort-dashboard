# DEPLOY — Fase 0 (passo a passo)

Leia uma vez de ponta a ponta antes de começar. Vai dar tudo certo.

> **Legenda:**
> 🖥️ **PC** = PowerShell no seu Windows
> 🌐 **VPS** = terminal SSH conectado à VPS
> 🎛️ **CloudPanel** = painel web do CloudPanel

---

## PARTE 1 — Preparar no PC (uma vez só)

### 1.1 Extrair o ZIP

1. Extraia `nort-dashboard.zip` na pasta dos seus projetos.
   Sugestão: `C:\projetos\nort-dashboard`
2. Abra o PowerShell **dentro** dessa pasta.
   (No Windows Explorer: Shift + clique direito → "Abrir janela do PowerShell aqui")

### 1.2 Criar repositório no GitHub

1. Vá em https://github.com/new
2. Nome do repositório: `nort-dashboard`
3. Marque como **Private**.
4. **NÃO** marque "Add README", "Add .gitignore" nem "Add license" — deixe vazio.
5. Clique em **Create repository**.
6. Na tela seguinte, copie a URL do tipo: `https://github.com/SEU-USUARIO/nort-dashboard.git`

### 1.3 Subir para o GitHub (🖥️ PC)

No PowerShell, dentro da pasta `nort-dashboard`, cole **um por vez**:

```powershell
git init
git add .
git commit -m "Fase 0 - esqueleto do dashboard"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/nort-dashboard.git
git push -u origin main
```

> Troque `SEU-USUARIO` pelo seu usuário do GitHub.
> Vai pedir login na primeira vez — use a janela que abrir.

---

## PARTE 2 — Configurar no CloudPanel (🎛️)

> Vamos criar um **site reverse proxy** no CloudPanel que aponta para a porta interna `3120` onde o app vai rodar.

### 2.1 Apontar o domínio (DNS na Hostinger)

1. Painel da Hostinger → DNS do `nortsports.com.br`.
2. Adicione um registro:
   - Tipo: **A**
   - Nome: **dashboard**
   - Valor: **IP da sua VPS**
   - TTL: padrão
3. Salve. O DNS pode levar de 1 minuto a 1 hora pra propagar.

### 2.2 Criar o site no CloudPanel

1. CloudPanel → **+ Add Site**.
2. Escolha **Create a Reverse Proxy**.
3. Preencha:
   - **Domain name:** `dashboard.nortsports.com.br`
   - **Reverse Proxy URL:** `http://127.0.0.1:3120`
   - **Site User:** pode deixar o padrão sugerido.
4. **Create**.

### 2.3 Ativar HTTPS (Let's Encrypt)

1. Clique no site recém-criado.
2. Aba **SSL/TLS** → **Actions** → **New Let's Encrypt Certificate**.
3. Aguarde — deve levar uns segundos.

> Se der erro de SSL, é DNS ainda não propagado. Espere uns minutos e tente de novo.

---

## PARTE 3 — Deploy na VPS (🌐)

### 3.1 Conectar via SSH (🖥️ PC)

No PowerShell:

```powershell
ssh root@IP-DA-SUA-VPS
```

A partir daqui, todos os comandos são na **VPS**.

### 3.2 Clonar o projeto (🌐 VPS)

```bash
mkdir -p /opt/nort
cd /opt/nort
git clone https://github.com/SEU-USUARIO/nort-dashboard.git
cd nort-dashboard
```

> Se o repositório é privado, vai pedir credenciais. Use um **Personal Access Token** do GitHub no lugar da senha.
> (GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → marque `repo`.)

### 3.3 Criar o arquivo `.env` (🌐 VPS)

```bash
cp .env.example .env
```

Gere um segredo aleatório para autenticação:

```bash
openssl rand -hex 32
```

Copie o valor gerado. Agora abra o `.env`:

```bash
nano .env
```

Edite assim:

```
POSTGRES_USER=nort
POSTGRES_PASSWORD=COLE_AQUI_UMA_SENHA_FORTE_QUALQUER
POSTGRES_DB=nortdb

AUTH_SECRET=COLE_AQUI_O_VALOR_GERADO_PELO_OPENSSL
NEXTAUTH_URL=https://dashboard.nortsports.com.br
```

Salvar e sair: `Ctrl + O`, `Enter`, depois `Ctrl + X`.

### 3.4 Subir os containers (🌐 VPS)

```bash
docker compose up -d --build
```

Espere terminar (1ª vez demora alguns minutos — está baixando e construindo a imagem).

Confira que está rodando:

```bash
docker compose ps
```

Deve mostrar `nort-dashboard-app` e `nort-dashboard-db` como `running` / `healthy`.

### 3.5 Aplicar a estrutura do banco (🌐 VPS)

```bash
docker compose exec app npx prisma@5.22.0 db push
```

### 3.6 Criar os usuários iniciais (🌐 VPS)

```bash
docker compose exec app node scripts/seed.js
```

Deve aparecer:

```
🌱 Seeding users...
  ✓ GERSONCOSTA
  ✓ IGOR
  ✓ TAVARES
  ✓ MAYCON
✅ Done.
```

### 3.7 Testar

Abra no navegador:
👉 https://dashboard.nortsports.com.br

Você verá a tela de login.
Usuário: `GERSONCOSTA` — Senha: `356241`.

---

## DEPOIS — comandos úteis (cola e usa)

### Ver logs do app (🌐 VPS)

```bash
cd /opt/nort/nort-dashboard
docker compose logs -f app
```

`Ctrl + C` para sair dos logs.

### Atualizar para uma nova versão (fluxo padrão)

🖥️ **PC** (depois de extrair o novo ZIP em cima da pasta antiga):

```powershell
git add .
git commit -m "Descrição da mudança"
git push
```

🌐 **VPS:**

```bash
cd /opt/nort/nort-dashboard
git pull
docker compose up -d --build
```

### Reiniciar o app (🌐 VPS)

```bash
docker compose restart app
```

### Parar tudo (🌐 VPS)

```bash
docker compose down
```

### Adicionar / trocar senha de um usuário (🌐 VPS)

Edite `scripts/seed.js` no PC, suba pro Git, e rode de novo na VPS:

```bash
docker compose exec app node scripts/seed.js
```

O seed atualiza senhas existentes.

---

## Se algo der errado

| Sintoma | O que rodar e me mandar |
|---|---|
| Site não abre | `docker compose ps` e `docker compose logs --tail=80 app` |
| Login não funciona | `docker compose logs --tail=80 app` |
| SSL com erro | Esperar 5 min e tentar emitir de novo no CloudPanel |
| Porta ocupada | `sudo ss -tlnp \| grep 3120` |
