FROM node:20-alpine

LABEL maintainer="ByeongMuk Lee <mansogod@gmail.com>"
LABEL version="0.2"
LABEL description="next js 14 image for app (turborepo)"
LABEL build_date="2025-03-05"

WORKDIR /var/www
COPY . .
RUN npm install

CMD ["npx", "turbo", "run", "dev", "--filter=@repo/web"]
