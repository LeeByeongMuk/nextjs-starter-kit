FROM node:20-alpine

WORKDIR /fe

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]