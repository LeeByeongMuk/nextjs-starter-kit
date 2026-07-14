import { createMiddleware } from '@mswjs/http-middleware';
import { handlers } from '@shared/api/mocks/handlers';
import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.APP_API_PORT || 9090;

app.use(
  cors({
    // 로컬 개발 전용 서버 — localhost 계열 Origin만 허용
    origin: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(express.json());
app.use(createMiddleware(...handlers));
app.listen(port, () => console.log(`Mock server is running on port: ${port}`));
