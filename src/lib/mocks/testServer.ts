import { setupServer } from 'msw/node';

import { handlers } from '@lib/mocks/handlers';

export const server = setupServer(...handlers);
