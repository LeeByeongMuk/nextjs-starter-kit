FROM node:20-alpine

LABEL maintainer="ByeongMuk Lee <mansogod@gmail.com>"
LABEL version="0.1"
LABEL description="mock api image for app"
LABEL build_date="2025-01-14"

WORKDIR /var/www
COPY . .
RUN npm install

CMD ["npm", "run", "mock"]
