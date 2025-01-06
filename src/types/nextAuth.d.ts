import { DefaultSession } from 'next-auth';

import { UserData } from '@/types/api/auth';

declare module 'next-auth' {
  interface Session {
    user: UserData & DefaultSession['user'];
  }
}
