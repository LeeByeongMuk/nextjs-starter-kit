FROM node:20-alpine

LABEL maintainer="ByeongMuk Lee <mansogod@gmail.com>"
LABEL version="0.2"
LABEL description="mock api image for app (turborepo)"
LABEL build_date="2025-03-05"

WORKDIR /var/www
COPY . .
RUN npm install

CMD ["npm", "run", "mock", "--workspace=@repo/web"]
