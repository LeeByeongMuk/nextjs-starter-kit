import { setupWorker } from 'msw/browser';

import { handlers } from '@lib/mocks/handlers';

export const worker = setupWorker(...handlers);
