FROM node:17-alpine

WORKDIR /app

COPY package.json .

RUN npm install react-scripts --save

COPY . .

EXPOSE 3000

CMD ["npm", "start"]