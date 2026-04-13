import { setupWorker } from 'msw/browser';

import { handlers } from '@shared/api/mocks/handlers';

const worker = setupWorker(...handlers);

export default worker;
