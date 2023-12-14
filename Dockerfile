FROM node:17

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

CMD ["npm", "start", "/app/docker-entrypoint.sh"]