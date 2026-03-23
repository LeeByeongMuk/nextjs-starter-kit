import { handlers } from '@lib/mocks/handlers';
import { setupServer } from 'msw/node';

export const server = setupServer(...handlers);
