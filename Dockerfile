FROM node:17

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm config set timeout 60000

RUN npm cache clean --force

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]