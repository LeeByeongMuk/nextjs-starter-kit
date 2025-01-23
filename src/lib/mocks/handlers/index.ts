import { delay, http } from 'msw';

import { postHandler } from '@lib/mocks/handlers/postHandler';
import { userHandler } from '@lib/mocks/handlers/userHandler';

export const handlers = [
  http.all('*', async () => {
    await delay(1000);
  }),
  ...userHandler,
  ...postHandler,
];
