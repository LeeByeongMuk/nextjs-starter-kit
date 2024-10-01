# Next.js Starter Kit

## Description

Next.js app router 를 활용해 자체 로그인 및 게시판 기능을 구현해놓은 템플릿입니다.

### FE
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React-Query
- React-Hook-Form
- Jest

### BE
- Express
- MySQL
- prisma

## Run the Development Server

docker 를 사용해 로컬 환경을 구축합니다.
- https://www.docker.com/products/docker-desktop

```bash
npm install
cp .env.example .env
docker compose up -d
docker-compose exec express-js npx prisma migrate deploy # DB 마이그레이션
```
