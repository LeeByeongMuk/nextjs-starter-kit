import { UserData } from '@entities/auth/api/types';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
