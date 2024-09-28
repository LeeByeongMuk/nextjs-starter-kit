FROM node:20-alpine

LABEL maintainer="ByeongMuk Lee <mansogod@gmail.com>"
LABEL version="0.1"
LABEL description="express js 4 image for app"
LABEL build_date="2024-10-01"

WORKDIR /var/www
COPY . .
RUN npm install && npx prisma migrate dev

CMD ["npm", "run", "server"]
