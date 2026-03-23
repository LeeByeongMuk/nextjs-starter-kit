import { UserData } from '@domains/auth/_types/api';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
