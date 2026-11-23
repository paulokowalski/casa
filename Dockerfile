# node:26-slim: a mesma imagem dos testes do commit e do e2e (uma imagem do node só no disco, em vez de três)
FROM node:26-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

# cache do npm entre builds (BuildKit): sem mudança no package-lock, nada é baixado de novo
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.30-alpine

RUN apk add --no-cache curl

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    # /var/run é um atalho para /run: o nginx grava o pid em /run/nginx.pid e precisa poder escrever lá
    touch /run/nginx.pid && chown -R nextjs:nodejs /run /run/nginx.pid

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]