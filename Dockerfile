FROM node:17-alpine

WORKDIR /app

COPY package.json .

USER root
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY . .

EXPOSE 3000

CMD ["npm", "start"]