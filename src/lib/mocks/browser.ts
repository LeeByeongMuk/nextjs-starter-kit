import { handlers } from '@lib/mocks/handlers';
import { setupWorker } from 'msw/browser';

const worker = setupWorker(...handlers);

export default worker;
