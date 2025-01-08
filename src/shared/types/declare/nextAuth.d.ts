import { DefaultSession } from 'next-auth';

import { UserData } from '@domains/auth/_types/api';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
