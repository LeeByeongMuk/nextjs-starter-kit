import { postHandler } from '@lib/mocks/handlers/postHandler';
import { userHandler } from '@lib/mocks/handlers/userHandler';

export const handlers = [...userHandler, ...postHandler];
