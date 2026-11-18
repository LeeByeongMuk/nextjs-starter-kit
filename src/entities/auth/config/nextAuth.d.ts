import { DefaultSession } from 'next-auth';

import { UserData } from '../api/types';

declare module 'next-auth' {
  interface User {
    nickname?: string;
    sessionExpiresAt?: number;
  }

  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
