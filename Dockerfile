FROM node:20-alpine

WORKDIR /src/app

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]