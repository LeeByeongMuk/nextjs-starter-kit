import cors from 'cors';
import express from 'express';
import 'dotenv/config';

import postsRouter from '@/server/routes/posts_routes';
import usersRouter from '@/server/routes/users_routes';

const app = express();
const port = process.env.APP_API_PORT || 80;

const corsOptions = {
  origin: '*',
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.listen(port);
