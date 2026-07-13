import { handlers } from '@shared/api/mocks/handlers';
import { setupWorker } from 'msw/browser';

const worker = setupWorker(...handlers);

export default worker;
