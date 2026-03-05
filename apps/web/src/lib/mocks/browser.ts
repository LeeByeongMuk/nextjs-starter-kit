import { setupWorker } from 'msw/browser';

import { handlers } from '@lib/mocks/handlers';

const worker = setupWorker(...handlers);

export default worker;
