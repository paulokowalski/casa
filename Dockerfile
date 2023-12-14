FROM node:17

RUN mkdir -p /usr/src/app

RUN chmod -R +x /usr/src/app

COPY . /usr/src/app

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]