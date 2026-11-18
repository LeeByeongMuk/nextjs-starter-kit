FROM node:26.13.1-alpine

WORKDIR /var/www
COPY package.json package-lock.json ./
COPY scripts/patch-toast-ui.mjs ./scripts/patch-toast-ui.mjs
RUN HUSKY=0 npm ci
COPY . .

CMD ["npm", "run", "dev"]
