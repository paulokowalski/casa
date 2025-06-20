# Etapa de build
FROM node:20-alpine AS build

WORKDIR /app

# Copiar arquivos de manifesto primeiro
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci --omit=dev --legacy-peer-deps

# Copiar o restante do código fonte
COPY . .

# Construir aplicação
RUN npm run build

# Etapa de produção
FROM nginx:1.25-alpine

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build do React
COPY --from=build /app/build /usr/share/nginx/html

# Expor porta
EXPOSE 3000

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]