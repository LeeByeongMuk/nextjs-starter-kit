import { handlers } from '@shared/api/mocks/handlers';
import { setupServer } from 'msw/node';

export const server = setupServer(...handlers);
