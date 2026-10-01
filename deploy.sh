#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-pista-game}"
REPOSITORY_DIR="${REPOSITORY_DIR:-$SCRIPT_DIR/pista-game}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPOSITORY_DIR/docker-compose.yml}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-master}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:8104/}"
MAX_RETRIES="${MAX_RETRIES:-20}"
RETRY_DELAY="${RETRY_DELAY:-5}"

compose() {
  docker compose \
    --project-name "$COMPOSE_PROJECT_NAME" \
    --file "$COMPOSE_FILE" \
    "$@"
}

update_repository() {
  if [[ ! -d "$REPOSITORY_DIR/.git" ]]; then
    echo "Erro: o repositório não foi encontrado em: $REPOSITORY_DIR" >&2
    exit 1
  fi

  echo "Atualizando o repositório ($DEPLOY_BRANCH)..."
  git -C "$REPOSITORY_DIR" fetch origin "$DEPLOY_BRANCH"
  git -C "$REPOSITORY_DIR" checkout "$DEPLOY_BRANCH"
  git -C "$REPOSITORY_DIR" pull --ff-only origin "$DEPLOY_BRANCH"
}

wait_for_url() {
  echo "Aguardando a aplicação ficar disponível em $HEALTHCHECK_URL..."

  for ((attempt = 1; attempt <= MAX_RETRIES; attempt++)); do
    if curl --fail --silent --show-error --max-time 5 "$HEALTHCHECK_URL" >/dev/null 2>&1; then
      echo "Aplicação disponível."
      return 0
    fi

    echo "Tentativa $attempt/$MAX_RETRIES falhou; aguardando ${RETRY_DELAY}s..."
    sleep "$RETRY_DELAY"
  done

  echo "Erro: a aplicação não ficou disponível a tempo." >&2
  return 1
}

echo "==============================="
echo "INICIANDO DEPLOY $(date)"
echo "==============================="

if ! command -v docker >/dev/null 2>&1; then
  echo "Erro: Docker não está instalado ou não está no PATH." >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Erro: curl não está instalado ou não está no PATH." >&2
  exit 1
fi

update_repository

echo "Validando docker-compose.yml..."
compose config --quiet

echo "Construindo a imagem..."
compose build --pull

echo "Publicando a aplicação..."
compose up -d --remove-orphans

if ! wait_for_url; then
  echo "================================"
  echo "FALHA NO DEPLOY"
  echo "================================"
  compose ps
  echo "Logs recentes:"
  compose logs --tail=100 pista-game
  exit 1
fi

echo "Status dos serviços:"
compose ps

echo "==============================="
echo "DEPLOY FINALIZADO COM SUCESSO!"
echo "==============================="
