import { postHandler } from '@shared/api/mocks/handlers/postHandler';
import { userHandler } from '@shared/api/mocks/handlers/userHandler';

export const handlers = [...userHandler, ...postHandler];
