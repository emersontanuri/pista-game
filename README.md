# Pista!

Jogo brasileiro de descobrir respostas por dicas, construído em Nuxt 4 para um controlador conduzir partidas na mesma tela.

## Desenvolvimento
`npm install`, copie `.env.example` para `.env`, preencha `OPENAI_API_KEY` e rode `npm run dev`.

## Produção
`npm run build` e `npm run preview`, ou `docker compose up -d`.

`OPENAI_MODEL` configura o modelo e usa `gpt-4o-mini` por padrão. A chave é privada, usada somente na rota Nitro `/api/cards`. `/api/health` retorna `{ "status": "ok" }`.

O estado do jogo fica em `localStorage` na chave `perfilGameState`. As cartas ficam em SQLite (`PERFIL_DATABASE_PATH`), com fallback automático quando a IA falha. O endpoint limita 10 requisições por IP a cada 10 minutos em memória, portanto o limite não é global entre múltiplas instâncias.

## Testes
`npm run typecheck` e `npm test`.

## Carga inicial
Categorias, dificuldades e subcategorias são criadas automaticamente quando o banco é aberto. As cartas não são carregadas no startup: dentro do container, execute `docker compose exec perfil npm run seed` para carregar o catálogo preservando os dados existentes. Para apagar os dados atuais antes da carga, use `docker compose exec perfil npm run seed:reset`. O script também aceita a flag `--reset` quando executado diretamente (`npm exec -- tsx server/scripts/seed.ts --reset`).
