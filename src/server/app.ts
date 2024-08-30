import cors from 'cors';
import express from 'express';
import 'dotenv/config';

import postsRouter from '@/server/routes/posts';
import usersRouter from '@/server/routes/users';

const app = express();
const port = process.env.APP_API_PORT || 80;

const corsOptions = {
  origin: '*',
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use('/users', usersRouter);
app.use('/posts', postsRouter);

app.listen(port, () => {
  console.info(`Server is listening on port ${port}`);
});
