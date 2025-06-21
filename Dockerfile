# Etapa de build
FROM node:18-alpine AS build

WORKDIR /app

# Copiar arquivos de manifesto primeiro
COPY package.json package-lock.json ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci --legacy-peer-deps

# Copiar o restante do código fonte
COPY . .

# Construir aplicação
RUN npm run build

# Etapa de produção
FROM nginx:1.25-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do React
COPY --from=build /app/build /usr/share/nginx/html

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Mudar permissões dos arquivos
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Mudar para usuário não-root
USER nextjs

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]