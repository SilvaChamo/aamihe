# AAMIHE

Projeto Next.js autónomo para hospedar o clone HTML do site AAMIHE na Vercel e manter um painel simples de notícias.

## Como funciona

- O site clonado fica preservado em `public/cloned/aamihe.com`.
- O Next.js serve esse HTML pela raiz do domínio, por exemplo `/`, `/en/`, `/fr/` e outros caminhos clonados.
- O painel de gestão fica em `/admin/news`.
- As notícias são carregadas pelo script `aamihe-news.js` através da API `/api/public/site-news`.

## Configuração

Crie as variáveis abaixo na Vercel ou num `.env.local` local:

```bash
NEXT_PUBLIC_SITE_URL=https://aamihe.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AAMIHE_ADMIN_SECRET=
OPENAI_API_KEY=
```

`OPENAI_API_KEY` é opcional. Sem essa chave, o painel publica a notícia em Português como fallback também para Inglês e Francês.

## Desenvolvimento

```bash
npm install
npm run dev
```

Depois abra:

- `http://localhost:3003` para ver o site.
- `http://localhost:3003/admin/news` para gerir notícias.

## Sobre HTML + Next.js na Vercel

É possível hospedar HTML na Vercel e ainda usar funcionalidades Next.js no mesmo projeto. A parte HTML pode ficar em `public` ou ser servida por uma rota Next.js, e o Next.js pode fornecer painel, APIs, autenticação, banco de dados, uploads e conteúdo dinâmico por JavaScript.
