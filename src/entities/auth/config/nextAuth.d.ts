import { DefaultSession } from 'next-auth';

import { UserData } from '@entities/auth';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
