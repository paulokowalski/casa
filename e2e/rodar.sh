#!/usr/bin/env bash
# Testes de ponta a ponta da tela (Playwright, e2e/testes).
#
# Sobe numa rede Docker isolada: PostgreSQL 18 com a estrutura do banco (sem dados) e um MariaDB vazio, a casa-api
# (imagem local "casa-api", a mesma que roda no servidor) ligada a eles, o site gerado do código atual servido pelo
# nginx com o nginx.conf do projeto, e o navegador do Playwright (celular e computador). Apaga tudo no fim.
# Não toca nos bancos nem nos containers de produção.
#
# A estrutura do banco vem do projeto casa-api: CASA_API_DIR (padrão /opt/projetos/casa-api).
# Uso, na raiz do projeto:  npm run e2e   (ou bash e2e/rodar.sh)
set -euo pipefail

RAIZ=$(cd "$(dirname "$0")/.." && pwd)
CASA_API_DIR=${CASA_API_DIR:-/opt/projetos/casa-api}
# node_modules: o da cópia (se houver) ou o do repositório (o hook testa uma cópia sem node_modules)
MODULOS=${E2E_NODE_MODULES:-$RAIZ/node_modules}
[ -d "$MODULOS" ] || MODULOS=$(git -C "$RAIZ" rev-parse --show-toplevel 2>/dev/null)/node_modules
PLAYWRIGHT=$(grep -oP '"@playwright/test": "\K[0-9.]+' "$RAIZ/package.json")
ID=$(date +%s)-$$
REDE=casa-e2e-$ID
PG=casa-e2e-pg-$ID
MDB=casa-e2e-mdb-$ID
API=casa-e2e-api-$ID
WEB=casa-e2e-web-$ID
SENHA=e2e-$RANDOM$RANDOM
SAIDA=$RAIZ/e2e/.saida

for f in estrutura.sql dados.sql; do
  [ -f "$CASA_API_DIR/src/test/resources/e2e/$f" ] || { echo "E2E: falta $CASA_API_DIR/src/test/resources/e2e/$f (CASA_API_DIR)" >&2; exit 1; }
done
[ -d "$MODULOS/@playwright/test" ] || { echo "E2E: @playwright/test não instalado em $MODULOS (rode npm ci)" >&2; exit 1; }
docker image inspect casa-api >/dev/null 2>&1 || { echo "E2E: imagem casa-api não existe (docker compose build no casa-api)" >&2; exit 1; }

limpar() {
  if [ "${E2E_MANTER:-}" != 1 ]; then
    docker rm -f "$PG" "$MDB" "$API" "$WEB" >/dev/null 2>&1 || true
    docker network rm "$REDE" >/dev/null 2>&1 || true
  fi
}
trap limpar EXIT

esperar() { # esperar "descrição" segundos comando...
  local d=$1 s=$2; shift 2
  for _ in $(seq 1 "$s"); do "$@" >/dev/null 2>&1 && return 0; sleep 1; done
  echo "E2E: $d não ficou pronto em $s s" >&2
  return 1
}

rm -rf "$SAIDA"
mkdir -p "$SAIDA"

echo "E2E: gerando o site..."
docker run --rm -e CI=1 -e npm_config_update_notifier=false -e VITE_API_BASE_URL=/casa-api/ -v "$RAIZ:/app" \
  -v "$MODULOS:/app/node_modules:ro" --tmpfs /app/node_modules/.vite-temp --tmpfs /app/node_modules/.vite -w /app \
  node:26-slim npx vite build --outDir e2e/.saida/site --emptyOutDir --logLevel warn

echo "E2E: subindo bancos de teste, casa-api e site..."
docker network create "$REDE" >/dev/null
docker run -d --name "$PG" --network "$REDE" -e POSTGRES_PASSWORD="$SENHA" -e POSTGRES_DB=casa \
  --tmpfs /var/lib/postgresql postgres:18 >/dev/null
docker run -d --name "$MDB" --network "$REDE" -e MARIADB_ROOT_PASSWORD="$SENHA" -e MARIADB_DATABASE=casa_monitor \
  -e MARIADB_USER=casa_monitor -e MARIADB_PASSWORD="$SENHA" --tmpfs /var/lib/mysql mariadb:11.8 >/dev/null
esperar "PostgreSQL" 90 docker exec "$PG" psql -U postgres -d casa -h 127.0.0.1 -tAc 'select 1'
for f in estrutura.sql dados.sql; do
  docker exec -i "$PG" psql -q -U postgres -d casa -h 127.0.0.1 -v ON_ERROR_STOP=1 \
    < "$CASA_API_DIR/src/test/resources/e2e/$f" >/dev/null
done
esperar "MariaDB" 90 docker exec "$MDB" mariadb -ucasa_monitor -p"$SENHA" casa_monitor -e 'select 1'

# o nginx.conf do projeto manda /casa-api/ para "casa-api:8080": o container da API atende por esse nome na rede.
# A pasta de fotos e exames ganha o arquivo de marcação depois que a API sobe (o teste envia um exame).
docker run -d --name "$API" --network "$REDE" --network-alias casa-api \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://$PG:5432/casa" -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD="$SENHA" \
  -e MONITOR_DATASOURCE_URL="jdbc:mariadb://$MDB:3306/casa_monitor" -e MONITOR_DATASOURCE_USERNAME=casa_monitor \
  -e MONITOR_DATASOURCE_PASSWORD="$SENHA" \
  -e JWT_SECRET="e2e-segredo-do-jwt-com-mais-de-32-caracteres-$SENHA" \
  -e AUTH_ADMIN_EMAIL=admin@e2e.local -e AUTH_ADMIN_SENHA="admin-$SENHA" -e API_KEY="chave-e2e-$SENHA" \
  -e CORS_URL="http://web:3000" -e CRESCIMENTO_FOTOS_DIRETORIO=/tmp/fotos-e2e casa-api >/dev/null
docker run -d --name "$WEB" --network "$REDE" --network-alias web \
  -v "$SAIDA/site:/usr/share/nginx/html:ro" -v "$RAIZ/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:1.30-alpine >/dev/null
if ! esperar "casa-api" 150 docker exec "$API" sh -c 'wget -qO- http://127.0.0.1:8080/casa-api/actuator/health | grep -q UP'; then
  docker logs --tail 60 "$API" >&2
  exit 1
fi
docker exec "$API" sh -c 'mkdir -p /tmp/fotos-e2e && touch /tmp/fotos-e2e/.armazenamento-crescimento'

echo "E2E: rodando os testes no navegador (Playwright $PLAYWRIGHT)..."
docker run --rm --network "$REDE" --ipc=host -e CI=1 -e E2E_URL=http://web:3000 \
  -e E2E_EMAIL=admin@e2e.local -e E2E_SENHA="admin-$SENHA" -e E2E_API_KEY="chave-e2e-$SENHA" \
  -v "$RAIZ:/app" -v "$MODULOS:/app/node_modules:ro" -w /app \
  "mcr.microsoft.com/playwright:v$PLAYWRIGHT-noble" npx playwright test "$@"
echo "E2E: ok"
