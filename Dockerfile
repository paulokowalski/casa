FROM node:17-alpine

WORKDIR /app

COPY package.json .

RUN ["chmod", "+x", "/usr/src/app/docker-entrypoint.sh"]

COPY . .

EXPOSE 3000

CMD ["npm", "start"]