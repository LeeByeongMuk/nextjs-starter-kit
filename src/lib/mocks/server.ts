import { createMiddleware } from '@mswjs/http-middleware';
import cors from 'cors';
import express from 'express';

import { handlers } from '@lib/mocks/handlers';

const app = express();
const port = process.env.APP_API_PORT || 9090;

app.use(
  cors({
    origin: '*', // 테스트용으로 모든 Origin 허용
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(express.json());
app.use(createMiddleware(...handlers));
app.listen(port, () => console.log(`Mock server is running on port: ${port}`));
