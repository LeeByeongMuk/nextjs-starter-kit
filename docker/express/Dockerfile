FROM node:20-alpine

LABEL maintainer="ByeongMuk Lee <mansogod@gmail.com>"
LABEL version="0.1"
LABEL description="express js image for app"
LABEL build_date="2024-10-01"

WORKDIR /var/www
COPY . .
RUN npm install

CMD ["npm", "run", "server"]